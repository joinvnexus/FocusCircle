-- FocusCircle Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circles table
CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circle members table
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'circle_invite', 'comment', 'deadline', 'goal_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('task_completed', 'task_assigned', 'goal_created', 'member_joined', 'comment_added')),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_circle_id ON public.tasks(circle_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_goals_circle_id ON public.goals(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_circle_id ON public.activity_logs(circle_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Circles
CREATE POLICY "Circle members can view circles" ON public.circles FOR SELECT USING (
  id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid()) OR owner_id = auth.uid()
);
CREATE POLICY "Users can create circles" ON public.circles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Circle owners can update" ON public.circles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Circle owners can delete" ON public.circles FOR DELETE USING (auth.uid() = owner_id);

-- Circle Members
CREATE POLICY "Members can view circle_members" ON public.circle_members FOR SELECT USING (
  user_id = auth.uid() OR circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "Members can insert circle_members" ON public.circle_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Tasks
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR 
  circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Task owners can update" ON public.tasks FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Task owners can delete" ON public.tasks FOR DELETE USING (created_by = auth.uid());

-- Goals
CREATE POLICY "Circle members can view goals" ON public.goals FOR SELECT USING (
  circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "Circle members can create goals" ON public.goals FOR INSERT WITH CHECK (
  circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "Goal owners can update" ON public.goals FOR UPDATE USING (created_by = auth.uid());

-- Comments
CREATE POLICY "Users can view comments" ON public.comments FOR SELECT USING (
  user_id = auth.uid() OR task_id IN (SELECT id FROM public.tasks WHERE created_by = auth.uid()) OR goal_id IN (SELECT id FROM public.goals WHERE circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());

-- Activity Logs
CREATE POLICY "Circle members can view activity" ON public.activity_logs FOR SELECT USING (
  circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);
CREATE POLICY "Circle members can create activity" ON public.activity_logs FOR INSERT WITH CHECK (
  circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
);

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.circles ALTER COLUMN invite_code SET DEFAULT generate_invite_code();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
