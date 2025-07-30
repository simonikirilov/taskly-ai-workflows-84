import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodaysFocusProps {
  className?: string;
}

export function TodaysFocus({ className }: TodaysFocusProps) {
  const [focusAreas, setFocusAreas] = useState<string[]>(['Electric Surfers', 'Clients', 'App Agency']);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSelectArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : prev.length < 3 ? [...prev, area] : prev
    );
  };

  const handleRemoveArea = (area: string) => {
    setFocusAreas(prev => prev.filter(a => a !== area));
    setSelectedAreas(prev => prev.filter(a => a !== area));
  };

  const handleAddArea = () => {
    if (newArea.trim() && !focusAreas.includes(newArea.trim()) && focusAreas.length < 6) {
      setFocusAreas(prev => [...prev, newArea.trim()]);
      setNewArea('');
      setIsAddingNew(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddArea();
    } else if (e.key === 'Escape') {
      setIsAddingNew(false);
      setNewArea('');
    }
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">Today's Focus</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select up to 3 areas to focus on today
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {focusAreas.map((area) => (
          <div key={area} className="relative group">
            <Badge
              variant={selectedAreas.includes(area) ? "default" : "outline"}
              className={cn(
                "text-sm py-2 px-4 cursor-pointer transition-all duration-200",
                "hover:scale-105 hover:shadow-lg",
                selectedAreas.includes(area)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card/50 text-foreground border-border/50 hover:bg-card/80"
              )}
              onClick={() => handleSelectArea(area)}
            >
              {area}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveArea(area);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        ))}

        {isAddingNew ? (
          <div className="flex items-center gap-2">
            <Input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newArea.trim()) {
                  setIsAddingNew(false);
                }
              }}
              placeholder="Enter focus area"
              className="w-32 h-8 text-sm bg-card/50 border-border/50"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddArea}
              className="h-8 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          focusAreas.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="h-8 px-3 bg-card/30 border-border/30 hover:bg-card/50 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )
        )}
      </div>

      {selectedAreas.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {selectedAreas.length}/3 focus areas selected
          </p>
        </div>
      )}
    </div>
  );
}