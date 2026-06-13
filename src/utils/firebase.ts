import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider with Google Drive readonly scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

// Auth states & cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need to be re-obtained or we can just keep state
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign-in pop-up handler
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to extract Google access token from Firebase credential.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Firebase Google authentication error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve loaded token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Log out handler
export const logoutDrive = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * Fetches image files from the authenticated user's Google Drive.
 */
export async function fetchDriveImages(token: string): Promise<any[]> {
  try {
    const query = encodeURIComponent("mimeType contains 'image/' and trashed = false");
    const fields = "files(id,name,thumbnailLink,webContentLink,mimeType,size)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=30`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (err) {
    console.error('Error fetching files from Google Drive:', err);
    throw err;
  }
}

/**
 * Downloads a Google Drive image file and converts it into a Base64 string.
 */
export async function downloadDriveImageAsBase64(fileId: string, token: string): Promise<string> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download image file. Status: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error downloading image media from Google Drive:', err);
    throw err;
  }
}
