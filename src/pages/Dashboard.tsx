import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  getAEUW,
  getTodayCounts,
  getPendingCount,
  getMorningDelta,
  getSparklineData,
  getRecentActivity,
  getSuggestions,
  addActivity,
  removeSuggestion,
  ActivityItem,
  Suggestion
} from '@/utils/dashboardUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setActivities(getRecentActivity().slice(0, 5));
    setSuggestions(getSuggestions());
  };

  const handleDoNow = (suggestion: Suggestion) => {
    addActivity(suggestion.text, 'completed');
    removeSuggestion(suggestion.id);
    loadData();
    toast({
      title: "✅ Done",
      description: suggestion.text,
    });
  };

  const handleSchedule = (suggestion: Suggestion) => {
    if (schedulingId === suggestion.id) {
      if (!scheduleTime) {
        toast({
          title: "Time required",
          description: "Please select a time",
          variant: "destructive",
        });
        return;
      }
      
      addActivity(`${suggestion.text} (scheduled for ${scheduleTime})`, 'pending');
      removeSuggestion(suggestion.id);
      loadData();
      setSchedulingId(null);
      setScheduleTime('');
      toast({
        title: "✅ Scheduled",
        description: `${suggestion.text} at ${scheduleTime}`,
      });
    } else {
      setSchedulingId(suggestion.id);
      setScheduleTime('');
    }
  };

  const aeuw = getAEUW();
  const todayCounts = getTodayCounts();
  const pendingCount = getPendingCount();
  const morningDelta = getMorningDelta();
  const sparklineData = getSparklineData();

  const maxSparkline = Math.max(...sparklineData, 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')} 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AEUW</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aeuw}</div>
              <p className="text-xs text-muted-foreground mt-1">Actions per week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayCounts.completed}/{todayCounts.created}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed / Created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Morning Δ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{morningDelta}%</div>
              <p className="text-xs text-muted-foreground mt-1">Before 12pm</p>
            </CardContent>
          </Card>
        </div>

        {/* Sparkline Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7-Day Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-end gap-2">
              {sparklineData.map((value, index) => (
                <div 
                  key={index} 
                  className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ 
                    height: `${(value / maxSparkline) * 100}%`,
                    minHeight: value > 0 ? '4px' : '0px'
                  }}
                  title={`Day ${index + 1}: ${value} actions`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          activity.status === 'completed' ? 'default' :
                          activity.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="shrink-0"
                      >
                        {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {activity.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {activity.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No suggestions at the moment</p>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className="p-3 rounded-lg bg-muted/30 space-y-3"
                    >
                      <p className="text-sm">{suggestion.text}</p>
                      
                      {schedulingId === suggestion.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="flex-1"
                            placeholder="Select time"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleSchedule(suggestion)}
                          >
                            Confirm
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSchedulingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleDoNow(suggestion)}
                            className="flex-1"
                          >
                            Do now
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSchedule(suggestion)}
                            className="flex-1"
                          >
                            Schedule
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
