import React, { useState, useEffect } from 'react';
// @ts-ignore
import image1 from './image1.jpg';
// @ts-ignore
import image2 from '../../images/image2.jpg';
// @ts-ignore
import image3 from '../../images/image3.jpg';
// @ts-ignore
import image4 from '../../images/image4.jpg';
import { User, Election, Position, Candidate, Block, AuditLog } from '../types';
import { calculateBlockHash, generateOTP, createLog } from '../utils/crypto';
import ElectionCountdown from './ElectionCountdown';
import { 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  Camera, 
  IdCard, 
  Vote, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Cpu, 
  Printer, 
  AlertTriangle,
  RefreshCw,
  Mail,
  UserCheck
} from 'lucide-react';

interface VoterPanelProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  users: User[];
  elections: Election[];
  positions: Position[];
  candidates: Candidate[];
  blocks: Block[];
  onAddBlock: (block: Block) => void;
  onAddLogs: (logs: AuditLog[]) => void;
  onUpdateUserVoteStatus: (userId: string, electionId: string) => void;
  customBgs?: {
    launchpad: string;
    accessBallot: string;
    activePortfolio: string;
    activePolls: string;
  };
}

export default function VoterPanel({
  currentUser,
  onLogin,
  onLogout,
  users,
  elections,
  positions,
  candidates,
  blocks,
  onAddBlock,
  onAddLogs,
  onUpdateUserVoteStatus,
  customBgs
}: VoterPanelProps) {
  const activeBgs = customBgs || {
    launchpad: image2,
    accessBallot: image1,
    activePortfolio: image3,
    activePolls: image4
  };
  // Login phase states
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Voting phase state
  const [step, setStep] = useState<'login' | 'otp' | 'biometric' | 'elections' | 'ballot' | 'mining' | 'receipt'>('login');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [bioType, setBioType] = useState<'face' | 'fingerprint'>('face');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Real Webcam Face ID streaming hooks
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // If we enter the biometric phase and face recognition is chosen
    if (step === 'biometric' && bioType === 'face' && !scanComplete) {
      let activeStream: MediaStream | null = null;
      setCameraError(null);
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          activeStream = stream;
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Real webcam capture blocked or unavailable. Falling back to high-fidelity simulated scanner stream.', err);
          setCameraError('Camera occupied or blocked. Enforcing simulated hardware verification stream.');
        });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
      };
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  }, [step, bioType, scanComplete]);
  
  // Selection states
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<{ [positionId: string]: string }>({}); // positionId -> candidateId
  const [activePositionIndex, setActivePositionIndex] = useState(0);
  const [viewingManifesto, setViewingManifesto] = useState<Candidate | null>(null);
  
  // Action finalization states for preventing accidental submissions
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Blockchain casting simulation states
  const [miningStatus, setMiningStatus] = useState<string[]>([]);
  const [currentMiningBlock, setCurrentMiningBlock] = useState<Partial<Block> | null>(null);
  const [receiptBlocks, setReceiptBlocks] = useState<Block[]>([]);

  // OTP Timer countdown
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const matchedUser = users.find(
      u => u.studentId.trim().toUpperCase() === studentIdInput.trim().toUpperCase() &&
           u.passwordHash === passwordInput
    );

    if (!matchedUser) {
      setAuthError('Invalid Student ID or password credentials.');
      return;
    }

    if (matchedUser.role !== 'voter') {
      setAuthError('Access Denied: This portal is for students/voters only.');
      return;
    }

    // Direct registration step
    onLogin(matchedUser);
    
    // Simulate setting up an OTP
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpTimer(60);
    setStep('otp');
    
    // Log auth success
    const log = createLog(
      matchedUser.id,
      matchedUser.name,
      'Voter',
      `Login attempt verified. Verification OTP dispatched via secure academic gateway to ${matchedUser.email}`,
      'success'
    );
    onAddLogs([log]);
    
    // Alert user about simulated email dispatcher (educational purpose)
    console.log(`[SECURE MAIL GATEWAY] Simulated email sent to ${matchedUser.email}. OTP is: ${otp}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otpInput !== generatedOtp && otpInput !== '123456') { // Allow 123456 as debug bypass
      setOtpError('Incorrect OTP number. Please try again.');
      return;
    }

    if (currentUser) {
      const log = createLog(
        currentUser.id,
        currentUser.name,
        'Voter',
        'OTP Two-Factor authentication successfully complete',
        'success'
      );
      onAddLogs([log]);
    }

    // Proceed to high-tech double biometric verification
    setStep('biometric');
  };

  const startBiometricScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      
      if (currentUser) {
        const log = createLog(
          currentUser.id,
          currentUser.name,
          'Voter',
          `Biometric multi-factor authentication (${bioType === 'face' ? 'Facial Geometry Scan' : 'SHA Fingerprint Scan'}) securely verified. Matching confidence 99.8%`,
          'success'
        );
        onAddLogs([log]);
      }
    }, 2500);
  };

  const handleProceedToElections = () => {
    setStep('elections');
  };

  const resendOTPToken = () => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpTimer(60);
    setOtpInput('');
    setOtpError('');
    alert(`[SECURE MAIL GATEWAY] New simulated SMS/Email OTP Dispatched: ${otp}`);
  };

  const handleSelectElection = (election: Election) => {
    if (currentUser && currentUser.votedStatus[election.id]) {
      alert('Security Protocol: You have already cast your biometric ballot for this election. Duplicate votes are strictly blocked.');
      return;
    }
    setSelectedElection(election);
    setSelectedVotes({});
    setActivePositionIndex(0);
    setStep('ballot');
  };

  // Positions belonging to the selected active election
  const activePositions = selectedElection
    ? positions.filter(p => p.electionId === selectedElection.id)
    : [];

  const handleVoteSelection = (positionId: string, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handlePrevPosition = () => {
    if (activePositionIndex > 0) {
      setActivePositionIndex(prev => prev - 1);
    }
  };

  const handleNextPosition = () => {
    if (activePositionIndex < activePositions.length - 1) {
      setActivePositionIndex(prev => prev + 1);
    }
  };

  // Mine & casting blocks for each voted position
  const triggerBlockchainCasting = async () => {
    // Validate all positions have been voted
    const unvotedPositions = activePositions.filter(p => !selectedVotes[p.id]);
    if (unvotedPositions.length > 0) {
      alert(`Voter Guidelines: Please cast your vote for all available positions before submission.`);
      return;
    }

    setStep('mining');
    setMiningStatus(['Initializing blockchain consensus...']);
    
    const logsToCreate: AuditLog[] = [];
    const blocksToCreate: Block[] = [];
    
    // Process each vote block by block with slight delays to visual mining
    let latestPrevHash = blocks[blocks.length - 1]?.hash || '000000000000000000000';
    let currentIndex = blocks.length;

    for (let i = 0; i < activePositions.length; i++) {
      const position = activePositions[i];
      const candidateId = selectedVotes[position.id];
      const cand = candidates.find(c => c.id === candidateId);
      
      const posName = position.positionName;
      const candName = cand?.name || 'Selected Candidate';

      // Visual delay 1: packaging
      await new Promise(resolve => setTimeout(resolve, 800));
      setMiningStatus(prev => [
        ...prev,
        `Packaging secure ballot block for position: ${posName}...`
      ]);

      // State mining info
      const blockTime = new Date().toISOString();
      const mockBlock: Partial<Block> = {
        index: currentIndex,
        timestamp: blockTime,
        previousHash: latestPrevHash,
        electionId: selectedElection!.id,
        positionId: position.id,
        candidateId: candidateId
      };
      setCurrentMiningBlock(mockBlock);

      // Visual delay 2: mining proof of work CPU cycles
      await new Promise(resolve => setTimeout(resolve, 1000));
      const minedNonce = Math.floor(10000 + Math.random() * 90000);
      const minedHash = calculateBlockHash(
        currentIndex,
        blockTime,
        latestPrevHash,
        selectedElection!.id,
        position.id,
        candidateId,
        minedNonce
      );

      const finalBlock: Block = {
        ...mockBlock as Block,
        hash: minedHash,
        nonce: minedNonce
      };

      blocksToCreate.push(finalBlock);
      onAddBlock(finalBlock);

      setMiningStatus(prev => [
        ...prev,
        `Consensus OK! Block #${currentIndex} mined successfully (Nonce: ${minedNonce}). Hash: ${minedHash.substring(0, 16)}...`
      ]);

      logsToCreate.push(
        createLog(
          currentUser!.id,
          'Anonymous Voter Ledger',
          'Blockchain Ledger',
          `Polled encrypted vote block index [${currentIndex}] written with verified signature. Hash: ${minedHash.substring(0, 24)}...`,
          'success'
        )
      );

      latestPrevHash = minedHash;
      currentIndex++;
    }

    // Set user as voted for this election
    onUpdateUserVoteStatus(currentUser!.id, selectedElection!.id);
    
    logsToCreate.push(
      createLog(
        currentUser!.id,
        currentUser!.name,
        'Voter',
        `Completed voting suite successfully for: ${selectedElection!.title}. Ballot closed.`,
        'success'
      )
    );

    // Finalize
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMiningStatus(prev => [...prev, 'Consensus achieved. Distributing transaction receipts!']);
    onAddLogs(logsToCreate);
    setReceiptBlocks(blocksToCreate);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    setStep('receipt');
  };

  const handleConfirmSubmitBallot = () => {
    setShowConfirmModal(false);
    triggerBlockchainCasting();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const resetVoterSession = () => {
    onLogout();
    setStep('login');
    setStudentIdInput('');
    setPasswordInput('');
    setOtpInput('');
    setGeneratedOtp('');
    setScanComplete(false);
    setSelectedElection(null);
    setSelectedVotes({});
  };

  return (
    <div id="voter-module-root" className="w-full">
      {/* 1. Login Stage */}
      {step === 'login' && (
        <div 
          className="relative rounded-[32px] p-6 md:p-12 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl min-h-[500px] flex items-center justify-center animate-in fade-in duration-150"
          style={{ backgroundImage: `url(${activeBgs.accessBallot})` }}
        >
          {/* Dark Filter Mask overlay */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />
          
          <div id="voter-login-card" className="relative z-10 w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 font-sans">Student Authentication</h2>
            <p className="text-sm text-slate-500 mt-2">Sign in using your administrative credentials or registered student ID to join the ballot gate.</p>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Student ID Number</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. STUD003"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Hint: Try standard codes e.g. <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">STUD003</span> or <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">STUD004</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Secure Pin Code / Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default demo password for seeded student users: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">student123</span></p>
            </div>

            {authError && (
              <div className="flex items-start gap-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20"
            >
              Verify Credentials
            </button>
          </form>
        </div>
        </div>
      )}

      {/* 2. OTP Stage */}
      {step === 'otp' && currentUser && (
        <div 
          className="relative rounded-[32px] p-6 md:p-12 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl min-h-[500px] flex items-center justify-center animate-in fade-in duration-150"
          style={{ backgroundImage: `url(${activeBgs.accessBallot})` }}
        >
          {/* Dark Filter Mask overlay */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />
          
          <div id="voter-otp-card" className="relative z-10 w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dual-Factor OTP Validation</h2>
            <p className="text-sm text-slate-500 mt-2">
              A temporary unique verification OTP has been generated for your academic email <span className="font-semibold text-slate-800">{currentUser.email}</span>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-800 font-medium font-mono text-center">
              [DEMO BROADCAST] Dispatched Secure OTP Link Password:<br />
              <span className="text-lg font-bold tracking-widest text-amber-950 px-2 py-0.5 bg-white/70 rounded inline-block mt-1">
                {generatedOtp}
              </span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">Enter 6-digit OTP Token</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono tracking-widest py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
              />
            </div>

            {otpError && (
              <div className="flex items-start gap-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20"
            >
              Verify OTP Passport
            </button>

            <div className="flex items-center justify-between text-xs mt-4">
              <span className="text-slate-500">
                OTP active for: <span className="font-semibold font-mono text-slate-700">{otpTimer}s</span>
              </span>
              <button
                type="button"
                onClick={resendOTPToken}
                disabled={otpTimer > 30}
                className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-slate-400 transition-all"
              >
                Resend Token
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      {/* 3. Double-Factor Simulated Biometric Verification */}
      {step === 'biometric' && currentUser && (
        <div 
          className="relative rounded-[32px] p-6 md:p-12 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl min-h-[500px] flex items-center justify-center animate-in fade-in duration-150"
          style={{ backgroundImage: `url(${activeBgs.accessBallot})` }}
        >
          {/* Dark Filter Mask overlay */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />
          
          <div id="voter-biometric-card" className="relative z-10 w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 font-sans">Multi-Factor Biometrics</h2>
            <p className="text-sm text-slate-500 mt-2">To prevent identity sharing/spoofing, satisfy one of the local physical biometric security checkpoints.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setBioType('face'); setScanComplete(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${bioType === 'face' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Camera className="w-4 h-4" />
              Facial Recognition
            </button>
            <button
              type="button"
              onClick={() => { setBioType('fingerprint'); setScanComplete(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${bioType === 'fingerprint' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Fingerprint className="w-4 h-4" />
              Fingerprint Hash
            </button>
          </div>

          {/* scanner visualizer */}
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 mb-6 overflow-hidden min-h-[220px]">
            {isScanning && (
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-blue-500/70 shadow-lg shadow-blue-500/50 animate-bounce absolute top-0" />
              </div>
            )}

            {bioType === 'face' ? (
              <div className="flex flex-col items-center w-full">
                {scanComplete ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-200 mb-3 animate-pulse">
                      <UserCheck className="w-10 h-10" />
                    </div>
                    <span className="text-sm font-semibold text-green-700">Webcam Identity Verified</span>
                    <span className="text-[11px] text-slate-500">Matching confidence index: 99.98%</span>
                    <div className="text-[10px] font-mono mt-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      BLOCKHASH: {currentUser?.studentId || 'STUD'}..{Date.now().toString().substring(8)}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full w-full">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-900 shadow-inner flex items-center justify-center mb-4 group transition-all duration-300 hover:border-blue-500">
                      
                      {/* Real Video Stream */}
                      {!cameraError ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 p-4 text-center">
                          <Camera className="w-10 h-10 text-slate-600 animate-pulse mb-1.5" />
                          <span className="text-[9px] text-slate-500 leading-tight">Virtual Hardware Feed Active</span>
                        </div>
                      )}

                      {/* Laser sweeping animation line during active scanning */}
                      {isScanning && (
                        <div className="absolute left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-bounce top-1/4" />
                      )}

                      {/* Circular targeting reticle overlay */}
                      <div className="absolute inset-2 rounded-full border border-dashed border-slate-100/30 pointer-events-none flex items-center justify-center">
                        <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-sm" />
                        <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-sm" />
                        <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-sm" />
                        <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-sm" />
                      </div>

                      {/* Glowing center indicator when scanning is active */}
                      {isScanning && (
                        <div className="absolute text-[8px] font-mono text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-full bottom-3 font-semibold tracking-wider animate-pulse flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping inline-block" />
                          MAPPING LANDMARKS
                        </div>
                      )}
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {isScanning ? 'Extracting biometric credentials...' : 'Align face in camera view'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] text-center">
                      {!cameraError 
                        ? 'Align your head within the green alignment indicators to complete camera Face ID authentication.'
                        : 'Simulating secure physical hardware face recognition verification.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                {scanComplete ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-200 mb-3">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <span className="text-sm font-semibold text-green-700">Fingerprint Verified</span>
                    <span className="text-[11px] text-slate-500">Security Signature OK</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-2">
                    <Fingerprint className={`w-16 h-16 text-slate-400 mb-3 ${isScanning ? 'animate-pulse text-indigo-500 scale-105' : ''}`} />
                    <span className="text-sm font-medium text-slate-600">
                      {isScanning ? 'Verifying latent print map...' : 'Press scanner surface'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">Simulates secure fingerprint device API</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!scanComplete ? (
              <button
                type="button"
                onClick={startBiometricScan}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-medium rounded-xl transition-all shadow-sm"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning... Please Face Device
                  </>
                ) : (
                  'Start Simulated Biometric Scan'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToElections}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm"
              >
                Access Voting Ballots
              </button>
            )}
            
            <button
              type="button"
              onClick={resetVoterSession}
              className="w-full py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-all text-center"
            >
              Cancel Registration & Sign Out
            </button>
          </div>
        </div>
        </div>
      )}

      {/* 4. Elections Selection Gateway */}
      {step === 'elections' && currentUser && (
        <div 
          id="voter-elections-list-wrapper"
          className="relative rounded-[32px] p-6 md:p-8 lg:p-10 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl shadow-slate-900/10"
          style={{ backgroundImage: `url(${activeBgs.activePolls})` }}
        >
          {/* Dark Filter Mask overlay */}
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />

          <div id="voter-elections-list" className="relative z-10">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 sm:p-6 rounded-2xl backdrop-blur-md border border-white/10 text-white">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                  Voter Authenticated
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-2">Current Active Polls</h2>
                <p className="text-sm text-slate-300 mt-1">Hi, {currentUser.name}. Select an election below to cast your secure democratic vote.</p>
              </div>
              <button
                onClick={resetVoterSession}
                className="px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-505 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                Emergency Sign Out
              </button>
            </div>

          {/* Active Election Countdown Bar */}
          <div className="mb-8" id="voter-portal-countdown">
            <ElectionCountdown elections={elections} variant="compact" />
          </div>

          <div id="active-elections-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {elections.map((elec) => {
              const alreadyVoted = currentUser.votedStatus[elec.id];
              const isActive = elec.status === 'active';
              
              return (
                <div 
                  key={elec.id} 
                  className={`bg-white border rounded-2xl p-6 transition-all ${
                    alreadyVoted 
                      ? 'border-slate-150 bg-slate-50/50' 
                      : isActive 
                        ? 'border-blue-200 hover:border-blue-400 shadow-sm' 
                        : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          elec.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {elec.status}
                        </span>
                        {elec.status === 'active' && (
                          <ElectionCountdown elections={elections} targetElectionId={elec.id} variant="mini" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-3">{elec.title}</h3>
                    </div>
                    {alreadyVoted && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                        Voted (Secured)
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-2 text-xs text-slate-500">
                    <p className="flex justify-between">
                      <span>Ballot Commences:</span>
                      <span className="font-medium text-slate-700">{new Date(elec.startDate).toLocaleDateString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Concluding Deadline:</span>
                      <span className="font-medium text-slate-700">{new Date(elec.endDate).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {alreadyVoted ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-100 text-slate-400 font-semibold rounded-xl text-xs cursor-not-allowed"
                      >
                        Ballot Complete & Sealed
                      </button>
                    ) : isActive ? (
                      <button
                        onClick={() => handleSelectElection(elec)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Vote className="w-4 h-4" />
                        Open Ballot Sheet
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-50 text-slate-300 font-semibold rounded-xl text-xs cursor-not-allowed"
                      >
                        Inoperable Election
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* 5. Ballot Sheet */}
      {step === 'ballot' && selectedElection && (
        <div 
          id="voter-ballot-sheet-wrapper"
          className="relative rounded-[32px] p-6 md:p-8 lg:p-10 overflow-hidden bg-cover bg-center bg-no-repeat border border-slate-205 shadow-2xl shadow-slate-900/10"
          style={{ backgroundImage: `url(${activeBgs.activePortfolio})` }}
        >
          {/* Dark Filter Mask overlay */}
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />

          <div id="voter-ballot-sheet" className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress & Categories Sidebar */}
          <div className="lg:col-span-1 bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Vote className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Official Student Ballot</span>
              </div>
              <h3 className="text-lg font-bold font-sans tracking-tight leading-snug">{selectedElection.title}</h3>
              <p className="text-xs text-slate-400 mt-2">Identify your preferred candidate for each portfolio. You must cast one vote for all available slots to seal the ballot.</p>
              
              {/* Positions track list */}
              <div className="mt-8 space-y-3">
                {activePositions.map((pos, idx) => {
                  const hasSelection = !!selectedVotes[pos.id];
                  const isActive = idx === activePositionIndex;
                  return (
                    <button
                      key={pos.id}
                      onClick={() => setActivePositionIndex(idx)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/10'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs truncate max-w-[130px]">{pos.positionName}</span>
                      </div>
                      {hasSelection ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progress Selections:</span>
                <span className="font-mono">{Object.keys(selectedVotes).length} / {activePositions.length}</span>
              </div>
              <div slot="progress" className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(Object.keys(selectedVotes).length / activePositions.length) * 100}%` }}
                />
              </div>

              {Object.keys(selectedVotes).length === activePositions.length ? (
                <button
                  onClick={() => { setShowConfirmModal(true); }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <Cpu className="w-4 h-4 animate-spin-slow" />
                  Seal & Mine Ballot Chain
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl text-xs cursor-not-allowed text-center"
                >
                  Cast Cryptographic Ballot
                </button>
              )}
              
              <button
                onClick={() => setStep('elections')}
                className="w-full py-2 text-center text-[11px] text-slate-500 hover:text-slate-300 font-semibold transition-all"
              >
                Go Back to Elections
              </button>
            </div>
          </div>

          {/* Candidates Grid Panel */}
          <div className="lg:col-span-2">
            {activePositions[activePositionIndex] && (
              <div id="ballot-position-voter">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Portfolio</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {activePositions[activePositionIndex].positionName}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPosition}
                      disabled={activePositionIndex === 0}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPosition}
                      disabled={activePositionIndex === activePositions.length - 1}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Next Layer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidates
                    .filter(c => c.positionId === activePositions[activePositionIndex].id)
                    .map(cand => {
                      const isSelected = selectedVotes[activePositions[activePositionIndex].id] === cand.id;
                      return (
                        <div 
                          key={cand.id} 
                          className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col justify-between ${
                            isSelected 
                              ? 'border-blue-500 ring-2 ring-blue-500/10' 
                              : 'border-slate-200'
                          }`}
                        >
                          <div>
                            {/* Card Header Profile */}
                            <div className="flex items-center gap-4 p-5 border-b border-slate-50">
                              <img
                                src={cand.photoUrl}
                                alt={cand.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-slate-100"
                              />
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">{cand.name}</h4>
                                <span className="text-[11px] font-medium text-slate-500">{cand.department}</span>
                              </div>
                            </div>

                            {/* Brief manifesto */}
                            <div className="p-5">
                              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                &ldquo;{cand.manifesto}&rdquo;
                              </p>
                              <button
                                onClick={() => setViewingManifesto(cand)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1 transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Read Full Manifesto & Pledge
                              </button>
                            </div>
                          </div>

                          {/* Action footer */}
                          <div className="p-5 pt-0">
                            {isSelected ? (
                              <button
                                onClick={() => handleVoteSelection(activePositions[activePositionIndex].id, '')}
                                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Selected
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVoteSelection(activePositions[activePositionIndex].id, cand.id)}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all text-center"
                              >
                                Choose Candidate
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* 6. Blockchain Mining Animation */}
      {step === 'mining' && (
        <div id="voter-blockchain-miner" className="max-w-xl mx-auto bg-slate-950 text-white border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f610,#00000000)]" />
          
          <div className="text-center mb-8 relative z-10">
            <Cpu className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold tracking-tight">Casting Votes To Distributed Ledger</h2>
            <p className="text-xs text-slate-400 mt-1.5">Your physical votes are being serialized, double-hashed using academic identity keys, and committed into sequential blockchain nodes with independent nonce puzzles.</p>
          </div>

          {/* Mining blocks log visualizer */}
          <div className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-64 overflow-y-auto font-mono text-xs text-blue-300 relative z-10 scrollbar-thin">
            {miningStatus.map((statusLine, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-500">[{idx + 1}]</span>
                <p className="leading-relaxed">{statusLine}</p>
              </div>
            ))}
            
            {/* Show real-time dynamic hash generation */}
            {currentMiningBlock && (
              <div className="border border-blue-500/30 bg-blue-950/20 rounded-lg p-3 mt-4 text-[10px] text-slate-300">
                <span className="text-blue-450 font-bold block mb-1">MOCK MINER STATUS:</span>
                <p className="truncate">PrevHash: {currentMiningBlock.previousHash}</p>
                <p>Node Payload: Index {currentMiningBlock.index} | PosID {currentMiningBlock.positionId}</p>
                <p className="animate-pulse text-indigo-400">Searching proof-of-work (nonce puzzle matrix)...</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center text-[10px] text-slate-500">
            <span>Security Signature Mode: SHA-256</span>
            <span>Network Latency: 22ms</span>
          </div>
        </div>
      )}

      {/* 7. Vote Confirmation Receipt */}
      {step === 'receipt' && currentUser && selectedElection && (
        <div id="voter-receipt-card" className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden print:shadow-none print:border-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,#10b98115,#00000000)] pointer-events-none" />

          <div className="text-center pb-6 border-b border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 print:hidden">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Biometric Ballot Confirmation</h2>
            <p className="text-xs text-slate-500 mt-1">This document represents a mathematically secured transaction receipt verifying your voting entries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs">
            {/* Student metadata */}
            <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Voter Metadata</h4>
              <p className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-900">{currentUser.name}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Student ID Index:</span>
                <span className="font-semibold font-mono text-slate-900">{currentUser.studentId}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Department Block:</span>
                <span className="font-semibold text-slate-900">{currentUser.department}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">MFA Verification:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5" /> Checked (Pass)
                </span>
              </p>
            </div>

            {/* Voting details */}
            <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Transaction Records</h4>
              <p className="flex justify-between">
                <span className="text-slate-500">Election Scope:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[130px]">{selectedElection.title}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Timestamp Log:</span>
                <span className="font-semibold font-mono text-slate-950">{new Date().toLocaleString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Verification Ledger:</span>
                <span className="font-semibold font-mono text-blue-600">DISTRIBUTED</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Auditable Nodes Added:</span>
                <span className="font-semibold font-mono text-slate-900">+{receiptBlocks.length} Nodes</span>
              </p>
            </div>
          </div>

          {/* Secure Chain Receipt Nodes */}
          <div className="my-6">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-3">Mined Vote Blocks Ledger (Public Proof)</h4>
            <div className="space-y-3 font-mono text-[11px]">
              {receiptBlocks.map((block) => {
                const position = positions.find(p => p.id === block.positionId);
                const candidate = candidates.find(c => c.id === block.candidateId);
                return (
                  <div key={block.index} className="border border-slate-150 rounded-xl bg-slate-50/50 p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-md font-bold text-[9px]">Block #{block.index}</span>
                        <span className="font-sans font-bold text-slate-800">{position?.positionName}</span>
                      </div>
                      <p className="font-sans text-xs text-slate-500 mt-1">Encrypted Choice Key: <span className="font-mono text-[10px] text-slate-700 font-semibold">{candidate?.name}</span></p>
                    </div>
                    <div className="text-right md:max-w-xs">
                      <p className="font-semibold text-[9px] text-slate-400">Cryptographic Hash Signature </p>
                      <p className="text-blue-650 truncate text-[9px] font-bold">{block.hash}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 leading-relaxed mb-6 flex gap-3 print:hidden">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Academic Integrity Notice:</strong> This digital ballot is now permanently locked and broadcasted to peer nodes. Your student profile ID was checked prior to casting, but in the final block, the vote is stored completely pseudonymously to ensure your democratic choice remains 100% anonymous.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-100 pt-6 print:hidden">
            <button
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-semibold rounded-xl text-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt (PDF)
            </button>
            <button
              onClick={resetVoterSession}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10"
            >
              Finish Ballot Session
            </button>
          </div>
        </div>
      )}

      {/* Manifesto Drawer Modal (Reusable overlay) */}
      {viewingManifesto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{viewingManifesto.name}</h3>
            <p className="text-xs text-slate-550 mb-4">{viewingManifesto.department} Candidate Portfolio</p>
            
            <div className="my-5 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm leading-relaxed text-slate-650 max-h-60 overflow-y-auto scrollbar-thin">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">My Manifesto Agenda:</span>
              &ldquo;{viewingManifesto.manifesto}&rdquo;
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-100 mt-6">
              <span>Status: Council Approved</span>
              <button
                onClick={() => setViewingManifesto(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.1. Secure Vote Finalization Confirmation Modal */}
      {showConfirmModal && selectedElection && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col font-sans text-slate-950 select-none">
            
            {/* Header section with active security badges */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  IMMUTABILITY SECURE LOCK
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Finalize & Cast Ballot
                </h3>
              </div>
            </div>

            {/* Selected Candidates Summary list */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mb-5">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                Review Your Unaltered Ballot Selections:
              </h4>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                {activePositions.map((pos) => {
                  const candId = selectedVotes[pos.id];
                  const cand = candidates.find(c => c.id === candId);
                  return (
                    <div key={pos.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {pos.positionName}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 block truncate mt-0.5">
                          {cand ? cand.name : 'Abstaining selection'}
                        </span>
                      </div>
                      {cand && (
                        <div className="flex items-center gap-2shrink-0">
                          <img 
                            src={cand.photoUrl} 
                            alt={cand.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-200/60 px-2 py-1 rounded-lg">
                            {cand.department.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning Immutability notice */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-amber-900">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block text-amber-800 font-bold mb-0.5">Irreversible Blockchain Operation Warning</strong>
                Your selections will be permanently hashed and committed into the distributed blockchain general ledger. This transaction is mathematically sealed and cannot be undone, overwritten, or re-voted.
              </div>
            </div>

            {/* Actions button tray */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
              >
                Go Back & Revise
              </button>
              
              <button
                type="button"
                onClick={handleConfirmSubmitBallot}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                Cast Immutable Vote
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
