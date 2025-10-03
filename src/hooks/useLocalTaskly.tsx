import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'scheduled';
  createdAt: string;
  completedAt?: string;
  scheduledFor?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Profile {
  avatar?: string;
  displayName: string;
  username: string;
  email: string;
  timezone: string;
  language: string;
}

interface Preferences {
  ai: { tone: string; autoProcess: boolean };
  ui: { watchBubble: boolean; theme: string };
  reminders: { enabled: boolean };
  notifications: { tasks: boolean };
  locale: string;
  beta: Record<string, boolean>;
  appLock: string;
}

const seedTasks = (): Task[] => {
  const now = new Date();
  return [
    { id: '1', title: 'Review morning standup notes', status: 'completed', createdAt: new Date(now.getTime() - 2*60*60*1000).toISOString(), completedAt: new Date(now.getTime() - 1.5*60*60*1000).toISOString() },
    { id: '2', title: 'Finish Q4 report', status: 'pending', createdAt: new Date(now.getTime() - 1*60*60*1000).toISOString() },
    { id: '3', title: 'Call with design team', status: 'scheduled', createdAt: new Date(now.getTime() - 30*60*1000).toISOString(), scheduledFor: new Date(now.getTime() + 2*60*60*1000).toISOString() },
    { id: '4', title: 'Update project documentation', status: 'completed', createdAt: new Date(now.getTime() - 24*60*60*1000).toISOString(), completedAt: new Date(now.getTime() - 23*60*60*1000).toISOString() },
    { id: '5', title: 'Code review for PR #142', status: 'completed', createdAt: new Date(now.getTime() - 48*60*60*1000).toISOString(), completedAt: new Date(now.getTime() - 47*60*60*1000).toISOString() },
    { id: '6', title: 'Team sync meeting', status: 'completed', createdAt: new Date(now.getTime() - 72*60*60*1000).toISOString(), completedAt: new Date(now.getTime() - 71*60*60*1000).toISOString() },
  ];
};

export const useLocalTaskly = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = storage.get<Task[]>('tasks', []);
    return stored.length > 0 ? stored : seedTasks();
  });

  const [profile, setProfileState] = useState<Profile>(() =>
    storage.get<Profile>('profile', {
      displayName: 'Demo User',
      username: 'demouser',
      email: 'demo@taskly.app',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'EN'
    })
  );

  const [prefs, setPrefsState] = useState<Preferences>(() =>
    storage.get<Preferences>('prefs', {
      ai: { tone: 'Friendly', autoProcess: true },
      ui: { watchBubble: true, theme: 'Dark' },
      reminders: { enabled: true },
      notifications: { tasks: true },
      locale: 'EN',
      beta: {},
      appLock: 'Off'
    })
  );

  useEffect(() => {
    if (tasks.length > 0) storage.set('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent;
      if (evt.detail?.key === 'tasks') {
        setTasks(storage.get<Task[]>('tasks', []));
      } else if (evt.detail?.key === 'profile') {
        setProfileState(storage.get<Profile>('profile', profile));
      } else if (evt.detail?.key === 'prefs') {
        setPrefsState(storage.get<Preferences>('prefs', prefs));
      }
    };
    window.addEventListener('taskly:changed', handler);
    return () => window.removeEventListener('taskly:changed', handler);
  }, []);

  const setProfile = useCallback((updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    setProfileState(updated);
    storage.set('profile', updated);
  }, [profile]);

  const setPrefs = useCallback((updates: Partial<Preferences>) => {
    const updated = { ...prefs, ...updates };
    setPrefsState(updated);
    storage.set('prefs', updated);
  }, [prefs]);

  const addTask = useCallback((title: string, scheduledFor?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status: scheduledFor ? 'scheduled' : 'pending',
      createdAt: new Date().toISOString(),
      scheduledFor
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t
    ));
  }, []);

  const scheduleTask = useCallback((id: string, scheduledFor: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'scheduled', scheduledFor } : t
    ));
  }, []);

  const exportAll = useCallback(() => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskly-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const resetAll = useCallback(() => {
    storage.clear();
    setTasks(seedTasks());
    setProfileState({
      displayName: 'Demo User',
      username: 'demouser',
      email: 'demo@taskly.app',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'EN'
    });
    setPrefsState({
      ai: { tone: 'Friendly', autoProcess: true },
      ui: { watchBubble: true, theme: 'Dark' },
      reminders: { enabled: true },
      notifications: { tasks: true },
      locale: 'EN',
      beta: {},
      appLock: 'Off'
    });
  }, []);

  // Computed values
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = tasks.filter(t => new Date(t.createdAt) >= today);
  const todayCreated = todayTasks.length;
  const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  
  const last24h = new Date(Date.now() - 24*60*60*1000);
  const completed24h = tasks.filter(t => t.completedAt && new Date(t.completedAt) >= last24h).length;
  const created24h = tasks.filter(t => new Date(t.createdAt) >= last24h).length;
  const focusScore = Math.min(100, Math.round((completed24h / Math.max(1, created24h)) * 100));

  // Streak calculation
  let streakDays = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);
    const hasCompletion = tasks.some(t => 
      t.completedAt && new Date(t.completedAt) >= dayStart && new Date(t.completedAt) <= dayEnd
    );
    if (hasCompletion) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const actionsByDay = (days: number = 7) => {
    const data: { dayLabel: string; created: number; completed: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayTasks = tasks.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= date && createdDate < nextDate;
      });
      data.push({
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'completed').length
      });
    }
    return data;
  };

  return {
    tasks,
    profile,
    prefs,
    setProfile,
    setPrefs,
    addTask,
    completeTask,
    scheduleTask,
    exportAll,
    resetAll,
    // Computed
    todayCreated,
    todayCompleted,
    pendingCount,
    focusScore,
    streakDays,
    actionsByDay
  };
};
