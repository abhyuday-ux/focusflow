import React, { useState, useMemo } from 'react';
import { StudySession, Subject, AppTheme } from '../types';

interface CalendarViewProps {
  sessions: StudySession[];
  subjects: Subject[];
  theme: AppTheme;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ sessions, subjects, theme }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const numDays = daysInMonth(month, year);
  const startOffset = firstDayOfMonth(month, year);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  // Compute daily totals AND subject breakdowns
  const dailyDetail = useMemo(() => {
    return sessions.reduce((acc: Record<string, { total: number; subjects: Record<string, number>; sessionList: StudySession[] }>, s: StudySession) => {
      if (!acc[s.date]) {
        acc[s.date] = { 
          total: 0, 
          subjects: {} as Record<string, number>,
          sessionList: []
        };
      }
      acc[s.date].total += s.duration;
      acc[s.date].subjects[s.subjectId] = (acc[s.date].subjects[s.subjectId] || 0) + s.duration;
      acc[s.date].sessionList.push(s);
      return acc;
    }, {} as Record<string, { total: number; subjects: Record<string, number>; sessionList: StudySession[] }>);
  }, [sessions]);

  const getHeatColor = (seconds: number) => {
    if (!seconds) return 'bg-slate-900 border-slate-800/40 text-slate-600';
    if (seconds < 1800) return 'bg-orange-950/40 text-orange-200 border-orange-900/30'; 
    if (seconds < 3600) return 'bg-orange-900/60 text-orange-100 border-orange-800/40'; 
    if (seconds < 7200) return 'bg-orange-700 text-white border-orange-600/40'; 
    if (seconds < 14400) return 'bg-orange-500 text-white border-orange-400/40'; 
    if (seconds < 21600) return 'bg-orange-400 text-white border-orange-300/40'; 
    return 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/20'; 
  };

  /**
   * Refined Intensity Logic for Subject Blocks (YPT Style)
   * Scaling opacity/saturation based on absolute time studied for that subject.
   */
  const getSubjectIntensity = (seconds: number) => {
    if (seconds >= 7200) return 1.0; // 2h+ Full power
    if (seconds >= 3600) return 0.75; // 1h+ Strong
    if (seconds >= 1800) return 0.5;  // 30m+ Moderate
    return 0.3; // Light
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  const formatTimeShort = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    return `${m}m`;
  };

  const daysArray = [];
  for (let i = 0; i < startOffset; i++) daysArray.push(null);
  for (let i = 1; i <= numDays; i++) daysArray.push(i);

  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#334155';
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';

  const selectedDayData = selectedDayStr ? dailyDetail[selectedDayStr] : null;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12 relative">
      
      {/* Daily Time Sheet Modal Overlay */}
      {selectedDayStr && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedDayStr(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-white">Focus Time Sheet</h2>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedDayStr}</p>
              </div>
              <button 
                onClick={() => setSelectedDayStr(null)}
                className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Timeline View */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950/20 custom-scrollbar">
              <div className="relative min-h-[1440px] flex">
                
                {/* Time Labels */}
                <div className="w-16 shrink-0 border-r border-slate-800/50 flex flex-col">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="h-20 -mt-2.5 text-[10px] font-black text-slate-600 text-right pr-4 uppercase">
                      {i.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Timeline Grid */}
                <div className="flex-1 relative ml-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="h-20 border-b border-slate-800/30 w-full"></div>
                  ))}

                  {/* Sessions Rendered as Blocks */}
                  {selectedDayData?.sessionList.map((s) => {
                    const startDate = new Date(s.startTime);
                    const startHours = startDate.getHours();
                    const startMinutes = startDate.getMinutes();
                    const top = (startHours * 80) + (startMinutes * 80 / 60);
                    const height = (s.duration / 60) * (80 / 60);

                    return (
                      <div 
                        key={s.id}
                        style={{ 
                          top: `${top}px`, 
                          height: `${Math.max(height, 10)}px`,
                          backgroundColor: getSubjectColor(s.subjectId),
                          boxShadow: `0 8px 32px -8px ${getSubjectColor(s.subjectId)}88`,
                          opacity: getSubjectIntensity(s.duration) * 0.4 + 0.6 // Boost visibility in timeline
                        }}
                        className="absolute left-2 right-4 rounded-xl border border-white/20 p-3 overflow-hidden group transition-all hover:z-20 hover:scale-[1.02] cursor-default"
                      >
                        <div className="flex justify-between items-start gap-2">
                           <p className="text-[10px] font-black uppercase text-white tracking-tighter truncate">
                             {getSubjectName(s.subjectId)}
                           </p>
                           <p className="text-[9px] font-mono text-white/70 whitespace-nowrap">
                             {formatTimeShort(s.duration)}
                           </p>
                        </div>
                        {height > 40 && (
                          <p className="text-[8px] text-white/50 mt-1 uppercase font-bold tracking-tighter">
                            Started {startHours.toString().padStart(2, '0')}:{startMinutes.toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="p-8 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Total</p>
                  <p className="text-2xl font-black text-white">{formatTimeShort(selectedDayData?.total || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sessions</p>
                  <p className="text-2xl font-black text-white">{selectedDayData?.sessionList.length || 0}</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {selectedDayData && Object.keys(selectedDayData.subjects).map(sid => (
                  <div 
                    key={sid} 
                    className="w-8 h-8 rounded-full border-2 border-slate-900 shadow-lg" 
                    style={{ backgroundColor: getSubjectColor(sid) }}
                    title={getSubjectName(sid)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">{monthName} <span className="text-slate-500">{year}</span></h1>
          <p className="text-slate-400 font-medium">Visualizing your focus timeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 mr-4 shadow-inner">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button onClick={() => setViewDate(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-slate-800 rounded-lg transition-colors">Today</button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 p-4 md:p-8 rounded-[2.5rem] border border-slate-800/60 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {daysArray.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="aspect-square opacity-0"></div>;
            
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const data = dailyDetail[dateStr];
            const duration: number = data ? data.total : 0;
            
            return (
              <div 
                key={dateStr}
                onClick={() => setSelectedDayStr(dateStr)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all group relative border-2 overflow-hidden shadow-lg hover:z-20 cursor-pointer active:scale-95 ${getHeatColor(duration)}`}
              >
                <span className={`text-sm font-black mb-1 ${duration > 14400 ? 'text-slate-950' : ''}`}>{day}</span>
                
                {duration > 0 && data && (
                  <>
                    {/* Refined Subject Distribution Strips (YPT Style) */}
                    <div className="absolute bottom-0 left-0 w-full h-2.5 flex bg-black/10">
                      {Object.entries(data.subjects).map(([sid, dur]) => (
                        <div 
                          key={sid}
                          style={{ 
                            width: `${((dur as number) / (duration || 1)) * 100}%`,
                            backgroundColor: getSubjectColor(sid),
                            opacity: getSubjectIntensity(dur as number), // Refined intensity/saturation
                          }}
                          /* DO cast dur to number as Object.entries value is inferred as unknown in some environments */
                          className={`h-full transition-all duration-500 ${(dur as number) >= 7200 ? 'shadow-[0_-4px_8px_-2px_rgba(255,255,255,0.3)] z-10' : ''}`}
                        />
                      ))}
                    </div>

                    {/* Sheet Indicator */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded px-1.5 py-0.5 text-[7px] font-black text-white pointer-events-none uppercase tracking-tighter">
                      Open Sheet
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 pt-4">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col gap-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensity Legend</h3>
           <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800" title="No study"></div>
              <div className="w-5 h-5 rounded-md bg-orange-950/40" title="< 30m"></div>
              <div className="w-5 h-5 rounded-md bg-orange-700" title="1h - 2h"></div>
              <div className="w-5 h-5 rounded-md bg-orange-500" title="2h - 4h"></div>
              <div className="w-5 h-5 rounded-md bg-amber-400" title="6h+"></div>
            </div>
            <span className="text-xs font-bold text-slate-400">Lower → Higher</span>
           </div>
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight italic">Click a day to view its detailed focus sheet</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
          <div className="bg-slate-900/40 border border-slate-800/50 px-6 py-4 rounded-[2rem] flex flex-col items-center shadow-xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter mb-1">Study Streak</p>
            <p className="text-3xl font-black text-white">
              {Object.keys(dailyDetail).length} <span className="text-xs text-slate-600">days</span>
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/50 px-6 py-4 rounded-[2rem] flex flex-col items-center shadow-xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter mb-1">Monthly Focus</p>
            <p className="text-3xl font-black text-orange-400">
              {Math.floor(sessions.filter(s => s.date.startsWith(`${year}-${(month+1).toString().padStart(2, '0')}`)).reduce((acc: number, s: StudySession) => acc + s.duration, 0) / 3600)}<span className="text-xs ml-0.5">h</span>
            </p>
          </div>
          <div className="hidden md:flex bg-slate-900/40 border border-slate-800/50 px-6 py-4 rounded-[2rem] flex-col items-center shadow-xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter mb-1">Avg Session</p>
            <p className="text-3xl font-black text-white">
              {sessions.length > 0 ? Math.floor((sessions.reduce((acc: number, s: StudySession) => acc + s.duration, 0) / (sessions.length || 1)) / 60) : 0}<span className="text-xs ml-0.5">m</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
