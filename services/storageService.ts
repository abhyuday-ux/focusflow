
import { StudySession, Subject, Task } from '../types';
import { STORAGE_KEYS, DEFAULT_SUBJECTS } from '../constants';

export const storageService = {
  getSessions: (): StudySession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: StudySession) => {
    const sessions = storageService.getSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
  },

  saveSubjects: (subjects: Subject[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getDailyGoal: (): number => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
    return data ? parseInt(data, 10) : 14400; // Default 4 hours
  },

  saveDailyGoal: (seconds: number) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, seconds.toString());
  },

  getThemeId: (): string => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'ypt';
  },

  saveThemeId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.THEME, id);
  },

  getWallpaper: (): string => {
    return localStorage.getItem(STORAGE_KEYS.WALLPAPER) || 'none';
  },

  saveWallpaper: (data: string) => {
    localStorage.setItem(STORAGE_KEYS.WALLPAPER, data);
  },

  clearAll: () => {
    localStorage.clear();
  }
};
