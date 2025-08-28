
-- Update RLS policies to use proper authentication instead of hardcoded 'local-user'

-- Drop existing policies for tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Create new policies for tasks using auth.uid()
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid()::text = user_id);

-- Drop existing policies for suggestions
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Users can delete their own suggestions" ON public.suggestions;

-- Create new policies for suggestions using auth.uid()
CREATE POLICY "Users can view their own suggestions" ON public.suggestions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own suggestions" ON public.suggestions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.suggestions FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own suggestions" ON public.suggestions FOR DELETE USING (auth.uid()::text = user_id);

-- Drop existing policies for workflows
DROP POLICY IF EXISTS "Users can view their own workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can create their own workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON public.workflows;

-- Create new policies for workflows using auth.uid()
CREATE POLICY "Users can view their own workflows" ON public.workflows FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own workflows" ON public.workflows FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own workflows" ON public.workflows FOR DELETE USING (auth.uid()::text = user_id);

-- Drop existing policies for schedule_rules
DROP POLICY IF EXISTS "Users can view their own schedule rules" ON public.schedule_rules;
DROP POLICY IF EXISTS "Users can create their own schedule rules" ON public.schedule_rules;
DROP POLICY IF EXISTS "Users can update their own schedule rules" ON public.schedule_rules;
DROP POLICY IF EXISTS "Users can delete their own schedule rules" ON public.schedule_rules;

-- Create new policies for schedule_rules using auth.uid()
CREATE POLICY "Users can view their own schedule rules" ON public.schedule_rules FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own schedule rules" ON public.schedule_rules FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own schedule rules" ON public.schedule_rules FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own schedule rules" ON public.schedule_rules FOR DELETE USING (auth.uid()::text = user_id);

-- Update the user_id column to not have a default value since it should be set by the authenticated user
ALTER TABLE public.tasks ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.suggestions ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.workflows ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.schedule_rules ALTER COLUMN user_id DROP DEFAULT;
