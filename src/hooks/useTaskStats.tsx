import { useMemo } from 'react';
import { useLocalTaskly } from './useLocalTaskly';

export function useTaskStats() {
  const {
    tasks,
    todayCreated,
    todayCompleted,
    pendingCount,
    focusScore,
    streakDays,
    actionsByDay
  } = useLocalTaskly();

  const weeklyBars = useMemo(() => {
    return actionsByDay(7);
  }, [actionsByDay]);

  const recentActivity = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        timestamp: task.completedAt || task.createdAt,
        scheduledFor: task.scheduledFor
      }));
  }, [tasks]);

  const suggestions = useMemo(() => {
    // Generate smart suggestions based on tasks
    const hasMorningTasks = tasks.some(t => {
      const hour = new Date(t.createdAt).getHours();
      return hour < 12;
    });

    const hasWeeklyReview = tasks.some(t => 
      t.title.toLowerCase().includes('review') || 
      t.title.toLowerCase().includes('standup')
    );

    const suggestions = [];

    if (!hasMorningTasks && todayCompleted === 0) {
      suggestions.push({
        id: 'morning-1',
        text: 'Start your day with a planning session',
        action: 'Review priorities'
      });
    }

    if (!hasWeeklyReview) {
      suggestions.push({
        id: 'weekly-1',
        text: 'Schedule your weekly review',
        action: 'Weekly planning'
      });
    }

    suggestions.push({
      id: 'focus-1',
      text: 'Block time for deep work',
      action: 'Focus session'
    });

    return suggestions.slice(0, 3);
  }, [tasks, todayCompleted]);

  return {
    todayCreated,
    todayCompleted,
    pendingCount,
    focusScore,
    streakDays,
    weeklyBars,
    recentActivity,
    suggestions
  };
}
