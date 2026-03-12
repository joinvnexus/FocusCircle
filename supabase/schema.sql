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
  timezone TEXT NOT NULL DEFAULT 'UTC',
  notification_preferences JSONB NOT NULL DEFAULT '{"email_notifications": true, "deadline_alerts": true, "weekly_summary": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circles table
CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  invite_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completion_status BOOLEAN NOT NULL DEFAULT FALSE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('task', 'goal')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  mentions TEXT[] DEFAULT '{}',
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_circle_id ON public.tasks(circle_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON public.tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_goals_circle_id ON public.goals(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_circle_id ON public.activity_logs(circle_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON public.comments(target_type, target_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS helper functions
CREATE OR REPLACE FUNCTION public.is_circle_member(target_circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.circle_members
    WHERE circle_id = target_circle_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_circle_admin(target_circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.circle_members
    WHERE circle_id = target_circle_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- Join circle via invite code without exposing circle records
CREATE OR REPLACE FUNCTION public.join_circle_by_invite(invite_code_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code TEXT;
  target_circle_id UUID;
BEGIN
  IF invite_code_input IS NULL OR length(trim(invite_code_input)) = 0 THEN
    RETURN NULL;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  normalized_code := upper(regexp_replace(invite_code_input, '[^A-Za-z0-9]', '', 'g'));

  SELECT id
  INTO target_circle_id
  FROM public.circles
  WHERE invite_code = normalized_code
    AND (invite_expires_at IS NULL OR invite_expires_at > now())
  LIMIT 1;

  IF target_circle_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (target_circle_id, auth.uid(), 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;

  RETURN target_circle_id;
END;
$$;

-- RLS Policies
-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Circles
CREATE POLICY "Circle members can view circles" ON public.circles FOR SELECT USING (
  public.is_circle_member(id) OR owner_id = auth.uid()
);
CREATE POLICY "Users can create circles" ON public.circles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Circle owners and admins can update" ON public.circles FOR UPDATE USING (
  owner_id = auth.uid() OR public.is_circle_admin(id)
);
CREATE POLICY "Circle owners can delete" ON public.circles FOR DELETE USING (auth.uid() = owner_id);

-- Circle Members
CREATE POLICY "Members can view circle_members" ON public.circle_members FOR SELECT USING (
  user_id = auth.uid() OR public.is_circle_member(circle_id)
);
CREATE POLICY "Members can insert circle_members" ON public.circle_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.is_circle_admin(circle_id)
);
CREATE POLICY "Owners and admins can update circle_members" ON public.circle_members FOR UPDATE USING (
  public.is_circle_admin(circle_id)
);

-- Tasks
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR 
  public.is_circle_member(circle_id)
);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  created_by = auth.uid() AND (
    circle_id IS NULL OR public.is_circle_member(circle_id)
  )
);
CREATE POLICY "Task owners and circle members can update" ON public.tasks FOR UPDATE USING (
  created_by = auth.uid() OR public.is_circle_member(circle_id)
);
CREATE POLICY "Task owners and circle admins can delete" ON public.tasks FOR DELETE USING (
  created_by = auth.uid() OR public.is_circle_admin(circle_id)
);

-- Goals
CREATE POLICY "Circle members can view goals" ON public.goals FOR SELECT USING (
  public.is_circle_member(circle_id)
);
CREATE POLICY "Circle members can create goals" ON public.goals FOR INSERT WITH CHECK (
  public.is_circle_member(circle_id)
);
CREATE POLICY "Goal owners can update" ON public.goals FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Goal owners and circle members can delete" ON public.goals FOR DELETE USING (
  created_by = auth.uid() OR public.is_circle_admin(circle_id)
);

-- Comments
CREATE POLICY "Users can view comments" ON public.comments FOR SELECT USING (
  target_type = 'task' AND target_id IN (
    SELECT id FROM public.tasks WHERE created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_circle_member(circle_id)
  )
  OR target_type = 'goal' AND target_id IN (
    SELECT id FROM public.goals WHERE public.is_circle_member(circle_id)
  )
);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Comment authors can update comments" ON public.comments FOR UPDATE USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Activity Logs
CREATE POLICY "Circle members can view activity" ON public.activity_logs FOR SELECT USING (
  public.is_circle_member(circle_id)
);
CREATE POLICY "Circle members can create activity" ON public.activity_logs FOR INSERT WITH CHECK (
  public.is_circle_member(circle_id)
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  affected_goal UUID;
BEGIN
  affected_goal := COALESCE(NEW.goal_id, OLD.goal_id);
  IF affected_goal IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM public.tasks
  WHERE goal_id = affected_goal;

  UPDATE public.goals
  SET
    progress = CASE WHEN total_tasks = 0 THEN 0 ELSE ROUND((completed_tasks::numeric / total_tasks::numeric) * 100) END,
    completion_status = CASE WHEN total_tasks > 0 AND completed_tasks = total_tasks THEN TRUE ELSE FALSE END,
    updated_at = NOW()
  WHERE id = affected_goal;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circles_updated_at
  BEFORE UPDATE ON public.circles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER sync_goal_progress_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.sync_goal_progress();
