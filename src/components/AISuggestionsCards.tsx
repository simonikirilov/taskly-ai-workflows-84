import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Lightbulb, 
  Sparkles, 
  Clock, 
  Target, 
  Zap, 
  X,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  content: string;
  type: string;
  created_at: string;
}

interface AISuggestionsCardsProps {
  isVisible: boolean;
  onClose: () => void;
}

const cardTypes = {
  'AI_tip': { icon: Lightbulb, color: 'from-blue-500 to-cyan-500', label: 'AI Tip' },
  'productivity': { icon: Target, color: 'from-purple-500 to-pink-500', label: 'Productivity' },
  'workflow': { icon: Zap, color: 'from-orange-500 to-red-500', label: 'Workflow' },
  'time_hack': { icon: Clock, color: 'from-green-500 to-blue-500', label: 'Time Hack' },
  'daily_insight': { icon: Sparkles, color: 'from-yellow-500 to-orange-500', label: 'Daily Insight' }
};

export function AISuggestionsCards({ isVisible, onClose }: AISuggestionsCardsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          await addDefaultSuggestions();
        } else {
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const addDefaultSuggestions = async () => {
      const defaultSuggestions = [
        {
          content: "Try voice commands like 'Schedule daily standup at 9 AM' to create recurring workflows",
          type: "AI_tip"
        },
        {
          content: "Batch similar tasks together to increase focus and reduce context switching",
          type: "productivity"
        },
        {
          content: "Use the 2-minute rule: if it takes less than 2 minutes, do it now",
          type: "time_hack"
        },
        {
          content: "Create morning and evening routine workflows to bookend your day",
          type: "workflow"
        },
        {
          content: "Your peak focus hours are typically 2-4 hours after waking up",
          type: "daily_insight"
        }
      ];

      try {
        const { error } = await supabase
          .from('suggestions')
          .insert(
            defaultSuggestions.map(suggestion => ({
              ...suggestion,
              user_id: user.id
            }))
          );

        if (error) throw error;
        
        const { data } = await supabase
          .from('suggestions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8);
        
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error adding default suggestions:', error);
      }
    };

    if (isVisible) {
      fetchSuggestions();
    }
  }, [user, isVisible]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, suggestions.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, suggestions.length - 2)) % Math.max(1, suggestions.length - 2));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--gradient-primary)] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Insights</h2>
              <p className="text-sm text-muted-foreground">Personalized tips to boost your productivity</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            {suggestions.length > 3 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full glass hover:bg-primary/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full glass hover:bg-primary/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Cards Container */}
            <div className="overflow-hidden px-12">
              <div 
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
              >
                {suggestions.map((suggestion, index) => {
                  const cardType = cardTypes[suggestion.type as keyof typeof cardTypes] || cardTypes.AI_tip;
                  const Icon = cardType.icon;
                  
                  return (
                    <Card
                      key={suggestion.id}
                      className={cn(
                        "flex-shrink-0 w-80 glass hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group cursor-pointer",
                        "hover:scale-105 animate-[slide-up_0.5s_ease-out]"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={cn("h-2 bg-gradient-to-r", cardType.color)} />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl bg-gradient-to-r flex items-center justify-center flex-shrink-0",
                            cardType.color
                          )}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-medium"
                              >
                                {cardType.label}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground group-hover:text-primary transition-colors">
                              {suggestion.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Dots Indicator */}
            {suggestions.length > 3 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.max(1, suggestions.length - 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      index === currentIndex 
                        ? "bg-primary w-6" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}