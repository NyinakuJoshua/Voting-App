import React, { useState, useEffect } from 'react';
import { Election } from '../types';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';

interface ElectionCountdownProps {
  elections: Election[];
  targetElectionId?: string;
  variant?: 'card' | 'compact' | 'mini';
}

export default function ElectionCountdown({ 
  elections, 
  targetElectionId, 
  variant = 'card' 
}: ElectionCountdownProps) {
  // Find target active election
  const activeElection = elections.find(e => {
    if (targetElectionId) {
      return e.id === targetElectionId && e.status === 'active';
    }
    return e.status === 'active';
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isClosed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!activeElection) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(activeElection.endDate) - +new Date();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isClosed: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isClosed: false,
      };
    };

    // Initial run
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeElection]);

  if (!activeElection || !timeLeft) {
    return null;
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // 1. Mini Badge variant
  if (variant === 'mini') {
    if (timeLeft.isClosed) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Polls Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-mono font-extrabold tracking-tight uppercase">
        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
        Time Left: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m {formatNumber(timeLeft.seconds)}s
      </span>
    );
  }

  // 2. Compact row variant
  if (variant === 'compact') {
    return (
      <div 
        id={`countdown-compact-${activeElection.id}`} 
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-blue-400 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-bold text-slate-450 tracking-wider">ACTIVE ELECTION DEADLINE</span>
            <h4 className="text-xs font-bold font-sans mt-0.5 truncate max-w-[200px] sm:max-w-xs">{activeElection.title}</h4>
          </div>
        </div>

        {timeLeft.isClosed ? (
          <div className="text-right">
            <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-extrabold rounded-lg uppercase tracking-wider">
              BALLOT CLOSED
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono">
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-blue-400">{formatNumber(timeLeft.days)}</span>
              <span className="text-[10px] font-semibold text-slate-400">d</span>
            </div>
            <span className="text-slate-650">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-blue-400">{formatNumber(timeLeft.hours)}</span>
              <span className="text-[10px] font-semibold text-slate-400">h</span>
            </div>
            <span className="text-slate-650">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-blue-400">{formatNumber(timeLeft.minutes)}</span>
              <span className="text-[10px] font-semibold text-slate-400">m</span>
            </div>
            <span className="text-slate-650">:</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-amber-400 animate-pulse">{formatNumber(timeLeft.seconds)}</span>
              <span className="text-[10px] font-semibold text-slate-400">s</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Luxurious complete card variant (Landing page default)
  return (
    <div 
      id={`countdown-card-${activeElection.id}`} 
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:px-6 md:py-3.5 max-w-4xl mx-auto shadow-lg relative overflow-hidden group select-none text-slate-950 dark:text-white font-sans transition-all duration-200"
    >
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl opacity-20" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 rounded-lg text-[9px] font-bold tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" /> Live Election Timer
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Deadline: {new Date(activeElection.endDate).toLocaleString()}
            </span>
          </div>
          <h3 className="text-sm md:text-base font-black text-slate-950 dark:text-white tracking-tight leading-snug truncate">
            {activeElection.title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xl truncate hidden sm:block">
            All voting queues close promptly on the concluding deadline. Results compilation starts immediately.
          </p>
        </div>

        {timeLeft.isClosed ? (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 rounded-xl px-4 py-2 text-center shrink-0">
            <h4 className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Elections Concluded</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Casting queue is locked</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 shrink-0 min-w-[240px]">
            {/* Days block */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-2 text-center flex flex-col items-center justify-center min-w-[54px] h-[52px]">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight font-mono">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Days</span>
            </div>

            {/* Hours block */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-2 text-center flex flex-col items-center justify-center min-w-[54px] h-[52px]">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight font-mono">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Hours</span>
            </div>

            {/* Minutes block */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-2 text-center flex flex-col items-center justify-center min-w-[54px] h-[52px]">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight font-mono">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Mins</span>
            </div>

            {/* Seconds block */}
            <div className="bg-amber-500 text-white rounded-xl p-2 text-center flex flex-col items-center justify-center animate-pulse border border-amber-600 min-w-[54px] h-[52px]">
              <span className="text-lg font-black leading-none tracking-tight font-mono">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[9px] font-bold uppercase mt-0.5 text-amber-50">Secs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
