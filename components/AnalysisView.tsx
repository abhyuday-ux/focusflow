
import React, { useMemo } from 'react';
/* Added AppTheme import */
import { StudySession, Subject, AppTheme } from '../types';
import { PieChart } from './PieChart';

interface AnalysisViewProps {
  sessions: StudySession[];
  subjects: Subject[];
  /* Added theme property to props interface */
  theme: AppTheme;
}

/* Destructured theme from props */
export const AnalysisView: React.FC<AnalysisViewProps> = ({ sessions, subjects, theme }) => {
  // Aggregate data for the pie chart
  const breakdownData = useMemo(() => {
    const data: Record<string, number> = {};
    subjects.forEach(s => data[s.id] = 0);
    
    sessions.forEach(s => {
      if (data[s.subjectId] !== undefined) {
        data[s.subjectId] += s.duration;
      }
    });

    return subjects
      .map(s => ({
        label: s.name,
        value: data[s.id],
        color: s.color
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by most studied
  }, [sessions, subjects]);

  const totalTime = useMemo(() => 
    sessions.reduce((acc, s) => acc + s.duration, 0), 
  [sessions]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const weeklyTotal = last7Days.reduce((acc, s) => acc + s.duration, 0);
    return {
      total: weeklyTotal,
      avg: weeklyTotal / 7,
      sessionsCount: last7Days.length
    };
  }, [sessions]);

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatHoursDecimal = (seconds: number) => {
    return (seconds / 3600).toFixed(1) + 'h';
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-slate-400">Deep dive into your focus patterns</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Rank</p>
          <p className="text-xl font-bold text-orange-400">Top 5% Learner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>

          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Focus Distribution
          </h3>

          {breakdownData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative flex-shrink-0">
                <PieChart data={breakdownData} />
              </div>
              
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                  <span>Subject</span>
                  <span>Time / Share</span>
                </div>
                {breakdownData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-default p-2 rounded-xl hover:bg-slate-800/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-md shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}44` }}></div>
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-semibold text-sm group-hover:text-orange-400 transition-colors">{item.label}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Rank #{idx + 1}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-200 font-mono text-sm font-bold">{formatHours(item.value)}</p>
                      <p className="text-slate-500 font-mono text-[10px] uppercase">{((item.value / totalTime) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-80 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
              <span className="text-5xl mb-4 grayscale opacity-30">📊</span>
              <p className="font-medium">No sessions recorded yet.</p>
              <p className="text-sm">Head back to the Timer to start your first session.</p>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-8 rounded-[2rem] shadow-xl shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 <w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
            <h3 className="text-orange-100 text-xs uppercase font-black tracking-widest mb-4">Total Achievement</h3>
            <p className="text-6xl font-black mb-2 tabular-nums">{formatHoursDecimal(totalTime).split('h')[0]}<span className="text-2xl ml-1">h</span></p>
            <p className="text-orange-100/80 text-sm font-medium">Accumulated over {sessions.length} sessions</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
            <h3 className="text-slate-500 text-xs font-black uppercase mb-6 tracking-widest border-b border-slate-800 pb-4">7-Day Consistency</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-slate-100 font-bold">Total Focused</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">This Week</span>
                </div>
                <span className="text-2xl font-black text-orange-400 tabular-nums">{formatHoursDecimal(weeklySummary.total)}</span>
              </div>
              
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min((weeklySummary.total / 144000) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Avg / Day</p>
                  <p className="text-lg font-bold">{formatHoursDecimal(weeklySummary.avg)}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Sessions</p>
                  <p className="text-lg font-bold">{weeklySummary.sessionsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-orange-500/50 transition-colors group">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">💡</div>
          <h4 className="font-bold text-slate-100 mb-2">Study Pattern</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your sessions are usually longest during evening hours. Consider scheduling complex problem-solving for after 6 PM.
          </p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-orange-500/50 transition-colors group">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📈</div>
          <h4 className="font-bold text-slate-100 mb-2">Growth Metric</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            {breakdownData.length > 1 
              ? `You've mastered "${breakdownData[0].label}" with ${formatHours(breakdownData[0].value)}. Balance it out with more "${breakdownData[breakdownData.length-1].label}" sessions.`
              : "Focusing on a single subject builds deep expertise, but don't forget to diversify your study routine."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-orange-500/50 transition-colors group">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
          <h4 className="font-bold text-slate-100 mb-2">Milestone</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            You are only {formatHours(Math.max(36000 - totalTime, 0))} away from the "Bronze Focus" badge. Keep pushing your limits!
          </p>
        </div>
      </div>
    </div>
  );
};
