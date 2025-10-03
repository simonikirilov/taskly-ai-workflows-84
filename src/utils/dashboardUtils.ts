// Local-first dashboard data utilities

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface Suggestion {
  id: string;
  text: string;
}

// Get Actions Executed per User per Week
export const getAEUW = (): number => {
  const activities = getRecentActivity();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyActions = activities.filter(
    activity => activity.timestamp >= oneWeekAgo && activity.status === 'completed'
  );
  
  return weeklyActions.length;
};

// Get today's counts
export const getTodayCounts = (): { created: number; completed: number } => {
  const activities = getRecentActivity();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = activities.filter(
    activity => activity.timestamp >= today
  );
  
  return {
    created: todayActivities.length,
    completed: todayActivities.filter(a => a.status === 'completed').length
  };
};

// Get pending count
export const getPendingCount = (): number => {
  const activities = getRecentActivity();
  return activities.filter(a => a.status === 'pending').length;
};

// Get morning delta (% better before 12)
export const getMorningDelta = (): number => {
  const activities = getRecentActivity();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = activities.filter(
    activity => activity.timestamp >= today && activity.status === 'completed'
  );
  
  const morningActivities = todayActivities.filter(
    activity => activity.timestamp.getHours() < 12
  );
  
  if (todayActivities.length === 0) return 0;
  
  return Math.round((morningActivities.length / todayActivities.length) * 100);
};

// Get sparkline data for last 7 days
export const getSparklineData = (): number[] => {
  const activities = getRecentActivity();
  const data: number[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayActivities = activities.filter(
      activity => 
        activity.timestamp >= date && 
        activity.timestamp < nextDate &&
        activity.status === 'completed'
    );
    
    data.push(dayActivities.length);
  }
  
  return data;
};

// Get recent activity (last 50 items)
export const getRecentActivity = (): ActivityItem[] => {
  const stored = localStorage.getItem('taskly-activities');
  if (!stored) {
    // Generate mock data if nothing exists
    return generateMockActivities();
  }
  
  const activities = JSON.parse(stored);
  return activities.map((a: any) => ({
    ...a,
    timestamp: new Date(a.timestamp)
  })).sort((a: ActivityItem, b: ActivityItem) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
};

// Get suggestions
export const getSuggestions = (): Suggestion[] => {
  const stored = localStorage.getItem('taskly-suggestions');
  if (!stored) {
    return [
      { id: '1', text: 'Review morning tasks and prioritize top 3' },
      { id: '2', text: 'Block 30 minutes for deep work this afternoon' },
      { id: '3', text: 'Clear inbox before end of day' }
    ];
  }
  
  return JSON.parse(stored);
};

// Add new activity
export const addActivity = (title: string, status: 'completed' | 'pending' | 'failed' = 'completed') => {
  const activities = getRecentActivity();
  const newActivity: ActivityItem = {
    id: Date.now().toString(),
    title,
    timestamp: new Date(),
    status
  };
  
  activities.unshift(newActivity);
  
  // Keep only last 50
  const trimmed = activities.slice(0, 50);
  localStorage.setItem('taskly-activities', JSON.stringify(trimmed));
  
  return newActivity;
};

// Remove suggestion
export const removeSuggestion = (id: string) => {
  const suggestions = getSuggestions();
  const filtered = suggestions.filter(s => s.id !== id);
  localStorage.setItem('taskly-suggestions', JSON.stringify(filtered));
};

// Generate mock activities for first time users
const generateMockActivities = (): ActivityItem[] => {
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Set up morning routine',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '2',
      title: 'Review weekly goals',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '3',
      title: 'Schedule team meeting',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '4',
      title: 'Prepare presentation slides',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '5',
      title: 'Send project update',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed'
    }
  ];
  
  localStorage.setItem('taskly-activities', JSON.stringify(mockActivities));
  return mockActivities;
};
