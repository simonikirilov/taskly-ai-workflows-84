import { Clock, Calendar, Zap } from 'lucide-react';

export function PlanSection() {
  const timeBlocks = [
    { time: '9:00 AM', title: 'Focus Session', type: 'focus', duration: '2h' },
    { time: '11:30 AM', title: 'Team Sync', type: 'meeting', duration: '30m' },
    { time: '2:00 PM', title: 'Deep Work', type: 'focus', duration: '3h' },
    { time: '5:30 PM', title: 'Review & Plan', type: 'planning', duration: '1h' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'focus': return <Zap className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'focus': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'meeting': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'planning': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      default: return 'from-muted/20 to-muted/20 border-border/30';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Today's Plan</h3>
      
      {/* Current Focus */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-4 border border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary">Currently Active</span>
        </div>
        <p className="text-foreground font-medium">Deep Work Session</p>
        <p className="text-sm text-muted-foreground">Focus on Taskly AI improvements</p>
      </div>

      {/* Time Blocks */}
      <div className="space-y-3">
        {timeBlocks.map((block, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-r ${getTypeColor(block.type)} rounded-xl p-3 border transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(block.type)}
                <div>
                  <p className="font-medium text-foreground">{block.title}</p>
                  <p className="text-sm text-muted-foreground">{block.time}</p>
                </div>
              </div>
              <span className="text-xs bg-background/50 px-2 py-1 rounded-full text-muted-foreground">
                {block.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}