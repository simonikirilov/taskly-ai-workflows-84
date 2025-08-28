
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Workflow, 
  Calendar, 
  Repeat, 
  ChevronRight, 
  Sparkles,
  X
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
  workflow: { icon: Workflow, gradient: 'from-blue-400 to-blue-600', label: 'Workflow Pattern' },
  automation: { icon: Repeat, gradient: 'from-purple-400 to-purple-600', label: 'Automation Opportunity' },
  productivity: { icon: Brain, gradient: 'from-green-400 to-green-600', label: 'Productivity Insight' },
  schedule: { icon: Calendar, gradient: 'from-amber-400 to-amber-600', label: 'Schedule Pattern' }
};

export function AISuggestionsCards({ isVisible, onClose }: AISuggestionsCardsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
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
      if (!user) return;
      
      const defaultSuggestions = [
        {
          content: 'Taskly noticed you upload reports every Thursday — want to automate this recurring workflow?',
          type: 'automation'
        },
        {
          content: 'You frequently switch between voice commands and manual input. Try setting up voice shortcuts for common tasks.',
          type: 'productivity'
        },
        {
          content: 'Pattern detected: You work most efficiently between 10-11 AM. Consider scheduling important tasks during this window.',
          type: 'schedule'
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
  }, [isVisible, user]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Suggestions</h2>
              <p className="text-sm text-muted-foreground">Personalized Tips to Boost Your Productivity</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!user ? (
          <div className="text-center p-8 bg-card/30 border border-muted/20 rounded-xl">
            <p className="text-muted-foreground">Please sign in to view AI suggestions</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative max-h-96 overflow-y-auto">
            {/* Cards Container - Vertical Stack */}
            <div className="space-y-3 px-4">
              {suggestions.map((suggestion, index) => {
                const cardType = cardTypes[suggestion.type as keyof typeof cardTypes] || cardTypes.productivity;
                const IconComponent = cardType.icon;
                
                return (
                  <div key={suggestion.id} className="bg-card/30 border border-muted/20 rounded-xl p-4 hover:bg-card/50 transition-all duration-200 hover:border-primary/30">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-br ${cardType.gradient} rounded-lg flex-shrink-0`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {cardType.label}
                        </Badge>
                        <p className="text-sm text-foreground leading-relaxed">
                          {suggestion.content}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
