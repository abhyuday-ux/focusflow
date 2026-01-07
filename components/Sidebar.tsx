
import React from 'react';
import { ViewType, AppTheme } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  theme: AppTheme;
  isTimerActive: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  theme, 
  isTimerActive, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const navItems = [
    { id: 'timer' as ViewType, label: 'Timer', icon: '⏱️' },
    { id: 'tasks' as ViewType, label: 'Tasks', icon: '📋' },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: '📅' },
    { id: 'analysis' as ViewType, label: 'Analysis', icon: '📊' },
    { id: 'settings' as ViewType, label: 'Settings', icon: '⚙️' },
  ];

  const primaryBg = `bg-${theme.primary}`;
  const shadowColor = `shadow-${theme.primary}/30`;
  const accentText = `text-${theme.primary}`;
  const accentBorder = `border-${theme.primary}/50`;

  return (
    <aside 
      className={`border-r border-slate-800 flex flex-col h-full bg-slate-900/50 backdrop-blur-xl z-20 transition-all duration-500 ease-in-out relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Premium Collapse Toggle Button */}
      <button 
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`absolute -right-4 top-12 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-300 z-40 group shadow-2xl glass ${
          isCollapsed 
            ? `border-slate-700 hover:${accentBorder} translate-x-1` 
            : `border-slate-700 hover:${accentBorder}`
        }`}
      >
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-20 ${primaryBg} blur-md`}></div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-transform duration-500 ${isCollapsed ? 'rotate-0' : 'rotate-180'} ${accentText}`}
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Brand Header */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
        <div className={`w-10 h-10 ${primaryBg} rounded-xl flex items-center justify-center text-xl shadow-lg ${shadowColor} transition-all duration-500 shrink-0 relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          🔥
        </div>
        {!isCollapsed && (
          <span className="font-black text-xl tracking-tighter text-white animate-in fade-in slide-in-from-left-2 duration-500 overflow-hidden whitespace-nowrap">
            FocusFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const isTimerRunningInBackground = item.id === 'timer' && isTimerActive;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} p-3 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? `${primaryBg} text-white shadow-lg ${shadowColor}` 
                  : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-200'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <span className={`text-xl transition-transform duration-300 block ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isTimerRunningInBackground && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping border-2 border-slate-900"></span>
                )}
              </div>
              
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-tight animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden whitespace-nowrap">
                  {item.label}
                </span>
              )}
              
              {isActive && !isCollapsed && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-full translate-x-[-12px] shadow-[0_0_8px_white]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className={`p-4 border-t border-slate-800/50 mt-auto bg-slate-950/20 transition-all ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2 mb-2`}>
          <div className="relative shrink-0">
            <img src="https://picsum.photos/seed/focus/100" className="w-8 h-8 rounded-full border border-slate-700 object-cover" alt="User" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden text-white animate-in fade-in duration-500">
              <p className="text-xs font-black truncate uppercase tracking-widest">Learner #01</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Pro Tier</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="px-2 pt-2 border-t border-slate-800/30 animate-in fade-in duration-700">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              made by <span className="text-slate-400">Abu Dhabi (Abhyuday)</span>
            </p>
          </div>
        )}
        {isCollapsed && (
           <div className="mt-2 text-center opacity-40 hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-slate-500 uppercase">AA</span>
           </div>
        )}
      </div>
    </aside>
  );
};
