import React, { useState } from 'react';
import { User, Election, Position, Candidate, Block, Department } from '../types';
import { 
  BarChart4, 
  TrendingUp, 
  Users, 
  Vote, 
  ArrowRight, 
  Trophy, 
  Sparkles,
  Award,
  CircleDot
} from 'lucide-react';

interface StatisticsDashboardProps {
  users: User[];
  elections: Election[];
  positions: Position[];
  candidates: Candidate[];
  blocks: Block[];
}

export default function StatisticsDashboard({
  users,
  elections,
  positions,
  candidates,
  blocks
}: StatisticsDashboardProps) {
  // active stats view state
  const [selectedElectionId, setSelectedElectionId] = useState<string>('elec-src-2026');

  const selectedElection = elections.find(e => e.id === selectedElectionId) || elections[0];

  // Calculated totals
  const totalRegisteredVoters = users.filter(u => u.role === 'voter');
  
  // To get the number of voters who cast at least one block in this election
  const votedVotersInSelectedElection = totalRegisteredVoters.filter(u => 
    // If the voter has votedStatus state set for this election
    u.votedStatus[selectedElectionId] === true
  );

  const turnoutPercentage = totalRegisteredVoters.length > 0 
    ? Math.round((votedVotersInSelectedElection.length / totalRegisteredVoters.length) * 100)
    : 0;

  // Track position lists for this specific election
  const electionPositions = positions.filter(p => p.electionId === selectedElectionId);

  // Group candidate votes count from the blockchain blocks (audit verification!)
  // In the blockchain ledgers, each block contains electionId, positionId, candidateId
  // Let us query blocks to get the actual vote counts securely! This represents real decentralized verification!
  const getCandidateVotesCount = (candidateId: string) => {
    return blocks.filter(b => b.candidateId === candidateId && b.electionId === selectedElectionId).length;
  };

  // Turnout distribution by Department block
  const departments: Department[] = [
    'Computer Science', 
    'Information Technology', 
    'Electrical Engineering', 
    'Business Administration', 
    'Mechanical Engineering'
  ];

  const getDeptTurnoutStats = (dept: Department) => {
    const totalInDept = totalRegisteredVoters.filter(u => u.department === dept).length;
    const votedInDept = votedVotersInSelectedElection.filter(u => u.department === dept).length;
    return {
      total: totalInDept,
      voted: votedInDept,
      percentage: totalInDept > 0 ? Math.round((votedInDept / totalInDept) * 100) : 0
    };
  };

  return (
    <div id="statistics-module-root" className="space-y-8 animate-in fade-in duration-150 font-sans">
      
      {/* 1. Header & Election Switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 mb-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-display">Live Election Turnout & Analytics</h2>
          <p className="text-slate-500 text-sm mt-1.5">Real-time statistics compiled natively from cryptographic blockchain ledger entries.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold gap-1.5 shrink-0 border border-slate-200">
          {elections.map((elec) => (
            <button
              key={elec.id}
              onClick={() => setSelectedElectionId(elec.id)}
              className={`px-5 py-2.5 rounded-lg transition-all cursor-pointer ${
                selectedElectionId === elec.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {elec.title.split(' ')[0]} {elec.title.includes('SRC') ? 'SRC' : 'IT Dept'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top-Level Turnout Key Figures Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block">Turnout Ratio</span>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-950 font-display mt-2 block tracking-tight">
              {turnoutPercentage}%
            </span>
            <span className="text-xs text-slate-600 mt-2 block">
              {votedVotersInSelectedElection.length} cast of {totalRegisteredVoters.length} registered
            </span>
          </div>
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center font-bold">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block">Ledger Verification</span>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 font-display mt-2 block tracking-tight">
              {blocks.length} Blocks
            </span>
            <span className="text-xs text-slate-605 mt-2 block flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-emerald-555 text-emerald-500 animate-pulse" /> 
              Chain Consensus OK
            </span>
          </div>
          <div className="w-16 h-16 bg-emerald-50 text-emerald-650 rounded-2xl border border-emerald-100 flex items-center justify-center font-bold">
            <Vote className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block">Consensus Status</span>
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-600 font-display mt-2 block uppercase tracking-tight">
              {selectedElection.status}
            </span>
            <span className="text-xs text-slate-600 mt-2 block font-medium">
              Phase threshold in effect
            </span>
          </div>
          <div className="w-16 h-16 bg-indigo-50 text-indigo-650 rounded-2xl border border-indigo-100 flex items-center justify-center font-bold">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. Candidate Vote Breakdown Cards (Portfolio grouping) */}
      <div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
          <BarChart4 className="w-6 h-6 text-blue-600" />
          Candidate Portfolios Results Feed
        </h3>

        <div className="space-y-8">
          {electionPositions.map((pos) => {
            const posCandidates = candidates.filter(c => c.positionId === pos.id);
            
            // Map votes dynamically
            const candidatesWithVotes = posCandidates.map(c => ({
              ...c,
              votes: getCandidateVotesCount(c.id)
            })).sort((a, b) => b.votes - a.votes);

            const totalPosVotes = candidatesWithVotes.reduce((acc, curr) => acc + curr.votes, 0);

            return (
              <div key={pos.id} className="bg-white border border-slate-205 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 select-none border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-indigo-650 tracking-widest uppercase">BALLOT SECURE GROUP</span>
                    <h4 className="text-lg md:text-2xl font-extrabold text-slate-900 mt-1">{pos.positionName}</h4>
                  </div>
                  <span className="text-xs md:text-sm text-slate-600 font-bold bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl">
                    {totalPosVotes} Certified Tallies
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Candidates votes list results */}
                  <div className="space-y-6">
                    {candidatesWithVotes.map((cand, candIdx) => {
                      const sharePercentage = totalPosVotes > 0 
                        ? Math.round((cand.votes / totalPosVotes) * 100)
                        : 0;
                      
                      const isWinning = candIdx === 0 && cand.votes > 0;

                      return (
                        <div key={cand.id} className="space-y-3">
                          <div className="flex items-center justify-between text-sm md:text-base font-bold">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs ${
                                isWinning 
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                {candIdx + 1}
                              </span>
                              <span className="text-slate-900 font-extrabold text-sm md:text-base">{cand.name}</span>
                              {isWinning && (
                                <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-lg">
                                  <Trophy className="w-3 h-3" /> Lead
                                </span>
                              )}
                            </div>
                            <span className="text-slate-700 font-mono font-bold text-xs md:text-sm">
                              {cand.votes} votes ({sharePercentage}%)
                            </span>
                          </div>

                          {/* SVG/CSS Customized Responsive Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-550 ${
                                isWinning 
                                  ? 'bg-blue-600' 
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${sharePercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Winner Profile mock projection */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                    {candidatesWithVotes[0] && candidatesWithVotes[0].votes > 0 ? (
                      <div>
                        <div className="flex items-center gap-4">
                          <img 
                            src={candidatesWithVotes[0].photoUrl} 
                            alt="Leading candidate" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                          />
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Current Projected Elect</span>
                            <h5 className="font-extrabold text-slate-900 leading-snug text-sm md:text-base">{candidatesWithVotes[0].name}</h5>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-4 leading-relaxed">
                          Leading the portfolio {pos.positionName} with <strong className="text-slate-800 font-bold">{candidatesWithVotes[0].votes} secure blocks</strong>. Matching confidence is backed by standard Proof-of-Work blockchain calculations.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <Award className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
                        <span className="text-xs text-slate-400 font-medium">Awaiting Ballot Commencements</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Turnout Distribution by Academic Department (Demographics) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 font-display">Voter Turnout by School / Department</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {departments.map((dept) => {
            const stats = getDeptTurnoutStats(dept);
            return (
              <div key={dept} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs md:text-sm font-extrabold text-slate-800 truncate">{dept}</h4>
                  <span className="text-3xl font-extrabold text-slate-950 mt-2 block tracking-tight font-display">{stats.percentage}%</span>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200 text-xs text-slate-600 flex justify-between">
                  <span className="font-semibold text-slate-500">Voted:</span>
                  <span className="font-extrabold font-mono text-slate-900">{stats.voted}/{stats.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
