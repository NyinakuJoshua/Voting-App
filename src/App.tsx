import React, { useState, useEffect } from 'react';
// @ts-ignore
import image1 from './components/image1.jpg';
// @ts-ignore
import image2 from '../images/image2.jpg';
// @ts-ignore
import image3 from '../images/image3.jpg';
// @ts-ignore
import image4 from '../images/image4.jpg';
import { 
  User, 
  UserRole, 
  Election, 
  Position, 
  Candidate, 
  Block, 
  AuditLog,
  Department
} from './types';
import { 
  SEED_USERS, 
  SEED_ELECTIONS, 
  SEED_POSITIONS, 
  SEED_CANDIDATES, 
  getInitialBlocks, 
  SEED_LOGS 
} from './seed';
import { createLog } from './utils/crypto';
import VoterPanel from './components/VoterPanel';
import AdminPanel from './components/AdminPanel';
import OfficerPanel from './components/OfficerPanel';
import StatisticsDashboard from './components/StatisticsDashboard';
import ElectionCountdown from './components/ElectionCountdown';
import { 
  ShieldCheck, 
  Users, 
  BarChart4, 
  Lock, 
  Vote, 
  CircleAlert, 
  LogOut, 
  Fingerprint, 
  Building,
  KeyRound,
  Eye,
  Menu,
  X,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // --- Persistent Storage State Synced with LocalStorage ---
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('voting_system_users');
    return local ? JSON.parse(local) : SEED_USERS;
  });

  const [elections, setElections] = useState<Election[]>(() => {
    const local = localStorage.getItem('voting_system_elections');
    return local ? JSON.parse(local) : SEED_ELECTIONS;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const local = localStorage.getItem('voting_system_positions');
    return local ? JSON.parse(local) : SEED_POSITIONS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const local = localStorage.getItem('voting_system_candidates');
    return local ? JSON.parse(local) : SEED_CANDIDATES;
  });

  const [blocks, setBlocks] = useState<Block[]>(() => {
    const local = localStorage.getItem('voting_system_blocks');
    return local ? JSON.parse(local) : getInitialBlocks();
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const local = localStorage.getItem('voting_system_logs');
    return local ? JSON.parse(local) : SEED_LOGS;
  });

  // Active Session states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('voting_system_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App Level Navigation & UI tabs
  const [activePortal, setActivePortal] = useState<'launchpad' | 'voter' | 'ec_staff' | 'dashboard'>('launchpad');
  const [ecStaffMode, setEcStaffMode] = useState<'login' | 'admin' | 'officer'>('login');
  
  // Officer/Admin login form within staff portal
  const [staffIdInput, setStaffIdInput] = useState('');
  const [staffPassInput, setStaffPassInput] = useState('');
  const [staffLoginErr, setStaffLoginErr] = useState('');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [customBgs, setCustomBgs] = useState(() => {
    const local = localStorage.getItem('voting_system_customBgs');
    if (local) {
      const parsed = JSON.parse(local);
      // Let's make sure we always override with the newly imported .jpg images if the saved values are fallback or old png structures.
      if (!parsed.launchpad || parsed.launchpad.includes('unsplash.com') || parsed.launchpad.includes('.png') || parsed.launchpad.includes('/assets/')) {
        return {
          launchpad: image2,
          accessBallot: image1,
          activePortfolio: image3,
          activePolls: image4
        };
      }
      return parsed;
    }
    return {
      launchpad: image2,
      accessBallot: image1,
      activePortfolio: image3,
      activePolls: image4
    };
  });

  useEffect(() => {
    localStorage.setItem('voting_system_customBgs', JSON.stringify(customBgs));
  }, [customBgs]);

  // Light and Dark Mode State Manager
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('voting_system_themeMode') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('voting_system_themeMode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Sync state to local storage after any updates
  useEffect(() => {
    localStorage.setItem('voting_system_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('voting_system_elections', JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    localStorage.setItem('voting_system_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('voting_system_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('voting_system_blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem('voting_system_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('voting_system_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('voting_system_current_user');
    }
  }, [currentUser]);

  // --- Handlers & Callback modifiers ---
  
  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleAddElection = (election: Election) => {
    setElections(prev => [...prev, election]);
  };

  const handleAddPosition = (position: Position) => {
    setPositions(prev => [...prev, position]);
  };

  const handleAddCandidate = (candidate: Candidate) => {
    setCandidates(prev => [...prev, candidate]);
  };

  const handleUpdateCandidate = (updatedCandidate: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  const handleDeleteElection = (electionId: string) => {
    setElections(prev => prev.filter(e => e.id !== electionId));
    // clean up orphaned positions/candidates
    setPositions(prev => prev.filter(p => p.electionId !== electionId));
    setCandidates(prev => prev.filter(c => c.electionId !== electionId));
  };

  const handleToggleElectionStatus = (electionId: string, status: 'upcoming' | 'active' | 'completed') => {
    setElections(prev => prev.map(e => e.id === electionId ? { ...e, status } : e));
  };

  const handleAddBlock = (block: Block) => {
    setBlocks(prev => [...prev, block]);
  };

  const handleAddLogs = (newLogs: AuditLog[]) => {
    setLogs(prev => [...newLogs, ...prev]); // Prepend latest log
  };

  const handleUpdateUserVoteStatus = (userId: string, electionId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          votedStatus: { ...u.votedStatus, [electionId]: true }
        };
      }
      return u;
    }));
    
    // update current session if voters casts ballot
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        votedStatus: { ...prev.votedStatus, [electionId]: true }
      } : null);
    }
  };

  const handleVerifyStudentBiometrics = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, otpVerified: true } : u));
  };

  // Staff/EC Authentication
  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoginErr('');

    const match = users.find(
      u => u.studentId.trim().toUpperCase() === staffIdInput.trim().toUpperCase() &&
           u.passwordHash === staffPassInput
    );

    if (!match) {
      setStaffLoginErr('Authentication Failed: Invalid staff credentials.');
      return;
    }

    if (match.role === UserRole.ADMIN) {
      setCurrentUser(match);
      setEcStaffMode('admin');
      handleAddLogs([
        createLog(match.id, match.name, 'Administrator', 'Secure console session authenticated', 'success')
      ]);
    } else if (match.role === UserRole.OFFICER) {
      setCurrentUser(match);
      setEcStaffMode('officer');
      handleAddLogs([
        createLog(match.id, match.name, 'Election Officer', 'Active monitor session booted', 'success')
      ]);
    } else {
      setStaffLoginErr('Access Denied: You do not possess clearance for the EC Portal.');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      handleAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'officer' ? 'Election Officer' : 'Voter',
          'Portal session exited manually',
          'success'
        )
      ]);
    }
    setCurrentUser(null);
    setActivePortal('launchpad');
    setEcStaffMode('login');
    setStaffIdInput('');
    setStaffPassInput('');
  };

  return (
    <div id="app-root-container" className={`min-h-screen flex flex-col font-sans select-none antialiased transition-colors duration-200 ${
      themeMode === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* --- Unified Header Navigation Bar --- */}
      <header className={`sticky top-0 z-40 border-b shadow-sm px-6 py-4 transition-colors duration-200 ${
        themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand seal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white border border-blue-700 shadow-md shadow-blue-500/10">
              <Vote className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className={`text-md font-bold tracking-tight font-sans transition-colors ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>University Electoral Commission</h1>
              <p className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Secure Electronic Ballot</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => { setActivePortal('launchpad'); setEcStaffMode('login'); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePortal === 'launchpad' 
                  ? (themeMode === 'dark' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-900 font-bold') 
                  : (themeMode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Portal Launchpad
            </button>
            
            <button
              onClick={() => setActivePortal('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePortal === 'dashboard'
                  ? (themeMode === 'dark' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-900 font-bold')
                  : (themeMode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Live Analytics Results
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'officer') ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {/* If signed in, show dashboard context */}
            {currentUser && currentUser.role === 'voter' && (
              <button
                onClick={() => setActivePortal('voter')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  themeMode === 'dark' ? 'bg-blue-950/40 text-blue-300 border-blue-900/50' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}
              >
                Access My Ballot
              </button>
            )}

            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'officer') && (
              <button
                onClick={() => setActivePortal('ec_staff')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  themeMode === 'dark' ? 'bg-indigo-950/40 text-indigo-300 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}
              >
                EC Staff Console
              </button>
            )}
          </nav>

          {/* Session controls and theme switcher tray */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                themeMode === 'dark' 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-305' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={themeMode === 'dark' ? "Toggle Light Theme" : "Toggle Dark Theme"}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-xs font-bold block leading-none ${themeMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{currentUser.name}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Clearance: {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Sign out of current portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className={`text-xs font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                themeMode === 'dark' ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Standard Peer Active
              </span>
            )}
          </div>

          {/* Mobile Menu Button with embedded Theme Toggler */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                themeMode === 'dark' 
                  ? 'bg-slate-800 border-slate-750 text-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 focus:outline-none rounded-xl transition-all ${
                themeMode === 'dark' ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-6 py-4 space-y-4 z-30 shadow-md transition-colors duration-200 ${
          themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <button
            onClick={() => { setActivePortal('launchpad'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 text-xs font-semibold ${themeMode === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
          >
            Portal Launchpad
          </button>
          <button
            onClick={() => { setActivePortal('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 text-xs font-semibold flex items-center justify-between ${
              themeMode === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>Live Analytics Results</span>
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'officer') ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {currentUser && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className={`text-xs font-bold block ${themeMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{currentUser.name}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">{currentUser.role}</span>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Main Contents Space --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* TAB 1: Unified Portals Launchpad */}
        {activePortal === 'launchpad' && (
          <div 
            id="launchpad-landing" 
            className="space-y-12 animate-in fade-in duration-150 relative rounded-[32px] p-6 md:p-10 lg:p-12 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl"
            style={{ backgroundImage: `url(${customBgs.launchpad})` }}
          >
            {/* Dark Mask Filter Layer */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />

            <div className="relative z-10 space-y-12">
              {/* Hero display block */}
              <div className="text-center max-w-2xl mx-auto py-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-blue-200 border border-white/10 rounded-full text-xs font-bold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Conformity Voter Ledger Secure
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans mt-5">
                  Secure University Students Electronic Voting Gateway
                </h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Welcome to the student body elections portal. Complete credentials login, satisfy OTP dual-factor SMS/email parameters, pass biometric geometry overrides, and deposit blocks cryptographically to compile the student Senate.
                </p>
              </div>

              {/* Active Election Countdown Timer */}
              <div id="landing-countdown-container" className="px-4">
                <ElectionCountdown elections={elections} variant="card" />
              </div>

              {/* Portal choices cards grid */}
              <div id="landing-roles-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Voter Access */}
                <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/55' : 'bg-white/95 border-white/20 hover:border-blue-300'
                }`}>
                  <div>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${
                      themeMode === 'dark' ? 'bg-blue-950/40 text-blue-400 border-blue-900/50' : 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-bold leading-snug ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Student / Voter Gateway</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Access ballot sheets for the SRC Elections or Departmental polls. Requires dynamic authentication and matching biometrics algorithms to generate a unique vote transaction block.
                    </p>
                  </div>
                  <div className="mt-8">
                    {currentUser && currentUser.role === 'voter' ? (
                      <button
                        onClick={() => setActivePortal('voter')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Open Private Ballot
                      </button>
                    ) : (
                      <button
                        onClick={() => setActivePortal('voter')}
                        className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-all text-center cursor-pointer ${
                          themeMode === 'dark' ? 'bg-slate-805 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        Access Voter Portal
                      </button>
                    )}
                  </div>
                </div>

                {/* EC Staff access */}
                <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/55' : 'bg-white/95 border-white/20 hover:border-indigo-300'
                }`}>
                  <div>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${
                      themeMode === 'dark' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-55 bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-bold leading-snug ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>EC Commission Staff</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Administrative console for Electoral Officers and System Administrators to coordinate election frames, announce positions, approve voter rolls, and audit AI Security Logs.
                    </p>
                  </div>
                  <div className="mt-8">
                    {currentUser && (currentUser.role === 'admin' || currentUser.role === 'officer') ? (
                      <button
                        onClick={() => setActivePortal('ec_staff')}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all text-center cursor-pointer"
                      >
                        Open Staff Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => { setActivePortal('ec_staff'); setEcStaffMode('login'); }}
                        className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-all text-center cursor-pointer ${
                          themeMode === 'dark' ? 'bg-slate-805 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        Access Staff Console
                      </button>
                    )}
                  </div>
                </div>

                {/* Public Live results dashboard */}
                <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/55' : 'bg-white/95 border-white/20 hover:border-emerald-300'
                }`}>
                  <div>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${
                      themeMode === 'dark' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-emerald-55 bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      <BarChart4 className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className={`text-lg font-bold leading-snug ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Public Live Results</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Explore live real-time turnout figures, vote counts, percentage shares, leading nominees, and department ratios transparently from the auditable blockchain ledger.
                    </p>
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={() => setActivePortal('dashboard')}
                      className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-all text-center cursor-pointer ${
                        themeMode === 'dark' ? 'bg-slate-805 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      View Real-time Turnout
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Quick login bypass references panel */}
              <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 shadow-sans text-xs select-none backdrop-blur-md text-slate-300">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1 text-[11px]">
                  <KeyRound className="w-4 h-4 text-blue-400" /> Evaluation Seed credentials (Quick Demo logs)
                </h4>
                <p className="text-slate-400 leading-relaxed mb-4">
                  To simplify the review process, you can immediately log in as either an Admin, an Election Officer, or a Student Voter using the pre-configured parameters below.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-300">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">Voter (Student)</span>
                    <p>Student ID: <span className="font-mono text-blue-400 font-bold bg-slate-900 px-1 rounded">STUD003</span></p>
                    <p>Password: <span className="font-mono">student123</span></p>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">Officer (Monitor Staff)</span>
                    <p>Staff ID: <span className="font-mono text-indigo-600 font-bold bg-slate-900 px-1 rounded">OFFICER202</span></p>
                    <p>Password: <span className="font-mono">officer123</span></p>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-rose-400 block mb-1">Admin (Full Coordinator)</span>
                    <p>Admin ID: <span className="font-mono text-rose-600 font-bold bg-slate-900 px-1 rounded">ADMIN101</span></p>
                    <p>Password: <span className="font-mono">admin123</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Voter Portal Suite */}
        {activePortal === 'voter' && (
          <div className="animate-in fade-in duration-150">
            <VoterPanel 
              currentUser={currentUser}
              onLogin={setCurrentUser}
              onLogout={handleLogout}
              users={users}
              elections={elections}
              positions={positions}
              candidates={candidates}
              blocks={blocks}
              onAddBlock={handleAddBlock}
              onAddLogs={handleAddLogs}
              onUpdateUserVoteStatus={handleUpdateUserVoteStatus}
              customBgs={customBgs}
            />
          </div>
        )}

        {/* TAB 3: Academic staff modules */}
        {activePortal === 'ec_staff' && (
          <div className="animate-in fade-in duration-150">
            
            {/* Login stage for staff */}
            {ecStaffMode === 'login' && (
              <div className={`max-w-md mx-auto rounded-3xl p-8 shadow-sm border transition-colors ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 animate-bounce border transition-colors ${
                    themeMode === 'dark' ? 'bg-indigo-950/50 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className={`text-2xl font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Commission Staff Gate</h2>
                  <p className={`text-sm mt-2 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to coordinate election databases, register students, and view secure audit trails.</p>
                </div>

                <form onSubmit={handleStaffLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className={`block font-bold uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Staff ID Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OFFICER202 or ADMIN101"
                      value={staffIdInput}
                      onChange={(e) => setStaffIdInput(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs transition-colors border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={staffPassInput}
                      onChange={(e) => setStaffPassInput(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs transition-colors border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {staffLoginErr && (
                    <p className="text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-bold font-sans">
                      {staffLoginErr}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Authenticate Console
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActivePortal('launchpad')}
                    className={`w-full py-2.5 font-semibold transition-all ${
                      themeMode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Return to Portal Selection
                  </button>
                </form>
              </div>
            )}

            {/* Admin console mode */}
            {ecStaffMode === 'admin' && currentUser && currentUser.role === 'admin' && (
              <AdminPanel 
                currentUser={currentUser}
                users={users}
                elections={elections}
                positions={positions}
                candidates={candidates}
                logs={logs}
                onAddUser={handleAddUser}
                onAddElection={handleAddElection}
                onAddPosition={handleAddPosition}
                onAddCandidate={handleAddCandidate}
                onUpdateCandidate={handleUpdateCandidate}
                onDeleteCandidate={handleDeleteCandidate}
                onDeleteElection={handleDeleteElection}
                onToggleElectionStatus={handleToggleElectionStatus}
                onAddLogs={handleAddLogs}
                customBgs={customBgs}
                onUpdateBackgrounds={setCustomBgs}
              />
            )}

            {/* Officer console mode */}
            {ecStaffMode === 'officer' && currentUser && currentUser.role === 'officer' && (
              <OfficerPanel 
                currentUser={currentUser}
                users={users}
                elections={elections}
                blocks={blocks}
                logs={logs}
                onAddLogs={handleAddLogs}
                onVerifyStudentBiometrics={handleVerifyStudentBiometrics}
              />
            )}

          </div>
        )}

        {/* TAB 4: Public analytics results dashboard */}
        {activePortal === 'dashboard' && (
          <div className="animate-in fade-in duration-150">
            {currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OFFICER) ? (
              <StatisticsDashboard 
                users={users}
                elections={elections}
                positions={positions}
                candidates={candidates}
                blocks={blocks}
              />
            ) : (
              <div id="restricted-dashboard-access" className="max-w-xl mx-auto bg-white border border-slate-205 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden my-4 border-t-4 border-t-rose-600">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-6 drop-shadow-sm">
                  <Lock className="w-8 h-8 animate-bounce text-rose-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">Restricted Electronic Ledger Results</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Real-time turnout figures and cryptographic nomination analytics are classified under university electoral act security code <span className="font-semibold text-slate-800">EC-AN-2026</span>.
                </p>
                
                <div className="my-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-100 text-left space-y-3.5 text-xs text-slate-600">
                  <div className="flex gap-3">
                    <span className="shrink-0 text-rose-500 font-bold">●</span>
                    <p>Only verified <strong className="text-slate-900">University Electoral Officers</strong> and <strong className="text-slate-900">System Administrators</strong> possess clearance to inspect live turnout rates and cryptographic counts.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 text-slate-400 font-bold">●</span>
                    <p>General voters or unregistered public users are restricted until the official closing of ballot boxes and consensus declaration.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => { setActivePortal('ec_staff'); setEcStaffMode('login'); }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-605/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" /> Sign In as Authorized Staff
                  </button>
                  <button
                    onClick={() => setActivePortal('launchpad')}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- Footer Signature --- */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-6 text-xs text-center select-none print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 University Student Representative Council Electoral Commission. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <span className="font-mono bg-slate-800 text-blue-400 px-2.5 py-1 rounded border border-slate-700">SHA-256 Ledger Consensus Active</span>
            <span className="text-slate-500">MFA Node Secure v2.4</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
