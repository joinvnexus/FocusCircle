-- Fix RLS recursion on public.circle_members

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

DROP POLICY IF EXISTS "Circle members can view circles" ON public.circles;
DROP POLICY IF EXISTS "Circle owners and admins can update" ON public.circles;
DROP POLICY IF EXISTS "Members can view circle_members" ON public.circle_members;
DROP POLICY IF EXISTS "Members can insert circle_members" ON public.circle_members;
DROP POLICY IF EXISTS "Owners and admins can update circle_members" ON public.circle_members;
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task owners and circle members can update" ON public.tasks;
DROP POLICY IF EXISTS "Task owners and circle admins can delete" ON public.tasks;
DROP POLICY IF EXISTS "Circle members can view goals" ON public.goals;
DROP POLICY IF EXISTS "Circle members can create goals" ON public.goals;
DROP POLICY IF EXISTS "Goal owners and circle members can delete" ON public.goals;
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Circle members can view activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Circle members can create activity" ON public.activity_logs;

CREATE POLICY "Circle members can view circles" ON public.circles FOR SELECT USING (
  public.is_circle_member(id) OR owner_id = auth.uid()
);

CREATE POLICY "Circle owners and admins can update" ON public.circles FOR UPDATE USING (
  owner_id = auth.uid() OR public.is_circle_admin(id)
);

CREATE POLICY "Members can view circle_members" ON public.circle_members FOR SELECT USING (
  user_id = auth.uid() OR public.is_circle_member(circle_id)
);

CREATE POLICY "Members can insert circle_members" ON public.circle_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR public.is_circle_admin(circle_id)
);

CREATE POLICY "Owners and admins can update circle_members" ON public.circle_members FOR UPDATE USING (
  public.is_circle_admin(circle_id)
);

CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_circle_member(circle_id)
);

CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  created_by = auth.uid() AND (circle_id IS NULL OR public.is_circle_member(circle_id))
);

CREATE POLICY "Task owners and circle members can update" ON public.tasks FOR UPDATE USING (
  created_by = auth.uid() OR public.is_circle_member(circle_id)
);

CREATE POLICY "Task owners and circle admins can delete" ON public.tasks FOR DELETE USING (
  created_by = auth.uid() OR public.is_circle_admin(circle_id)
);

CREATE POLICY "Circle members can view goals" ON public.goals FOR SELECT USING (
  public.is_circle_member(circle_id)
);

CREATE POLICY "Circle members can create goals" ON public.goals FOR INSERT WITH CHECK (
  public.is_circle_member(circle_id)
);

CREATE POLICY "Goal owners and circle members can delete" ON public.goals FOR DELETE USING (
  created_by = auth.uid() OR public.is_circle_admin(circle_id)
);

CREATE POLICY "Users can view comments" ON public.comments FOR SELECT USING (
  target_type = 'task' AND target_id IN (
    SELECT id FROM public.tasks WHERE created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_circle_member(circle_id)
  )
  OR target_type = 'goal' AND target_id IN (
    SELECT id FROM public.goals WHERE public.is_circle_member(circle_id)
  )
);

CREATE POLICY "Circle members can view activity" ON public.activity_logs FOR SELECT USING (
  public.is_circle_member(circle_id)
);

CREATE POLICY "Circle members can create activity" ON public.activity_logs FOR INSERT WITH CHECK (
  public.is_circle_member(circle_id)
);
