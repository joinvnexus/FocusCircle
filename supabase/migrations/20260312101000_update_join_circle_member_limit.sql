-- Enforce member limits in join by invite
CREATE OR REPLACE FUNCTION public.join_circle_by_invite(invite_code_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code TEXT;
  target_circle_id UUID;
  target_owner_id UUID;
  limit_value INTEGER;
  member_count INTEGER;
BEGIN
  IF invite_code_input IS NULL OR length(trim(invite_code_input)) = 0 THEN
    RETURN NULL;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  normalized_code := upper(regexp_replace(invite_code_input, '[^A-Za-z0-9]', '', 'g'));

  SELECT id, owner_id
  INTO target_circle_id, target_owner_id
  FROM public.circles
  WHERE invite_code = normalized_code
    AND (invite_expires_at IS NULL OR invite_expires_at > now())
  LIMIT 1;

  IF target_circle_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT member_limit
  INTO limit_value
  FROM public.users
  WHERE id = target_owner_id;

  IF limit_value IS NOT NULL THEN
    SELECT COUNT(*) INTO member_count FROM public.circle_members WHERE circle_id = target_circle_id;
    IF member_count >= limit_value THEN
      RAISE EXCEPTION 'Circle member limit reached';
    END IF;
  END IF;

  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (target_circle_id, auth.uid(), 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;

  RETURN target_circle_id;
END;
$$;
