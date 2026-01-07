
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, Subject, AppTheme } from '../types';

interface TasksViewProps {
  tasks: Task[];
  subjects: Subject[];
  onTasksChange: (tasks: Task[]) => void;
  theme: AppTheme;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, subjects, onTasksChange, theme }) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Inline adding state
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubjectId, setDraftSubjectId] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (addingToStatus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingToStatus]);

  const handleSaveDraft = (status: TaskStatus) => {
    if (!draftTitle.trim()) {
      setAddingToStatus(null);
      return;
    }
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: draftTitle.trim(),
      status,
      subjectId: draftSubjectId || undefined
    };
    onTasksChange([...tasks, newTask]);
    setDraftTitle('');
    setDraftSubjectId(''); // Reset subject selection after adding
    setAddingToStatus(null);
  };

  const updateTaskTitle = (id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      // If user clears the title, we could either remove it or just cancel edit.
      // Trello usually cancels or saves previous if empty. Let's cancel if empty.
      setEditingTaskId(null);
      return;
    }
    onTasksChange(tasks.map(t => t.id === id ? { ...t, title: trimmedTitle } : t));
    setEditingTaskId(null);
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingTaskId(id);
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingTaskId(null);
    setDragOverStatus(null);
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    moveTask(id, status);
    setDragOverStatus(null);
    setDraggingTaskId(null);
  };

  const columns: { status: TaskStatus; label: string; icon: string; accent: string }[] = [
    { status: 'todo', label: 'To Do', icon: '🎯', accent: 'border-slate-700' },
    { status: 'doing', label: 'In Progress', icon: '⚡', accent: 'border-blue-500/30' },
    { status: 'done', label: 'Done', icon: '🎉', accent: 'border-green-500/30' }
  ];

  const getSubject = (id?: string) => subjects.find(s => s.id === id);

  const focusRingClass = `ring-${theme.primary}`;
  const accentBgClass = `bg-${theme.primary}`;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Focus Board</h1>
          <p className="text-slate-400 text-sm font-medium">Native Trello-style workflow</p>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${accentBgClass}`}></span>
            <span>{tasks.length} Total Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>{tasks.filter(t => t.status === 'done').length} Finished</span>
          </div>
        </div>
      </div>

      {/* Trello Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x">
        {columns.map(col => (
          <div 
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex-shrink-0 w-[300px] md:w-[320px] snap-center flex flex-col rounded-[2rem] border-2 transition-all duration-300 ${
              dragOverStatus === col.status 
                ? 'bg-slate-800/80 border-slate-600 scale-[1.01]' 
                : `bg-slate-900/40 ${col.accent}`
            }`}
          >
            {/* Column Header */}
            <div className="p-5 flex items-center justify-between sticky top-0 bg-transparent backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <span className="text-xl filter drop-shadow-md">{col.icon}</span>
                <h3 className="font-black text-xs uppercase tracking-[0.25em] text-slate-100">{col.label}</h3>
              </div>
              <span className="bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-black border border-slate-700/50">
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-3 min-h-[100px] pb-4 custom-scrollbar">
              {tasks.filter(t => t.status === col.status).map(task => {
                const sub = getSubject(task.subjectId);
                const isEditing = editingTaskId === task.id;

                return (
                  <div 
                    key={task.id}
                    draggable={!isEditing}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl hover:border-slate-600 transition-all group relative border-l-4 ${!isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                    style={{ borderLeftColor: sub?.color || '#334155' }}
                  >
                    {isEditing ? (
                      <textarea
                        autoFocus
                        rows={3}
                        className={`bg-slate-800 text-sm font-semibold w-full px-2 py-1 rounded focus:outline-none ring-2 ${focusRingClass} text-white resize-none`}
                        defaultValue={task.title}
                        onBlur={(e) => updateTaskTitle(task.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            updateTaskTitle(task.id, e.currentTarget.value);
                          }
                          if (e.key === 'Escape') setEditingTaskId(null);
                        }}
                      />
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div 
                          className="text-sm font-semibold text-slate-100 leading-relaxed pr-6 cursor-text min-h-[1.25rem]"
                          onClick={() => setEditingTaskId(task.id)}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {sub ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/50 rounded-md border border-slate-700/50">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sub.color }}></div>
                              <span className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[80px]">{sub.name}</span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">General</span>
                          )}

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTask(task.id);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all"
                            title="Delete task"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Inline Adding Interface */}
              {addingToStatus === col.status ? (
                <div className={`bg-slate-800 border-2 ${col.accent.replace('border-', 'border-opacity-50 border-')} p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10`}>
                  <textarea
                    ref={inputRef}
                    placeholder="What needs to be done?"
                    className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none resize-none mb-3"
                    rows={3}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveDraft(col.status);
                      }
                      if (e.key === 'Escape') setAddingToStatus(null);
                    }}
                  />
                  
                  <div className="flex flex-col gap-3">
                    <select 
                      className="bg-slate-900 text-[10px] font-black uppercase rounded-lg px-2 py-2 focus:outline-none text-slate-400 border border-slate-700 w-full cursor-pointer hover:border-slate-600 transition-colors"
                      value={draftSubjectId}
                      onChange={(e) => setDraftSubjectId(e.target.value)}
                    >
                      <option value="">No Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleSaveDraft(col.status)}
                        className={`${accentBgClass} hover:brightness-110 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/20`}
                      >
                        Add Card
                      </button>
                      <button 
                        onClick={() => setAddingToStatus(null)}
                        className="p-2 text-slate-500 hover:text-slate-200 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingToStatus(col.status)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/20 text-slate-500 hover:text-slate-300 transition-all group flex items-center justify-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-opacity-20 transition-all`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.1em]">Add a card</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
