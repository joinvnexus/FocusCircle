-- Subtasks: checklist items nested under a task, used for progress roll-up.
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_position ON public.subtasks(task_id, position);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view subtasks of visible tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can create subtasks on visible tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can update subtasks of visible tasks" ON public.subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks of visible tasks" ON public.subtasks;

-- Access mirrors the parent task's own RLS rules: the task creator, the
-- assignee, or any member of the task's circle (when it belongs to one).
CREATE POLICY "Users can view subtasks of visible tasks" ON public.subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR public.is_circle_member(t.circle_id))
    )
  );

CREATE POLICY "Users can create subtasks on visible tasks" ON public.subtasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR public.is_circle_member(t.circle_id))
    )
  );

CREATE POLICY "Users can update subtasks of visible tasks" ON public.subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR public.is_circle_member(t.circle_id))
    )
  );

CREATE POLICY "Users can delete subtasks of visible tasks" ON public.subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR public.is_circle_admin(t.circle_id))
    )
  );
