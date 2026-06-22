import React, { useState, useEffect } from 'react';
import { User, Election, Position, Candidate, AuditLog, UserRole, Department } from '../types';
import { createLog } from '../utils/crypto';
import { 
  Building2, 
  Calendar, 
  Plus, 
  UserPlus, 
  Power, 
  Trash2, 
  Check, 
  Lock, 
  Users, 
  Trophy, 
  FileSpreadsheet, 
  History, 
  Search, 
  Sparkles,
  AlertCircle,
  Clock,
  Upload,
  Cloud,
  Loader2,
  X,
  Image as ImageIcon,
  LogOut,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  fetchDriveImages,
  downloadDriveImageAsBase64,
  logoutDrive
} from '../utils/firebase';

interface AdminPanelProps {
  currentUser: User | null;
  users: User[];
  elections: Election[];
  positions: Position[];
  candidates: Candidate[];
  logs: AuditLog[];
  onAddUser: (user: User) => void;
  onAddElection: (election: Election) => void;
  onAddPosition: (position: Position) => void;
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onDeleteElection: (electionId: string) => void;
  onToggleElectionStatus: (electionId: string, status: 'upcoming' | 'active' | 'completed') => void;
  onAddLogs: (logs: AuditLog[]) => void;
  customBgs?: {
    launchpad: string;
    accessBallot: string;
    activePortfolio: string;
    activePolls: string;
  };
  onUpdateBackgrounds?: React.Dispatch<React.SetStateAction<{
    launchpad: string;
    accessBallot: string;
    activePortfolio: string;
    activePolls: string;
  }>>;
}

