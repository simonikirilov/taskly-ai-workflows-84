
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Lightbulb, Sparkles } from 'lucide-react';

interface Suggestion {
  id: string;
  content: string;
  type: string;
  created_at: string;
}

export function SuggestionsList() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSuggestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error loading suggestions",
        description: "Failed to load AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add some default suggestions if none exist
  useEffect(() => {
    const addDefaultSuggestions = async () => {
      if (!user || suggestions.length > 0) return;

      const defaultSuggestions = [
        {
          content: "Try saying 'Schedule a daily standup meeting at 9 AM' to create a recurring workflow",
          type: "AI_tip"
        },
        {
          content: "Use voice commands like 'Remind me to review emails every day at 2 PM'",
          type: "AI_tip"
        },
        {
          content: "Say 'Create a weekly report workflow for Friday at 4 PM' to automate reports",
          type: "AI_tip"
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
        
        // Refresh suggestions
        const { data } = await supabase
          .from('suggestions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error adding default suggestions:', error);
      }
    };

    addDefaultSuggestions();
  }, [suggestions.length, user]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sign in to see personalized suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suggestions yet</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 rounded-lg bg-accent/50 border border-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1">{suggestion.content}</p>
                <Badge variant="secondary" className="text-xs">
                  {suggestion.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
