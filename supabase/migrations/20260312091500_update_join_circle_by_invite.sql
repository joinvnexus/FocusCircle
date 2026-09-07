-- Avoid RLS update failures by not updating membership on conflict
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
