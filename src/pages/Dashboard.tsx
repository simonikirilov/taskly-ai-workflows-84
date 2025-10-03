import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, TrendingUp, Target, Clock, Flame, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFocusScore, getTodayCounts, getPendingCount, getStreak, get7DayData, getRecentActivity, getSmartSuggestions, getAIInsights, addTask, Task } from '@/lib/analytics';
import { QuickAddModal } from '@/components/dashboard/QuickAddModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Task[]>([]);
  const [suggestions] = useState<string[]>(getSmartSuggestions());
  const [insights] = useState<string[]>(getAIInsights());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');

  const focusScore = getFocusScore();
  const todayCounts = getTodayCounts();
  const pendingCount = getPendingCount();
  const streak = getStreak();
  const chartData = get7DayData();

  useEffect(() => { setActivities(getRecentActivity()); }, []);

  const handleDoNow = (suggestion: string) => {
    addTask({ title: suggestion, status: 'completed', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
    setActivities(getRecentActivity());
    toast({ title: '✅ Done', description: suggestion });
  };

  const handleSchedule = (index: number) => {
    if (schedulingIndex === index) {
      if (!scheduleTime) return toast({ title: 'Time required', variant: 'destructive' });
      addTask({ title: suggestions[index], status: 'scheduled', createdAt: new Date().toISOString(), scheduledFor: new Date(scheduleTime).toISOString() });
      setActivities(getRecentActivity());
      setSchedulingIndex(null);
      setScheduleTime('');
      toast({ title: '✅ Scheduled' });
    } else {
      setSchedulingIndex(index);
    }
  };

  const maxChart = Math.max(...chartData.map(d => Math.max(d.created, d.completed)), 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center px-6 max-w-7xl mx-auto"><Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Focus Score</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{focusScore}</div></CardContent></Card>
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{todayCounts.completed}/{todayCounts.created}</div></CardContent></Card>
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Pending</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{pendingCount}</div></CardContent></Card>
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4" />Streak</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{streak}</div><p className="text-xs text-muted-foreground">days</p></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader><CardTitle>7-Day Actions</CardTitle></CardHeader><CardContent><div className="h-40 flex items-end gap-3">{chartData.map((d, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-2"><div className="w-full flex flex-col gap-1"><div className="w-full bg-primary/60 rounded-t" style={{ height: `${(d.created/maxChart)*120}px`, minHeight: d.created > 0 ? '4px' : '0' }} /><div className="w-full bg-green-500/60 rounded-t" style={{ height: `${(d.completed/maxChart)*120}px`, minHeight: d.completed > 0 ? '4px' : '0' }} /></div><p className="text-xs text-muted-foreground">{d.day}</p></div>))}</div></CardContent></Card>
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />AI Insights</CardTitle></CardHeader><CardContent><div className="space-y-3">{insights.map((ins, i) => (<div key={i} className="p-3 rounded-lg bg-muted/30"><p className="text-sm">{ins}</p></div>))}</div></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent><div className="space-y-3">{activities.map(a => (<div key={a.id} className="flex justify-between gap-3 p-3 rounded-lg bg-muted/30"><div className="flex-1"><p className="text-sm font-medium truncate">{a.title}</p><p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div><Badge variant={a.status === 'completed' ? 'default' : 'secondary'}><CheckCircle className="h-3 w-3 mr-1" />{a.status}</Badge></div>))}</div></CardContent></Card>
          <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur"><CardHeader><CardTitle>Smart Suggestions</CardTitle></CardHeader><CardContent><div className="space-y-4">{suggestions.map((s, i) => (<div key={i} className="p-3 rounded-lg bg-muted/30 space-y-3"><p className="text-sm">{s}</p>{schedulingIndex === i ? (<div className="flex gap-2"><Input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="flex-1" /><Button size="sm" onClick={() => handleSchedule(i)}>Confirm</Button><Button size="sm" variant="outline" onClick={() => setSchedulingIndex(null)}>Cancel</Button></div>) : (<div className="flex gap-2"><Button size="sm" onClick={() => handleDoNow(s)} className="flex-1">Do now</Button><Button size="sm" variant="outline" onClick={() => handleSchedule(i)} className="flex-1">Schedule</Button></div>)}</div>))}</div></CardContent></Card>
        </div>
      </div>
      <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" onClick={() => setQuickAddOpen(true)}><Plus className="h-6 w-6" /></Button>
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} onTaskAdded={() => setActivities(getRecentActivity())} />
    </div>
  );
}
