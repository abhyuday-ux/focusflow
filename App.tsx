
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TimerView } from './components/TimerView';
import { CalendarView } from './components/CalendarView';
import { AnalysisView } from './components/AnalysisView';
import { SettingsView } from './components/SettingsView';
import { TasksView } from './components/TasksView';
import { ViewType, StudySession, Subject, Task, AppTheme } from './types';
import { storageService } from './services/storageService';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('timer');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(14400);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Appearance state
  const [themeId, setThemeId] = useState<string>('ypt');
  const [wallpaper, setWallpaper] = useState<string>('none');

  // --- LIFTED GLOBAL TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSubjectId, setTimerSubjectId] = useState<string>('');
  const timerStartTimeRef = useRef<number | null>(null);

  // Initial load
  useEffect(() => {
    setSessions(storageService.getSessions());
    const initialSubjects = storageService.getSubjects();
    setSubjects(initialSubjects);
    if (initialSubjects.length > 0) setTimerSubjectId(initialSubjects[0].id);
    
    setTasks(storageService.getTasks());
    setDailyGoal(storageService.getDailyGoal());
    setThemeId(storageService.getThemeId());
    setWallpaper(storageService.getWallpaper());
    
    // Auto-collapse on small screens
    if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
  }, []);

  // Global Ticker Logic
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerActive) {
      interval = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive]);

  const currentTheme = useMemo(() => 
    THEMES.find(t => t.id === themeId) || THEMES[0], 
  [themeId]);

  // Apply theme to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', currentTheme.accent);
  }, [currentTheme]);

  // Utility to get YYYY-MM-DD in LOCAL time
  const getLocalDateString = (timestamp: number) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleToggleTimer = useCallback(() => {
    if (!isTimerActive) {
      timerStartTimeRef.current = Date.now();
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
      if (timerSeconds > 0) {
        const startTime = timerStartTimeRef.current || Date.now();
        const newSession: StudySession = {
          id: crypto.randomUUID(),
          subjectId: timerSubjectId,
          duration: timerSeconds,
          startTime: startTime,
          // Use local date string instead of toISOString to match PC clock
          date: getLocalDateString(startTime)
        };
        storageService.saveSession(newSession);
        setSessions(prev => [...prev, newSession]);
        setTimerSeconds(0);
      }
    }
  }, [isTimerActive, timerSeconds, timerSubjectId]);

  const handlePauseTimer = useCallback(() => {
    setIsTimerActive(false);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsTimerActive(false);
    setTimerSeconds(0);
  }, []);

  const handleSubjectsChange = useCallback((newSubjects: Subject[]) => {
    storageService.saveSubjects(newSubjects);
    setSubjects(newSubjects);
  }, []);

  const handleTasksChange = useCallback((newTasks: Task[]) => {
    storageService.saveTasks(newTasks);
    setTasks(newTasks);
  }, []);

  const handleGoalChange = useCallback((newGoal: number) => {
    storageService.saveDailyGoal(newGoal);
    setDailyGoal(newGoal);
  }, []);

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    storageService.saveThemeId(id);
  };

  const handleWallpaperChange = (val: string) => {
    setWallpaper(val);
    storageService.saveWallpaper(val);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderView = () => {
    switch (activeView) {
      case 'timer':
        return (
          <TimerView 
            subjects={subjects} 
            sessions={sessions}
            dailyGoal={dailyGoal}
            theme={currentTheme}
            seconds={timerSeconds}
            isActive={isTimerActive}
            selectedSubjectId={timerSubjectId}
            onToggle={handleToggleTimer}
            onPause={handlePauseTimer}
            onReset={handleResetTimer}
            onSelectSubject={setTimerSubjectId}
          />
        );
      case 'tasks':
        return <TasksView tasks={tasks} subjects={subjects} onTasksChange={handleTasksChange} theme={currentTheme} />;
      case 'calendar':
        return <CalendarView sessions={sessions} subjects={subjects} theme={currentTheme} />;
      case 'analysis':
        return <AnalysisView sessions={sessions} subjects={subjects} theme={currentTheme} />;
      case 'settings':
        return (
          <SettingsView 
            subjects={subjects} 
            onSubjectsChange={handleSubjectsChange} 
            dailyGoal={dailyGoal}
            onGoalChange={handleGoalChange}
            themeId={themeId}
            onThemeChange={handleThemeChange}
            wallpaper={wallpaper}
            onWallpaperChange={handleWallpaperChange}
            theme={currentTheme}
          />
        );
      default:
        return null;
    }
  };

  const backgroundStyle = useMemo(() => {
    if (wallpaper === 'none') return {};
    if (wallpaper.startsWith('linear-gradient') || wallpaper.startsWith('radial-gradient')) {
      return { background: wallpaper };
    }
    return { 
      backgroundImage: `url(${wallpaper})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  }, [wallpaper]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-inter selection:bg-orange-500/30">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        theme={currentTheme} 
        isTimerActive={isTimerActive}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main 
        className="flex-1 overflow-y-auto relative h-full transition-all duration-500 ease-in-out"
        style={backgroundStyle}
      >
        {wallpaper !== 'none' && <div className="absolute inset-0 bg-slate-950/40 pointer-events-none backdrop-blur-[2px]"></div>}
        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>

        {/* FLOATING MINI TIMER OVERLAY */}
        {isTimerActive && activeView !== 'timer' && (
          <div 
            onClick={() => setActiveView('timer')}
            className="fixed bottom-8 right-8 z-50 glass p-5 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-5 cursor-pointer hover:scale-105 active:scale-95 transition-all group animate-in slide-in-from-right-10"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative bg-${currentTheme.primary}/10`}>
              <div className={`absolute inset-0 rounded-full border-2 border-${currentTheme.primary}/30 animate-pulse`}></div>
              <div className={`absolute inset-0 rounded-full border-t-2 border-${currentTheme.primary} animate-spin`} style={{ animationDuration: '2s' }}></div>
              <span className="text-xl">⏱️</span>
            </div>
            <div className="pr-2">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Focusing On</p>
              <p className="text-lg font-mono font-black tabular-nums text-white group-hover:text-orange-400 transition-colors">
                {formatTime(timerSeconds)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
