import React, { useState } from 'react';
import { User, Election, Position, Candidate, Block, AuditLog } from '../types';
import { createLog } from '../utils/crypto';
import { 
  Eye, 
  Search, 
  ShieldCheck, 
  Radio, 
  AlertTriangle, 
  Check, 
  UserX, 
  Activity, 
  Lock, 
  Cpu, 
  UserCheck 
} from 'lucide-react';

interface OfficerPanelProps {
  currentUser: User | null;
  users: User[];
  elections: Election[];
  blocks: Block[];
  logs: AuditLog[];
  onAddLogs: (logs: AuditLog[]) => void;
  onVerifyStudentBiometrics: (userId: string) => void;
}

export default function OfficerPanel({
  currentUser,
  users,
  elections,
  blocks,
  logs,
  onAddLogs,
  onVerifyStudentBiometrics
}: OfficerPanelProps) {
  // Search state
  const [voterQuery, setVoterQuery] = useState('');
  const [queriedStudent, setQueriedStudent] = useState<User | null>(null);

  // Fraud alerts state representation (academic project requirement mock)
  const [anomalies, setAnomalies] = useState([
    {
      id: 'fraud-1',
      type: 'IP Collision Threat',
      description: 'Multiple voter transactions detected originating from off-campus subnet IP 109.28.140.22',
      severity: 'warning' as const,
      timestamp: '2026-06-12T11:05:00.000Z',
      status: 'Investigating'
    },
    {
      id: 'fraud-2',
      type: 'Consensus Block Speed Alert',
      description: 'Consecutive blockchain blocks mined below 2s index limits. Normal Proof-of-Work requires 10s.',
      severity: 'danger' as const,
      timestamp: '2026-06-12T09:15:30.000Z',
      status: 'Investigating'
    },
    {
      id: 'fraud-3',
      type: 'Concurrent Session Guard',
      description: 'Concurrent sign-ins matched on STUD001 from chrome and mobile footprints.',
      severity: 'warning' as const,
      timestamp: '2026-06-12T09:12:00.000Z',
      status: 'Active Audit'
    }
  ]);

  const handleSearchVoter = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.studentId.trim().toUpperCase() === voterQuery.trim().toUpperCase());
    if (found) {
      setQueriedStudent(found);
    } else {
      setQueriedStudent(null);
      alert(`Search Warning: Student index "${voterQuery}" not found in academic voter registers.`);
    }
  };

  const handleManualBiometricOverride = (userId: string) => {
    onVerifyStudentBiometrics(userId);
    
    // update queried visual state
    if (queriedStudent && queriedStudent.id === userId) {
      setQueriedStudent(prev => prev ? { ...prev, otpVerified: true } : null);
    }

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Election Officer',
          `Manual administrative manual biometric bypass approved for student ID: ${userId}`,
          'warning'
        )
      ]);
    }
    alert('Security Bypass Success: Student biometrics registry manually verified/approved.');
  };

  const clearAnomaly = (id: string, name: string) => {
    setAnomalies(prev => prev.map(anom => {
      if (anom.id === id) {
        return { ...anom, status: 'Cleared [Authorized]' };
      }
      return anom;
    }));

    if (currentUser) {
      onAddLogs([
        createLog(
          currentUser.id,
          currentUser.name,
          'Election Officer',
          `Cleared security anomaly alert #${id} (${name}) after manual device footprint triage`,
          'success'
        )
      ]);
    }
  };

  return (
    <div id="officer-module-root" className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Col 1: Voter Registry Query & Bypass Suite */}
      <div className="xl:col-span-1 space-y-8 animate-in fade-in duration-150">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="text-md font-bold text-slate-900">Voter Registry Search</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">Identify details, ballot clearances, and biometric state indexes of student profiles in real time.</p>

          <form onSubmit={handleSearchVoter} className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                required
                placeholder="Search Student ID (e.g., STUD003)"
                value={voterQuery}
                onChange={(e) => setVoterQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all text-center cursor-pointer"
            >
              Query Student Record
            </button>
          </form>

          {/* Results Display */}
          {queriedStudent ? (
            <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50 text-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-150 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{queriedStudent.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{queriedStudent.studentId}</span>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-bold text-[9px] uppercase">
                  ACTIVE REG
                </span>
              </div>

              <div className="space-y-2.5 text-slate-600 select-none">
                <p className="flex justify-between">
                  <span>Department Block:</span>
                  <span className="font-semibold text-slate-800">{queriedStudent.department}</span>
                </p>
                <p className="flex justify-between">
                  <span>MFA Status (OTP):</span>
                  <span className={`font-semibold ${queriedStudent.otpVerified ? 'text-green-600' : 'text-slate-550'}`}>
                    {queriedStudent.otpVerified ? 'Verified' : 'Awaiting verification'}
                  </span>
                </p>
                
                {/* Voting statuses */}
                <div className="pt-2 border-t border-slate-150">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Cast Ballots Clearance</span>
                  {elections.map(el => {
                    const hasVoted = queriedStudent.votedStatus[el.id];
                    return (
                      <p key={el.id} className="flex justify-between py-1">
                        <span className="truncate max-w-[150px]">{el.title.split(' ')[0]} {el.id.includes('src') ? 'SRC' : 'IT'}:</span>
                        <span className={`font-bold font-mono ${hasVoted ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {hasVoted ? 'CAST (CLOSED)' : 'AWAITING'}
                        </span>
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Manual Override Action link */}
              {!queriedStudent.otpVerified && (
                <div className="pt-4 border-t border-slate-150">
                  <button
                    onClick={() => handleManualBiometricOverride(queriedStudent.id)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve Biometric Override
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
              <Eye className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <span>Enter a voter ID key above to inspect audit trails</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Fraud Alerts Module (Advanced Thesis features) */}
      <div className="xl:col-span-2 space-y-8 animate-in fade-in duration-155">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-rose-600 animate-pulse" />
            <h3 className="text-md font-bold text-slate-900">AI Fraud & Security Anomalies Detector</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">Predictive AI scripts running heuristics over incoming server logins and voter block-mine intervals.</p>

          <div slot="anomalies-list" className="space-y-4">
            {anomalies.map(anom => {
              const isDanger = anom.severity === 'danger';
              const isCleared = anom.status.includes('Cleared');
              
              return (
                <div 
                  key={anom.id} 
                  className={`border rounded-2xl p-5 transition-all text-xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                    isCleared
                      ? 'bg-slate-50 border-slate-200'
                      : isDanger 
                        ? 'bg-rose-50/50 border-rose-200' 
                        : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        isCleared
                          ? 'bg-slate-200 text-slate-600'
                          : isDanger
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {anom.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(anom.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className={`font-semibold  ${isCleared ? 'text-slate-500 line-through' : 'text-slate-850'}`}>
                      {anom.description}
                    </p>
                    <p className="text-[10px] text-slate-400">Status Target: <span className="font-mono font-semibold text-slate-600">{anom.status}</span></p>
                  </div>

                  {!isCleared && (
                    <button
                      onClick={() => clearAnomaly(anom.id, anom.type)}
                      className="px-3 py-1.5 shrink-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-all self-end md:self-start flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="text-emerald-600 w-3.5 h-3.5" />
                      Clear [Sign]
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time audit block consensus visualization feed */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_bottom,#3b82f610,#00000000)]" />
          <div className="flex items-center gap-2.5 mb-4 relative z-10">
            <Cpu className="w-5 h-5 text-blue-400 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">Blockchain Node Ledger Stream</span>
          </div>
          
          <div slot="ledger-ticker" className="space-y-2 font-mono text-[10px] text-slate-400 relative z-10 h-32 overflow-y-auto scrollbar-thin">
            {blocks.slice(-4).map((b, bIdx) => (
              <p key={bIdx} className="leading-relaxed">
                <span className="text-blue-500">[{b.timestamp.split('T')[1].substring(0,8)}]</span> Block #{b.index} consensus committed. Previous node anchor matched. Hash signature: <span className="text-green-400 font-bold">{b.hash.substring(0, 16)}...</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
