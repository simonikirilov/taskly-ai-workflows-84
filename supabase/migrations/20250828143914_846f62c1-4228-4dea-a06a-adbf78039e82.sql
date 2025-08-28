
-- Create the tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  title TEXT NOT NULL,
  status BOOLEAN NOT NULL DEFAULT false,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the suggestions table
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the schedule_rules table
CREATE TABLE public.schedule_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  schedule_pattern TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (user_id = 'local-user');
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = 'local-user');
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (user_id = 'local-user');
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (user_id = 'local-user');

-- Create RLS policies for suggestions
CREATE POLICY "Users can view their own suggestions" ON public.suggestions FOR SELECT USING (user_id = 'local-user');
CREATE POLICY "Users can create their own suggestions" ON public.suggestions FOR INSERT WITH CHECK (user_id = 'local-user');
CREATE POLICY "Users can update their own suggestions" ON public.suggestions FOR UPDATE USING (user_id = 'local-user');
CREATE POLICY "Users can delete their own suggestions" ON public.suggestions FOR DELETE USING (user_id = 'local-user');

-- Create RLS policies for workflows
CREATE POLICY "Users can view their own workflows" ON public.workflows FOR SELECT USING (user_id = 'local-user');
CREATE POLICY "Users can create their own workflows" ON public.workflows FOR INSERT WITH CHECK (user_id = 'local-user');
CREATE POLICY "Users can update their own workflows" ON public.workflows FOR UPDATE USING (user_id = 'local-user');
CREATE POLICY "Users can delete their own workflows" ON public.workflows FOR DELETE USING (user_id = 'local-user');

-- Create RLS policies for schedule_rules
CREATE POLICY "Users can view their own schedule rules" ON public.schedule_rules FOR SELECT USING (user_id = 'local-user');
CREATE POLICY "Users can create their own schedule rules" ON public.schedule_rules FOR INSERT WITH CHECK (user_id = 'local-user');
CREATE POLICY "Users can update their own schedule rules" ON public.schedule_rules FOR UPDATE USING (user_id = 'local-user');
CREATE POLICY "Users can delete their own schedule rules" ON public.schedule_rules FOR DELETE USING (user_id = 'local-user');
