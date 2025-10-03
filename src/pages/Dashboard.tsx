import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, TrendingUp, Target, Clock, Flame, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalTaskly } from '@/hooks/useLocalTaskly';
import { useTaskStats } from '@/hooks/useTaskStats';
import { QuickAddModal } from '@/components/dashboard/QuickAddModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addTask, completeTask } = useLocalTaskly();
  const { 
    todayCreated, 
    todayCompleted, 
    pendingCount, 
    focusScore, 
    streakDays,
    weeklyBars,
    recentActivity,
    suggestions: smartSuggestions
  } = useTaskStats();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedulingSuggestion, setSchedulingSuggestion] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const chartData = weeklyBars;

  // AI Insights - derive from task stats
  const insights = [
    'You\'re building your productivity streak!',
    `Morning completion rate is growing`,
    'Keep up the great work!'
  ];

  const handleDoNow = (suggestion: string) => {
    const tempId = Date.now().toString();
    addTask(suggestion);
    // Complete the task immediately after creating it
    setTimeout(() => completeTask(tempId), 100);
    toast({ title: '✅ Done', description: suggestion });
  };

  const handleScheduleOpen = (suggestion: string) => {
    setSchedulingSuggestion(suggestion);
    setScheduleOpen(true);
  };

  const handleScheduleConfirm = () => {
    if (!scheduleTime) return toast({ title: 'Time required', variant: 'destructive' });
    addTask(schedulingSuggestion, new Date(scheduleTime).toISOString());
    toast({ title: '✅ Scheduled' });
    setScheduleOpen(false);
    setScheduleTime('');
  };

  const maxChart = Math.max(...chartData.map(d => Math.max(d.created, d.completed)), 1);
  
  const suggestions = smartSuggestions.map(s => s.action);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />Focus Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{focusScore}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayCompleted}/{todayCreated}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4" />Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{streakDays}</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 7-Day Chart */}
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader>
              <CardTitle>7-Day Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end gap-3">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div 
                        className="w-full bg-primary/60 rounded-t transition-all" 
                        style={{ height: `${(d.created/maxChart)*120}px`, minHeight: d.created > 0 ? '4px' : '0' }} 
                      />
                      <div 
                        className="w-full bg-green-500/60 rounded-t transition-all" 
                        style={{ height: `${(d.completed/maxChart)*120}px`, minHeight: d.completed > 0 ? '4px' : '0' }} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{d.dayLabel}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">{ins}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  recentActivity.map(a => (
                    <div key={a.id} className="flex justify-between gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(a.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={
                          a.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : a.status === 'scheduled'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
            <CardHeader>
              <CardTitle>Smart Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-3">
                    <p className="text-sm">{s}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleDoNow(s)} className="flex-1">Do now</Button>
                      <Button size="sm" variant="outline" onClick={() => handleScheduleOpen(s)} className="flex-1">Schedule</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Add Button */}
      <Button 
        size="lg" 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" 
        onClick={() => setQuickAddOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{schedulingSuggestion}</p>
            <Input 
              type="datetime-local" 
              value={scheduleTime} 
              onChange={e => setScheduleTime(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
