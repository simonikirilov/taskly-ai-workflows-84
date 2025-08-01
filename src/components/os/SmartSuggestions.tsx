import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SmartSuggestions() {
  const suggestions = [
    {
      type: 'automation',
      title: 'Create morning routine workflow',
      description: 'Auto-schedule daily focus blocks',
      action: 'Create'
    },
    {
      type: 'optimization',
      title: 'Optimize meeting schedule',
      description: 'Consolidate calls to Tuesday/Thursday',
      action: 'Apply'
    },
    {
      type: 'insight',
      title: 'Peak focus time detected',
      description: 'Your best work happens 9-11 AM',
      action: 'Schedule'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'automation': return <Sparkles className="h-4 w-4" />;
      case 'optimization': return <Lightbulb className="h-4 w-4" />;
      case 'insight': return <ArrowRight className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Smart Suggestions</h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="bg-card/50 rounded-xl p-4 border border-border/20 hover:border-border/40 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                {suggestion.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}