export default function AdminPanel({
  currentUser,
  users,
  elections,
  positions,
  candidates,
  logs,
  onAddUser,
  onAddElection,
  onAddPosition,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onDeleteElection,
  onToggleElectionStatus,
  onAddLogs,
  customBgs,
  onUpdateBackgrounds
}: AdminPanelProps) {
  // Navigation tabs within Admin Panel
  const [adminTab, setAdminTab] = useState<'elections' | 'positions' | 'candidates' | 'voters' | 'logs'>('elections');

  // New Election States
  const [newElecTitle, setNewElecTitle] = useState('');
  const [newElecStart, setNewElecStart] = useState('');
  const [newElecEnd, setNewElecEnd] = useState('');
  const [confirmDeleteElec, setConfirmDeleteElec] = useState<{ id: string; name: string } | null>(null);

  // New Position States
  const [selectedElecForPos, setSelectedElecForPos] = useState('');
  const [newPosName, setNewPosName] = useState('');

  // New Candidate States
  const [selectedPosForCand, setSelectedPosForCand] = useState('');
  const [newCandName, setNewCandName] = useState('');
  const [newCandDept, setNewCandDept] = useState<Department>('Computer Science');
  const [newCandManifesto, setNewCandManifesto] = useState('');
  const [newCandPhoto, setNewCandPhoto] = useState('');

  // Google Drive & Local Upload States
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveDownloading, setDriveDownloading] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Initialize Auth state for Drive
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDriveFiles = async (token: string) => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const files = await fetchDriveImages(token);
      setDriveFiles(files);
    } catch (err: any) {
      setDriveError(err.message || 'Failed to fetch files from Google Drive.');
    } finally {
      setDriveLoading(false);
    }
  };

  const handleOpenDriveExplorer = async () => {
    setDriveModalOpen(true);
    if (driveToken) {
      loadDriveFiles(driveToken);
    } else {
      try {
        setDriveLoading(true);
        const res = await googleSignIn();
        if (res) {
          setDriveToken(res.accessToken);
          setDriveUser(res.user);
          loadDriveFiles(res.accessToken);
        }
      } catch (err: any) {
        setDriveError(err.message || 'Authentication cancelled or failed.');
        setDriveLoading(false);
      }
    }
  };

  const handleDriveDisconnect = async () => {
    try {
      await logoutDrive();
      setDriveToken(null);
      setDriveUser(null);
      setDriveFiles([]);
      alert('Signed out of Google Workspace successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDriveFile = async (fileId: string, fileName: string) => {
    if (!driveToken) return;
    setDriveDownloading(true);
    try {
      const base64Data = await downloadDriveImageAsBase64(fileId, driveToken);
      setNewCandPhoto(base64Data);
      setDriveModalOpen(false);
      alert(`Success: Profile photo successfully imported from Google Drive ("${fileName}").`);
    } catch (err: any) {
      alert(`Could not download image from Google Drive: ${err.message || err}`);
    } finally {
      setDriveDownloading(false);
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsLocalLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewCandPhoto(event.target.result as string);
        alert(`Success: Local profile photo uploaded successfully ("${file.name}").`);
      }
      setIsLocalLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read local file.');
      setIsLocalLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // New Voter States
  const [newVoterId, setNewVoterId] = useState('');
  const [newVoterName, setNewVoterName] = useState('');
  const [newVoterEmail, setNewVoterEmail] = useState('');
  const [newVoterPass, setNewVoterPass] = useState('');
  const [newVoterDept, setNewVoterDept] = useState<Department>('Computer Science');
  const [newVoterRole, setNewVoterRole] = useState<UserRole>(UserRole.VOTER);

  // Dynamic Auto-ID Assignment
  useEffect(() => {
    let prefix = 'STUD';
    if (newVoterRole === UserRole.OFFICER) {
      prefix = 'OFFICER';
    } else if (newVoterRole === UserRole.ADMIN) {
      prefix = 'ADMIN';
    }

    const matchingIds = users
      .map(u => u.studentId.trim().toUpperCase())
      .filter(id => id.startsWith(prefix));

    let maxNum = 0;
    matchingIds.forEach(id => {
      const numStr = id.substring(prefix.length);
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    });

    // Default base fallback offsets matching our seeds
    if (maxNum === 0) {
      if (newVoterRole === UserRole.VOTER) maxNum = 7; // Seeds STUD007
      else if (newVoterRole === UserRole.OFFICER) maxNum = 202; // Seeds OFFICER202
      else if (newVoterRole === UserRole.ADMIN) maxNum = 101; // Seeds ADMIN101
    }

    const nextNumber = maxNum + 1;
    let nextId = '';
    if (newVoterRole === UserRole.VOTER) {
      nextId = `STUD${String(nextNumber).padStart(3, '0')}`;
    } else {
      nextId = `${prefix}${nextNumber}`;
    }
    setNewVoterId(nextId);
  }, [newVoterRole, users]);

  // Search filter logs
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Trigger handlers
  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElecTitle || !newElecStart || !newElecEnd) {
      alert('Please fill out all election coordination fields.');
      return;
    }

    const newElection: Election = {
      id: `elec-${Date.now()}`,
      title: newElecTitle,
      startDate: new Date(newElecStart).toISOString(),
      endDate: new Date(newElecEnd).toISOString(),
      status: 'upcoming'
    };

    onAddElection(newElection);
    
    // Log Security
    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `New upcoming student election registered: "${newElecTitle}"`,
          'success'
        )
      ]);
    }

    setNewElecTitle('');
    setNewElecStart('');
    setNewElecEnd('');
    alert('Consensus Success: Election registered. Declare positions next.');
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElecForPos || !newPosName) {
      alert('Missing election link or position title.');
      return;
    }

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      electionId: selectedElecForPos,
      positionName: newPosName
    };

    onAddPosition(newPosition);

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `Added voting portfolio: "${newPosName}" for Election ID ${selectedElecForPos}`,
          'success'
        )
      ]);
    }

    setNewPosName('');
    alert('Consensus Success: Portfolio entry added.');
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosForCand || !newCandName || !newCandManifesto) {
      alert('Please complete candidate profile & portfolio linkage fields.');
      return;
    }

    const matchedPos = positions.find(p => p.id === selectedPosForCand);
    if (!matchedPos) return;

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    ];
    const randomizedPhoto = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      positionId: selectedPosForCand,
      electionId: matchedPos.electionId,
      name: newCandName,
      photoUrl: newCandPhoto.trim() || randomizedPhoto,
      department: newCandDept,
      manifesto: newCandManifesto,
      approved: true
    };

    onAddCandidate(newCandidate);

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `Enrolled student candidate: "${newCandName}" for portfolio ID ${selectedPosForCand}`,
          'success'
        )
      ]);
    }

    setNewCandName('');
    setNewCandManifesto('');
    setNewCandPhoto('');
    alert('Consensus Success: Candidate published to active ballots.');
  };

  const handleCreateVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterId || !newVoterName || !newVoterEmail || !newVoterPass) {
      alert('Voter credentials parameters incomplete.');
      return;
    }

    // Check duplicate studentId
    const isDuplicate = users.some(u => u.studentId.trim().toUpperCase() === newVoterId.trim().toUpperCase());
    if (isDuplicate) {
      alert(`Security Gate Violation: Student ID "${newVoterId}" is already registered in user registries.`);
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      studentId: newVoterId.toUpperCase(),
      name: newVoterName,
      email: newVoterEmail,
      passwordHash: newVoterPass,
      role: newVoterRole,
      department: newVoterDept,
      votedStatus: {},
      otpVerified: false,
      registeredDate: new Date().toISOString()
    };

    onAddUser(newUser);

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `Registered academic user profile: ${newVoterName} (${newVoterId} - ${newVoterRole})`,
          'success'
        )
      ]);
    }

    setNewVoterId('');
    setNewVoterName('');
    setNewVoterEmail('');
    setNewVoterPass('');
    alert(`Consensus Success: User profile "${newVoterName}" registered successfully with auto-assigned ID: ${newVoterId}`);
  };

  const toggleElection = (electionId: string, currentStatus: string) => {
    let nextStatus: 'upcoming' | 'active' | 'completed' = 'upcoming';
    if (currentStatus === 'upcoming') nextStatus = 'active';
    else if (currentStatus === 'active') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'active';

    onToggleElectionStatus(electionId, nextStatus);

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `Modified Election [${electionId}] status constraint to: "${nextStatus}"`,
          'success'
        )
      ]);
    }
  };

  const deleteElec = (id: string, name: string) => {
    setConfirmDeleteElec({ id, name });
  };

  const handleConfirmDeleteElec = () => {
    if (!confirmDeleteElec) return;
    const { id, name } = confirmDeleteElec;
    onDeleteElection(id);
    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Administrator',
          `Deleted entire database matrix of Election "${name}" (ID: "${id}")`,
          'danger'
        )
      ]);
    }
    setConfirmDeleteElec(null);
  };

  // Export logs to structured CSV local mock helper!
  const triggerLogExport = () => {
    const headers = ['LogID', 'UserID', 'UserName', 'Role', 'ActionLogged', 'Timestamp', 'IPAddress', 'Status'];
    const rows = logs.map(l => [
      l.id,
      l.userId,
      l.userName.replace(/,/g, ' '),
      l.role,
      l.action.replace(/,/g, ' '),
      l.dateTime,
      l.ipAddress,
      l.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consensus_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs list based on search bar
  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.role.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.ipAddress.includes(logSearchQuery)
  );

  return (
    <div id="admin-module-root" className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Side Control Desk Navigation */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coordination Core</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setAdminTab('elections')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'elections' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Elections Registry
            </button>

            <button
              onClick={() => setAdminTab('positions')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'positions' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4.5 h-4.5" />
              Ballot Portfolios
            </button>

            <button
              onClick={() => setAdminTab('candidates')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'candidates' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4.5 h-4.5" />
              Candidate Enrolment
            </button>

            <button
              onClick={() => setAdminTab('voters')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'voters' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4.5 h-4.5" />
              User Registrations
            </button>

            <button
              onClick={() => setAdminTab('logs')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'logs' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              Consensus Audit Logs
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-4">
          <Lock className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-605 tracking-wider font-mono block">Secured Admin Vault</span>
            <span className="text-[11px] text-slate-500">Every coordination act compiles cryptographic logs. Autonomic auditing active.</span>
          </div>
        </div>
      </div>

      {/* Main Command Center Screen */}
      <div className="xl:col-span-3">

        {/* Tab 1: Elections coordination & management */}
        {adminTab === 'elections' && (
          <div id="admin-elections-dashboard" className="space-y-8 animate-in fade-in duration-150">
            {/* Registered list */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Registered University Elections</h2>
              
              <div slot="elections-table" className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3 font-semibold">Title</th>
                      <th className="pb-3 font-semibold">Term Thresholds</th>
                      <th className="pb-3 font-semibold">Consensus Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {elections.map(elec => (
                      <tr key={elec.id} className="group hover:bg-slate-50/50">
                        <td className="py-4 font-semibold text-slate-900">{elec.title}</td>
                        <td className="py-4 text-slate-500 space-y-0.5">
                          <p>Start: {new Date(elec.startDate).toLocaleString()}</p>
                          <p>End: {new Date(elec.endDate).toLocaleString()}</p>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border ${
                            elec.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : elec.status === 'completed'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <Power className="w-2.5 h-2.5" />
                            {elec.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleElection(elec.id, elec.status)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                            >
                              Toggle Status
                            </button>
                            <button
                              onClick={() => deleteElec(elec.id, elec.title)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Launch New Student Election</h3>
              <form onSubmit={handleCreateElection} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Election Title / Scope</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SRC Executives Elections 2026"
                    value={newElecTitle}
                    onChange={(e) => setNewElecTitle(e.target.value)}
                    className="w-full xl:max-w-md px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newElecStart}
                      onChange={(e) => setNewElecStart(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newElecEnd}
                      onChange={(e) => setNewElecEnd(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Register Election Frame
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Position Portfolios */}
        {adminTab === 'positions' && (
          <div id="admin-positions-dashboard" className="space-y-8 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Election Portfolios / Positions</h2>
              
              <div slot="positions-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {elections.map(elec => {
                  const elecPosList = positions.filter(p => p.electionId === elec.id);
                  return (
                    <div key={elec.id} className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-blue-600 font-mono block mb-2">{elec.status} election</span>
                      <h3 className="text-sm font-bold text-slate-900">{elec.title}</h3>
                      
                      <div className="mt-4 space-y-2">
                        {elecPosList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No ballot positions announced yet. Use command below to announce.</p>
                        ) : (
                          elecPosList.map((pos, pIdx) => (
                            <div key={pos.id} className="flex items-center gap-2.5 bg-white border border-slate-150 p-2.5 rounded-xl text-xs text-slate-700 font-medium">
                              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">{pIdx+1}</span>
                              {pos.positionName}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create Position Form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Announce Custom Ballot Portfolio</h3>
              <form onSubmit={handleCreatePosition} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Target Election Scope</label>
                  <select
                    required
                    value={selectedElecForPos}
                    onChange={(e) => setSelectedElecForPos(e.target.value)}
                    className="w-full xl:max-w-md px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Connect with Election --</option>
                    {elections.map(el => (
                      <option key={el.id} value={el.id}>{el.title} ({el.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Portfolio Designation Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Secretary"
                    value={newPosName}
                    onChange={(e) => setNewPosName(e.target.value)}
                    className="w-full xl:max-w-md px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Publish Portfolio Slot
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Candidates Enrolment */}
        {adminTab === 'candidates' && (
          <div id="admin-candidates-dashboard" className="space-y-8 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Enrolled Student Candidates</h2>
              
              <div slot="cand-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {elections.map(el => {
                  const elCands = candidates.filter(c => c.electionId === el.id);
                  return (
                    <div key={el.id} className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                      <h3 className="font-bold text-sm text-slate-900">{el.title} Candidates</h3>
                      
                      <div className="divide-y divide-slate-150 bg-white border border-slate-150 rounded-xl overflow-hidden">
                        {elCands.length === 0 ? (
                          <p className="text-xs text-slate-405 p-4 italic">No candidates enrolled in this stream.</p>
                        ) : (
                          elCands.map(cand => {
                            const position = positions.find(p => p.id === cand.positionId);
                            return (
                              <div key={cand.id} className="flex items-center justify-between p-4 text-xs">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={cand.photoUrl} 
                                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" 
                                    referrerPolicy="no-referrer"
                                    alt={cand.name}
                                  />
                                  <div>
                                    <h4 className="font-bold text-slate-900">{cand.name}</h4>
                                    <p className="text-slate-500 font-semibold">{position?.positionName} | {cand.department}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onDeleteCandidate(cand.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enrol form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Enroll Candidate Profile</h3>
              <form onSubmit={handleCreateCandidate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Ballot Portfolio Slot</label>
                  <select
                    required
                    value={selectedPosForCand}
                    onChange={(e) => setSelectedPosForCand(e.target.value)}
                    className="w-full xl:max-w-md px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Associate Portfolio --</option>
                    {positions.map(p => {
                      const el = elections.find(e => e.id === p.electionId);
                      return (
                        <option key={p.id} value={p.id}>{p.positionName} ({el?.title})</option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Student Candidate Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Richard Kwame Gyamfi"
                      value={newCandName}
                      onChange={(e) => setNewCandName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Academic Department</label>
                    <select
                      value={newCandDept}
                      onChange={(e) => setNewCandDept(e.target.value as Department)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>
                </div>

                <div id="candidate-photo-selection-wrapper">
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Candidate Profile Photo (Optional)</label>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 xl:max-w-2xl">
                    {/* Visual Image Live Circle Preview */}
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative group self-center">
                      {newCandPhoto ? (
                        <>
                          <img 
                            src={newCandPhoto} 
                            alt="Candidate preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setNewCandPhoto('')}
                            className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold uppercase p-1 text-center cursor-pointer"
                          >
                            Reset
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* PC Local upload action */}
                        <label className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-xl cursor-pointer transition-all border ${
                          isLocalLoading 
                            ? 'bg-slate-200 text-slate-400 border-slate-300' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950 active:scale-[0.98]'
                        }`}>
                          {isLocalLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>Local Computer</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLocalFileChange} 
                            disabled={isLocalLoading} 
                            className="hidden" 
                          />
                        </label>

                        {/* Google Drive load action */}
                        <button
                          type="button"
                          onClick={handleOpenDriveExplorer}
                          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-xl bg-blue-50/80 border border-blue-105 hover:bg-blue-100 text-blue-700 active:scale-[0.98] cursor-pointer transition-all"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Google Drive</span>
                        </button>

                        {/* Connected Token state indicator */}
                        {driveUser && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-mono font-bold border border-emerald-100 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Drive Auth Done
                            <button
                              type="button"
                              onClick={handleDriveDisconnect}
                              title="Sign out of Google Drive"
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3 h-3 ml-0.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
                          value={newCandPhoto}
                          onChange={(e) => setNewCandPhoto(e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 truncate font-mono"
                        />
                        {newCandPhoto && (
                          <button
                            type="button"
                            onClick={() => setNewCandPhoto('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-slate-400 mt-1 pl-1 leading-snug">
                        Local files or selected cloud items are loaded buffer-free using secure client-side binary channels.
                      </p>
                    </div>
                  </div>
                </div>

        {/* Google Drive Visual Media Grid Explorer Modal */}
        {driveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 font-sans">
            <div className="bg-white rounded-3xl w-full max-w-2xl h-[560px] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
              
              {/* Header Container */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    Secure Google Drive Explorer
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Select an active graphic photo asset directly from your target file vaults.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDriveModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filtering / User Account block */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search image files..."
                    value={driveSearchQuery}
                    onChange={(e) => setDriveSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {driveUser && (
                    <div className="text-[11px] text-right">
                      <p className="font-extrabold text-slate-800">{driveUser.displayName || 'Authorized User'}</p>
                      <p className="text-slate-500 font-mono text-[9px]">{driveUser.email}</p>
                    </div>
                  )}
                  {driveToken && (
                    <button
                      type="button"
                      onClick={() => loadDriveFiles(driveToken)}
                      title="Reload workspace files list"
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-800 cursor-pointer transition-all active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Secure content screen */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {driveLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-700 animate-pulse">Scanning cloud file schemas...</span>
                  </div>
                ) : driveDownloading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-700 animate-pulse">Downloading media stream directly...</span>
                    <span className="text-[10px] text-slate-400">Performing secure client-side Base64 decryption</span>
                  </div>
                ) : driveError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Cloud Sync Failure</h4>
                      <p className="text-xs text-rose-600 mt-1 font-semibold">{driveError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenDriveExplorer}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Cloud className="w-3.5 h-3.5" /> Re-Authorize Google Drive
                    </button>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">No Target Images Detected</h4>
                      <p className="text-xs text-slate-500 mt-1">Could not locate any common photo image files (.png, .jpg) inside your top cloud directory files.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {driveFiles
                      .filter(file => file.name.toLowerCase().includes(driveSearchQuery.toLowerCase()))
                      .map(file => (
                        <div 
                          key={file.id}
                          onClick={() => handleSelectDriveFile(file.id, file.name)}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-2.5 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all flex flex-col h-full group select-none active:scale-[0.98]"
                        >
                          <div className="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden relative border border-slate-100">
                            {file.thumbnailLink ? (
                              <img 
                                src={file.thumbnailLink.replace(/=s\d+$/, '=s200')} 
                                alt={file.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-slate-300" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <span className="bg-white text-[10px] font-bold text-slate-800 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Choose
                              </span>
                            </div>
                          </div>
                          <div className="p-1.5 mt-1 flex-1 flex flex-col justify-between">
                            <p className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 truncate" title={file.name}>
                              {file.name}
                            </p>
                            {file.size && (
                              <p className="text-[9px] font-mono text-slate-400 mt-1">
                                {Math.round(parseInt(file.size) / 1024)} KB
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Bottom controls panel */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono tracking-wider">SECURE CLOUD CRYPTOGRAPHIC GATEWAY</span>
                <button
                  type="button"
                  onClick={() => setDriveModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Manifesto Agenda Statement</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Announce your democratic promises to the student body here..."
                    value={newCandManifesto}
                    onChange={(e) => setNewCandManifesto(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Announce Candidate Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: User Registrations */}
        {adminTab === 'voters' && (
          <div id="admin-voters-dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-150">
            {/* Create registration form */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Register User Profile</h3>
              
              <form onSubmit={handleCreateVoter} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Student Index / Access ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      required
                      placeholder="e.g. STUD008"
                      value={newVoterId}
                      className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-blue-700 font-mono font-bold cursor-not-allowed focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase py-0.5 px-2 bg-blue-105 bg-blue-100 text-blue-800 rounded">
                      Auto Locked
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Programmatically calculated and locked based on standard academic sequence protocols.</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priscilla Adwoa Mensah"
                    value={newVoterName}
                    onChange={(e) => setNewVoterName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Academic Email</label>
                  <input
                    type="email"
                    required
                    placeholder="p.mensah@student.edu.gh"
                    value={newVoterEmail}
                    onChange={(e) => setNewVoterEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Secure Pin / Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Password choice"
                    value={newVoterPass}
                    onChange={(e) => setNewVoterPass(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Department</label>
                    <select
                      value={newVoterDept}
                      onChange={(e) => setNewVoterDept(e.target.value as Department)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Vault Role</label>
                    <select
                      value={newVoterRole}
                      onChange={(e) => setNewVoterRole(e.target.value as UserRole)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="voter">Voter/Student</option>
                      <option value="officer">Election Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Grant Access Passport
                </button>
              </form>
            </div>

            {/* Voter Register List */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <h3 className="text-lg font-bold text-slate-900">Registered Access Profiles</h3>
                <span className="text-xs text-slate-550 bg-slate-100 px-2.5 py-1 rounded-full font-mono font-medium">
                  {users.length} Users Enscribed
                </span>
              </div>
              
              <div slot="registered-users-list" className="overflow-y-auto max-h-[500px] divide-y divide-slate-100 scrollbar-thin">
                {users.map(u => (
                  <div key={u.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{u.name}</h4>
                      <p className="text-slate-500 font-semibold">{u.studentId} | {u.email} | <span className="text-slate-700">{u.department}</span></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin'
                        ? 'bg-rose-50 text-rose-705 border-rose-100'
                        : u.role === 'officer'
                          ? 'bg-indigo-50 text-indigo-705 border-indigo-100'
                          : 'bg-green-50 text-green-705 border-green-100'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Consensus Audit Logs */}
        {adminTab === 'logs' && (
          <div id="admin-logs-dashboard" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Autonomic Coordination Logs</h2>
                <p className="text-slate-500 text-xs mt-1">Immutable decentralized activity stream. Use spreadsheet to export records.</p>
              </div>
              <button
                onClick={triggerLogExport}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-4.5 h-4.5" />
                Export CSV Sheet
              </button>
            </div>

            {/* Audit log search query */}
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search audit parameters by User/Role/Action/IP..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Logs table */}
            <div slot="audit-logs-table" className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[10px] text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest font-bold font-sans">
                    <th className="pb-3">Timestamp / IP</th>
                    <th className="pb-3">Origin Handlers</th>
                    <th className="pb-3">Audit Details</th>
                    <th className="pb-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(l => (
                    <tr key={l.id} className="group hover:bg-slate-50/50">
                      <td className="py-3.5 pr-2">
                        <p className="font-semibold text-slate-900 font-sans">{new Date(l.dateTime).toLocaleTimeString()}</p>
                        <p className="text-[9px] text-slate-400">{l.ipAddress}</p>
                      </td>
                      <td className="py-3.5 pr-2 font-sans font-semibold">
                        <span className="text-slate-800 block">{l.userName}</span>
                        <span className="text-[9px] text-slate-500 uppercase">{l.role}</span>
                      </td>
                      <td className="py-3.5 pr-2 max-w-sm font-sans text-xs text-slate-650 leading-relaxed capitalize-first">
                        {l.action}
                      </td>
                      <td className="py-3.5 text-right font-sans">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          l.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : l.status === 'warning'
                              ? 'bg-amber-100 text-amber-705'
                              : 'bg-rose-50 text-rose-705'
                        }`}>
                          {l.status === 'success' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom, Sandboxed-Safe Deletion Confirmation Modal */}
      {confirmDeleteElec && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-6 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900">
                <AlertCircle className="w-6 h-6 shrink-0" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-sans">
                  Permanently Delete Election?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Warning: You are about to permanently delete the election <strong className="text-slate-900 dark:text-slate-100">"{confirmDeleteElec.name}"</strong>, including all of its associate portfolios, candidate profiles, and cast ledger ballots.
                </p>
                <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/40 rounded-xl text-[11px] text-rose-800 dark:text-rose-300">
                  This transaction is authoritative and cannot be reversed or decrypted.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteElec(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteElec}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-rose-600/15"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
