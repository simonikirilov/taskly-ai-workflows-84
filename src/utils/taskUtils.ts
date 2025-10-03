
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const addTaskForUser = async (
  userId: string, 
  title: string, 
  scheduledTime?: string
) => {
  try {
    const taskData: any = {
      title,
      user_id: userId,
      status: false
    };

    if (scheduledTime) {
      taskData.scheduled_time = scheduledTime;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Task created!",
      description: title,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error creating task:', error);
    toast({
      title: "Error creating task",
      description: "Failed to create task. Please try again.",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const addSuggestionForUser = async (
  userId: string,
  content: string,
  type: string = 'general'
) => {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .insert([{
        content,
        type,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return { success: false, error };
  }
};
