// Analytics utilities for Dashboard

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'scheduled';
  createdAt: string;
  scheduledFor?: string;
  completedAt?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AnalyticsCache {
  lastCompletedDate: string | null;
  streak: number;
}

// Seed demo tasks if none exist
export const seedDemoTasks = (): Task[] => {
  const now = new Date();
  const demoTasks: Task[] = [
    {
      id: '1',
      title: 'Review morning standup notes',
      status: 'completed',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Finish Q4 report',
      status: 'pending',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Call with design team',
      status: 'scheduled',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      scheduledFor: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  // Add some historical tasks for the 7-day chart
  for (let i = 1; i <= 7; i++) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    const count = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < count; j++) {
      demoTasks.push({
        id: `hist-${i}-${j}`,
        title: `Task from ${i} days ago`,
        status: 'completed',
        createdAt: new Date(now.getTime() - dayOffset).toISOString(),
        completedAt: new Date(now.getTime() - dayOffset + j * 60 * 60 * 1000).toISOString(),
      });
    }
  }
  
  return demoTasks;
};

export const getTasks = (): Task[] => {
  const stored = localStorage.getItem('taskly:tasks');
  if (!stored) {
    const demo = seedDemoTasks();
    localStorage.setItem('taskly:tasks', JSON.stringify(demo));
    return demo;
  }
  return JSON.parse(stored);
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem('taskly:tasks', JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, 'id'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTaskStatus = (id: string, status: Task['status']): void => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
    }
    saveTasks(tasks);
  }
};

// Focus Score: 0-100 based on completion rate today
export const getFocusScore = (): number => {
  const tasks = getTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(t => new Date(t.createdAt) >= today);
  const completed = todayTasks.filter(t => t.status === 'completed').length;
  const created = todayTasks.length;
  
  if (created === 0) return 0;
  return Math.min(100, Math.round((completed / created) * 100));
};

// Today's counts
export const getTodayCounts = (): { created: number; completed: number } => {
  const tasks = getTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(t => new Date(t.createdAt) >= today);
  
  return {
    created: todayTasks.length,
    completed: todayTasks.filter(t => t.status === 'completed').length,
  };
};

// Pending count
export const getPendingCount = (): number => {
  const tasks = getTasks();
  return tasks.filter(t => t.status === 'pending').length;
};

// Streak calculation
export const getStreak = (): number => {
  const tasks = getTasks();
  const cache: AnalyticsCache = JSON.parse(
    localStorage.getItem('taskly:analytics') || '{"lastCompletedDate":null,"streak":0}'
  );
  
  const completedTasks = tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  
  if (completedTasks.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasCompletion = completedTasks.some(t => {
      const completedDate = new Date(t.completedAt!);
      return completedDate >= dayStart && completedDate <= dayEnd;
    });
    
    if (hasCompletion) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  cache.streak = streak;
  cache.lastCompletedDate = completedTasks[0]?.completedAt || null;
  localStorage.setItem('taskly:analytics', JSON.stringify(cache));
  
  return streak;
};

// 7-day data for chart
export const get7DayData = (): { day: string; created: number; completed: number }[] => {
  const tasks = getTasks();
  const data: { day: string; created: number; completed: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
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
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      created: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'completed').length,
    });
  }
  
  return data;
};

// Recent activity
export const getRecentActivity = (): Task[] => {
  const tasks = getTasks();
  return tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
};

// Smart suggestions
export const getSmartSuggestions = (): string[] => {
  return [
    'Review morning tasks and prioritize top 3',
    'Block 30 minutes for deep work this afternoon',
    'Clear inbox before end of day',
  ];
};

// AI Insights
export const getAIInsights = (): string[] => {
  const tasks = getTasks();
  const insights: string[] = [];
  
  // Most productive day
  const dayStats: { [key: string]: number } = {};
  tasks.filter(t => t.status === 'completed').forEach(t => {
    const day = new Date(t.completedAt!).toLocaleDateString('en-US', { weekday: 'long' });
    dayStats[day] = (dayStats[day] || 0) + 1;
  });
  
  const mostProductiveDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0];
  if (mostProductiveDay) {
    insights.push(`You're most productive on ${mostProductiveDay[0]}`);
  }
  
  // Morning completion rate
  const morningTasks = tasks.filter(t => {
    if (!t.completedAt) return false;
    const hour = new Date(t.completedAt).getHours();
    return hour < 12;
  });
  const morningPct = tasks.length > 0 
    ? Math.round((morningTasks.length / tasks.filter(t => t.completedAt).length) * 100)
    : 0;
  insights.push(`Morning completion ${morningPct}%`);
  
  // Weekly delta (mock)
  insights.push('Average completion +12% vs last week');
  
  return insights;
};
