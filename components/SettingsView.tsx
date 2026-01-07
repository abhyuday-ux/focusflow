
import React, { useState } from 'react';
import { Subject, AppTheme } from '../types';
import { THEMES, PRESET_WALLPAPERS } from '../constants';
/* Added storageService import */
import { storageService } from '../services/storageService';

interface SettingsViewProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  dailyGoal: number;
  onGoalChange: (goal: number) => void;
  themeId: string;
  onThemeChange: (id: string) => void;
  wallpaper: string;
  onWallpaperChange: (val: string) => void;
  theme: AppTheme;
}

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  subjects, onSubjectsChange, dailyGoal, onGoalChange, 
  themeId, onThemeChange, wallpaper, onWallpaperChange, theme 
}) => {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [goalInput, setGoalInput] = useState((dailyGoal / 3600).toString());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: selectedColor
    };
    
    onSubjectsChange([...subjects, newSubject]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    if (subjects.length <= 1) return;
    onSubjectsChange(subjects.filter(s => s.id !== id));
  };

  const updateGoal = (val: string) => {
    setGoalInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      onGoalChange(Math.round(parsed * 3600));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onWallpaperChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const accentClass = `text-${theme.primary}`;
  const accentBgClass = `bg-${theme.primary}`;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter mb-2">Workspace Configuration</h1>
        <p className="text-slate-400 font-medium">Customize your focus environment for maximum productivity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Core Settings */}
        <div className="space-y-8">
          {/* Daily Goal */}
          <section className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <h2 className="text-xl font-black mb-1">Daily Target</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Commitment Level</p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={goalInput}
                onChange={(e) => updateGoal(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-3xl font-black w-36 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <div>
                <span className="text-xl font-black block">Hours</span>
                <span className="text-[10px] text-slate-500 font-black uppercase">Per Day</span>
              </div>
            </div>
          </section>

          {/* Theme & Appearance */}
          <section className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <h2 className="text-xl font-black mb-1">Color Theme</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Interface Accents</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${
                    themeId === t.id 
                      ? `border-${t.primary} bg-${t.primary}/10` 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-800/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-${t.primary} mb-2 shadow-lg group-hover:scale-110 transition-transform`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${themeId === t.id ? `text-${t.primary}` : 'text-slate-400'}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Wallpaper */}
          <section className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <h2 className="text-xl font-black mb-1">Atmosphere</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Background Wallpaper</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PRESET_WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => onWallpaperChange(wp.value)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                    wallpaper === wp.value 
                      ? `border-${theme.primary} bg-${theme.primary}/10 text-${theme.primary}` 
                      : 'border-slate-800 bg-slate-800/40 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {wp.name}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden" 
                id="wallpaper-upload" 
              />
              <label 
                htmlFor="wallpaper-upload"
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-600 bg-slate-800/10 cursor-pointer transition-all text-xs font-black uppercase tracking-widest text-slate-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Custom Image
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Subjects Management */}
        <div className="space-y-8">
          <section className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm h-full flex flex-col">
            <h2 className="text-xl font-black mb-1">Study Modules</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Subject Inventory</p>
            
            <form onSubmit={handleAdd} className="space-y-6 mb-10">
              <div className="relative">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Subject Name..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tag Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full transition-all hover:scale-125 shadow-lg ${selectedColor === color ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-110' : 'opacity-60'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full ${accentBgClass} hover:brightness-110 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-500/10 uppercase tracking-[0.2em] text-xs`}
              >
                Create Subject
              </button>
            </form>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-5 rounded-2xl group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{ backgroundColor: s.color }}></div>
                    <span className="font-black text-slate-100 uppercase tracking-tight text-xs">{s.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(s.id)}
                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <button 
          onClick={() => { if(confirm("Clear all data and reset?")) storageService.clearAll(); window.location.reload(); }}
          className="text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
        >
          Factory Reset App
        </button>
      </div>
    </div>
  );
};
