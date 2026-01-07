
import React, { useMemo, useEffect, useState } from 'react';
import { Subject, StudySession, AppTheme } from '../types';

interface TimerViewProps {
  subjects: Subject[];
  sessions: StudySession[];
  dailyGoal: number;
  theme: AppTheme;
  seconds: number;
  isActive: boolean;
  selectedSubjectId: string;
  onToggle: () => void;
  onPause: () => void;
  onReset: () => void;
  onSelectSubject: (id: string) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ 
  subjects, 
  sessions, 
  dailyGoal, 
  theme, 
  seconds,
  isActive,
  selectedSubjectId,
  onToggle,
  onPause,
  onReset,
  onSelectSubject
}) => {
  const [isTick, setIsTick] = useState(false);

  // Trigger a visual "tick" state whenever seconds change
  useEffect(() => {
    if (isActive) {
      setIsTick(true);
      const timer = setTimeout(() => setIsTick(false), 150);
      return () => clearTimeout(timer);
    }
  }, [seconds, isActive]);

  const todaySeconds = useMemo(() => {
    // Corrected: Use local system date to match PC clock instead of UTC toISOString
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    return sessions
      .filter(s => s.date === today)
      .reduce((acc, s) => acc + s.duration, 0);
  }, [sessions]);

  const totalIncludingCurrent = todaySeconds + seconds;
  const goalProgress = Math.min((totalIncludingCurrent / dailyGoal) * 100, 100);

  const formatTimeParts = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const time = formatTimeParts(seconds);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  
  const accentTextClass = `text-${theme.primary}`;
  const accentBgClass = `bg-${theme.primary}`;
  const accentBorderClass = `border-${theme.primary}/40`;
  const accentShadowClass = `shadow-${theme.primary}/30`;

  // SVG ring properties
  const radius = 175;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (goalProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 animate-in fade-in zoom-in-95 duration-1000 py-10 relative overflow-hidden">
      
      {/* Top Momentum Bar */}
      <div className="w-full max-w-2xl text-center space-y-8 z-10">
        <div className="relative p-6 glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5"></div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Daily Target</p>
                <p className="text-sm font-bold text-slate-200">
                   {goalProgress.toFixed(1)}% <span className="text-slate-500 font-medium">to {dailyGoal/3600}h goal</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Total Focused</p>
                <p className={`text-sm font-black ${accentTextClass}`}>
                  {Object.values(formatTimeParts(totalIncludingCurrent)).join(':')}
                </p>
              </div>
            </div>
            
            <div className="w-full h-3 bg-slate-950/50 rounded-full border border-white/5 overflow-hidden p-0.5">
              <div 
                className={`h-full ${accentBgClass} rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_var(--accent-color)]`}
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex justify-center gap-3 flex-wrap animate-in slide-in-from-top-4 duration-700 delay-300">
          {subjects.map(s => (
            <button
              key={s.id}
              disabled={isActive}
              onClick={() => onSelectSubject(s.id)}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                selectedSubjectId === s.id 
                  ? `${accentBgClass} text-white shadow-2xl ${accentShadowClass} scale-105 border-transparent`
                  : 'bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              } ${isActive ? 'opacity-20 cursor-not-allowed grayscale' : 'active:scale-95'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Holographic Clock */}
      <div className="relative group flex items-center justify-center scale-90 md:scale-100 transition-transform">
        
        {/* Extreme Background Glow */}
        <div 
          className={`absolute -inset-24 rounded-full transition-all duration-1000 blur-[120px] ${isActive ? 'opacity-25 scale-125' : (seconds > 0 ? 'opacity-10 scale-110' : 'opacity-0 scale-50')}`}
          style={{ 
            backgroundColor: 'var(--accent-color)',
            transform: isTick ? 'scale(1.3)' : 'scale(1.25)' 
          }}
        ></div>

        {/* Energy Ripple Effect */}
        {isActive && (
          <div 
            key={seconds} 
            className="absolute w-[380px] h-[380px] rounded-full border border-white/20 animate-ping pointer-events-none"
            style={{ animationDuration: '1s' }}
          ></div>
        )}

        {/* SVG Progress Ring */}
        <div className="absolute inset-0 -m-8 pointer-events-none">
          <svg className="w-[450px] h-[450px] transform -rotate-90" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-900/40"
            />
            <circle
              cx="200"
              cy="200"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${accentTextClass} transition-all duration-1000 ease-in-out`}
              style={{ filter: `drop-shadow(0 0 ${isTick ? '12px' : '6px'} var(--accent-color))` }}
            />
          </svg>
        </div>

        {/* Central Vessel */}
        <div 
          className={`relative flex flex-col items-center justify-center w-[380px] h-[380px] rounded-full border-2 ${isActive ? accentBorderClass : (seconds > 0 ? 'border-slate-700' : 'border-slate-800')} glass shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-300 ${isActive ? 'scale-105' : ''}`}
          style={{ 
            transform: isTick ? 'scale(1.06)' : (isActive ? 'scale(1.05)' : 'scale(1)')
          }}
        >
          
          {/* Inner Rotating Shimmer */}
          {isActive && (
            <div className="absolute inset-4 border-t-2 border-r-2 border-transparent rounded-full animate-spin-slow opacity-20" style={{ borderColor: 'var(--accent-color)' }}></div>
          )}

          <span className={`text-[11px] font-black uppercase tracking-[0.8em] mb-4 transition-colors duration-700 ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
            {isActive ? 'Active session' : (seconds > 0 ? 'Paused' : 'Standby')}
          </span>

          <div className={`flex items-baseline font-mono font-black tabular-nums transition-all duration-300 ${isActive ? 'text-white scale-110' : (seconds > 0 ? 'text-slate-200' : 'text-slate-500')}`}>
            <span className="text-8xl">{time.h}</span>
            <span className={`text-6xl mx-1 opacity-50 ${isTick ? 'animate-pulse' : ''}`}>:</span>
            <span className="text-8xl">{time.m}</span>
            <span className={`text-6xl mx-1 opacity-50 ${isTick ? 'animate-pulse' : ''}`}>:</span>
            
            {/* Animated Seconds Part */}
            <div className="relative h-[80px] overflow-hidden">
               <span 
                 key={time.s} 
                 className="text-8xl inline-block animate-in slide-in-from-top-4 fade-in duration-200"
               >
                 {time.s}
               </span>
            </div>
          </div>

          <div 
            className="mt-8 px-10 py-3 rounded-full border border-white/5 font-black uppercase tracking-[0.4em] text-[12px] transition-all duration-500 shadow-inner overflow-hidden relative group"
            style={{ 
              color: isActive ? 'var(--accent-color)' : (seconds > 0 ? '#94a3b8' : '#475569'),
              backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent'
            }}
          >
            {isActive && <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}
            {currentSubject?.name || 'INITIALIZING'}
          </div>
          
          <div className={`mt-8 flex items-center gap-3 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
             <div className="flex gap-1">
               {[1,2,3].map(i => (
                 <div 
                   key={i} 
                   className={`w-1 h-1 rounded-full ${accentBgClass} animate-bounce`} 
                   style={{ animationDelay: `${i * 0.1}s` }}
                 ></div>
               ))}
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">In the flow</span>
          </div>
        </div>
      </div>

      {/* Control Command Center */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm pt-4 z-10">
        <div className="flex items-center gap-4 w-full">
          
          {/* Pause/Resume Toggle */}
          <div className="flex-1 relative group">
            {isActive && (
              <button
                onClick={onPause}
                className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-xl animate-in slide-in-from-right-8 fade-in"
                title="Pause flow"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
            )}

            <button
              onClick={onToggle}
              className={`w-full py-8 rounded-[3rem] text-2xl font-black transition-all duration-500 shadow-2xl uppercase tracking-[0.4em] active:scale-95 relative overflow-hidden group ${
                isActive 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/40 text-white border-b-4 border-rose-800' 
                  : `${accentBgClass} hover:brightness-110 shadow-xl ${accentShadowClass} text-white border-b-4 border-black/20`
              }`}
            >
              {isActive ? 'Cease fire' : (seconds > 0 ? 'Resume flow' : 'Ignite flow')}
            </button>

            {seconds > 0 && (
              <button
                onClick={onReset}
                className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-xl animate-in slide-in-from-left-8 fade-in"
                title="Reset session"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            )}
          </div>
        </div>
        
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
           <span className="w-8 h-[1px] bg-slate-800"></span>
           {isActive ? 'Focus intensity locked' : (seconds > 0 ? 'Flow state suspended' : 'Initialize focus routine')}
           <span className="w-8 h-[1px] bg-slate-800"></span>
        </p>
      </div>

      {/* Decorative background lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white"></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};
