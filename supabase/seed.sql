-- FocusCircle demo seed data
-- Demo login:
--   owner@focuscircle.test / Password123!
--   admin@focuscircle.test / Password123!
--   member@focuscircle.test / Password123!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

DELETE FROM auth.users
WHERE email IN (
  'owner@focuscircle.test',
  'admin@focuscircle.test',
  'member@focuscircle.test'
);

DELETE FROM auth.identities
WHERE provider = 'email'
  AND provider_id IN (
    'owner@focuscircle.test',
    'admin@focuscircle.test',
    'member@focuscircle.test'
  );

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@focuscircle.test',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ari Rahman"}'::jsonb,
    now() - interval '14 days',
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@focuscircle.test',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nadia Islam"}'::jsonb,
    now() - interval '12 days',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'member@focuscircle.test',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Tanvir Hasan"}'::jsonb,
    now() - interval '10 days',
    now()
  );

INSERT INTO public.users (
  id,
  email,
  full_name,
  avatar_url,
  timezone,
  notification_preferences,
  is_admin,
  plan,
  stripe_customer_id,
  circle_limit,
  member_limit,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'owner@focuscircle.test',
    'Ari Rahman',
    'https://api.dicebear.com/9.x/initials/svg?seed=Ari%20Rahman',
    'Asia/Dhaka',
    '{"email_notifications":true,"deadline_alerts":true,"weekly_summary":true}'::jsonb,
    true,
    'pro',
    'cus_demo_owner',
    50,
    25,
    now() - interval '14 days',
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'admin@focuscircle.test',
    'Nadia Islam',
    'https://api.dicebear.com/9.x/initials/svg?seed=Nadia%20Islam',
    'Asia/Dhaka',
    '{"email_notifications":true,"deadline_alerts":true,"weekly_summary":false}'::jsonb,
    false,
    'free',
    null,
    3,
    5,
    now() - interval '12 days',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'member@focuscircle.test',
    'Tanvir Hasan',
    'https://api.dicebear.com/9.x/initials/svg?seed=Tanvir%20Hasan',
    'Asia/Dhaka',
    '{"email_notifications":false,"deadline_alerts":true,"weekly_summary":false}'::jsonb,
    false,
    'free',
    null,
    3,
    5,
    now() - interval '10 days',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  timezone = EXCLUDED.timezone,
  notification_preferences = EXCLUDED.notification_preferences,
  is_admin = EXCLUDED.is_admin,
  plan = EXCLUDED.plan,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  circle_limit = EXCLUDED.circle_limit,
  member_limit = EXCLUDED.member_limit,
  updated_at = now();

INSERT INTO public.circles (
  id,
  name,
  description,
  owner_id,
  invite_code,
  invite_expires_at,
  created_at,
  updated_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Product Launch Circle',
    'Plan the FocusCircle launch, content, billing, and onboarding work.',
    '11111111-1111-1111-1111-111111111111',
    'LAUNCH26',
    now() + interval '30 days',
    now() - interval '9 days',
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Personal Deep Work',
    'A private planning circle for weekly focus goals and routines.',
    '11111111-1111-1111-1111-111111111111',
    'DEEPWORK',
    null,
    now() - interval '6 days',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  owner_id = EXCLUDED.owner_id,
  invite_code = EXCLUDED.invite_code,
  invite_expires_at = EXCLUDED.invite_expires_at,
  updated_at = now();

INSERT INTO public.circle_members (id, circle_id, user_id, role, joined_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', now() - interval '9 days'),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'admin', now() - interval '8 days'),
  ('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member', now() - interval '7 days'),
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'owner', now() - interval '6 days')
ON CONFLICT (circle_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  joined_at = EXCLUDED.joined_at;

INSERT INTO public.goals (
  id,
  title,
  description,
  deadline,
  progress,
  completion_status,
  circle_id,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'Launch public beta',
    'Ship onboarding, pricing, and core collaboration flows for beta users.',
    now() + interval '21 days',
    62,
    false,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '8 days',
    now()
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'Improve activation',
    'Get users to create a circle and complete their first shared task.',
    now() + interval '35 days',
    38,
    false,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '5 days',
    now()
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Maintain weekly focus rhythm',
    'Complete high-priority personal planning tasks every weekday.',
    now() + interval '14 days',
    80,
    false,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '6 days',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  deadline = EXCLUDED.deadline,
  progress = EXCLUDED.progress,
  completion_status = EXCLUDED.completion_status,
  circle_id = EXCLUDED.circle_id,
  created_by = EXCLUDED.created_by,
  updated_at = now();

INSERT INTO public.tasks (
  id,
  title,
  description,
  status,
  priority,
  due_date,
  assigned_to,
  circle_id,
  goal_id,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'Finalize Stripe checkout copy',
    'Review pricing page microcopy and checkout success states.',
    'in_progress',
    'high',
    now() + interval '6 hours',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '5 days',
    now() - interval '1 hour'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'Record onboarding walkthrough',
    'Create a short demo video for new workspace owners.',
    'todo',
    'medium',
    now() + interval '2 days',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'c2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '4 days',
    now() - interval '2 days'
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'QA circle invite flow',
    'Test invite links, expired codes, member limits, and RLS boundaries.',
    'completed',
    'high',
    now() - interval '1 day',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '7 days',
    now() - interval '1 day'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'Draft weekly planning checklist',
    'Turn the personal focus routine into repeatable checklist items.',
    'completed',
    'medium',
    now() - interval '2 days',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'c3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '6 days',
    now() - interval '2 days'
  ),
  (
    'd5555555-5555-5555-5555-555555555555',
    'Personal: clean task backlog',
    'Archive stale tasks and keep only this week''s priorities.',
    'todo',
    'low',
    now() + interval '5 days',
    null,
    null,
    null,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '1 day',
    now() - interval '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  due_date = EXCLUDED.due_date,
  assigned_to = EXCLUDED.assigned_to,
  circle_id = EXCLUDED.circle_id,
  goal_id = EXCLUDED.goal_id,
  created_by = EXCLUDED.created_by,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.comments (
  id,
  body,
  target_type,
  target_id,
  user_id,
  parent_id,
  mentions,
  reactions,
  created_at,
  updated_at
)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'Checkout copy is close. Please check the cancellation wording before launch.',
    'task',
    'd1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    null,
    ARRAY['nadia'],
    '{"thumbs_up":["22222222-2222-2222-2222-222222222222"]}'::jsonb,
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'I updated the success-state copy and left one open question on billing portal text.',
    'task',
    'd1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    ARRAY['ari'],
    '{}'::jsonb,
    now() - interval '90 minutes',
    now() - interval '90 minutes'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'Invite flow passed for active links. Expired-code copy needs one small polish.',
    'goal',
    'c1111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    null,
    ARRAY['ari'],
    '{"eyes":["11111111-1111-1111-1111-111111111111"]}'::jsonb,
    now() - interval '1 day',
    now() - interval '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  body = EXCLUDED.body,
  target_type = EXCLUDED.target_type,
  target_id = EXCLUDED.target_id,
  user_id = EXCLUDED.user_id,
  parent_id = EXCLUDED.parent_id,
  mentions = EXCLUDED.mentions,
  reactions = EXCLUDED.reactions,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.notifications (
  id,
  type,
  title,
  message,
  user_id,
  is_read,
  created_at,
  data
)
VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    'task_assigned',
    'New task assigned',
    'Finalize Stripe checkout copy was assigned to you.',
    '22222222-2222-2222-2222-222222222222',
    false,
    now() - interval '4 hours',
    '{"task_id":"d1111111-1111-1111-1111-111111111111"}'::jsonb
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'comment',
    'New comment',
    'Nadia replied on Finalize Stripe checkout copy.',
    '11111111-1111-1111-1111-111111111111',
    false,
    now() - interval '80 minutes',
    '{"task_id":"d1111111-1111-1111-1111-111111111111"}'::jsonb
  ),
  (
    'f3333333-3333-3333-3333-333333333333',
    'deadline',
    'Deadline approaching',
    'Finalize Stripe checkout copy is due today.',
    '22222222-2222-2222-2222-222222222222',
    false,
    now() - interval '30 minutes',
    '{"task_id":"d1111111-1111-1111-1111-111111111111"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  user_id = EXCLUDED.user_id,
  is_read = EXCLUDED.is_read,
  created_at = EXCLUDED.created_at,
  data = EXCLUDED.data;

INSERT INTO public.activity_logs (
  id,
  action_type,
  entity_type,
  entity_id,
  circle_id,
  actor_id,
  created_at,
  metadata
)
VALUES
  (
    '99911111-1111-1111-1111-111111111111',
    'created',
    'circle',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '9 days',
    '{"name":"Product Launch Circle"}'::jsonb
  ),
  (
    '99922222-2222-2222-2222-222222222222',
    'created',
    'task',
    'd1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '5 days',
    '{"title":"Finalize Stripe checkout copy"}'::jsonb
  ),
  (
    '99933333-3333-3333-3333-333333333333',
    'completed',
    'task',
    'd3333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '1 day',
    '{"title":"QA circle invite flow"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  action_type = EXCLUDED.action_type,
  entity_type = EXCLUDED.entity_type,
  entity_id = EXCLUDED.entity_id,
  circle_id = EXCLUDED.circle_id,
  actor_id = EXCLUDED.actor_id,
  created_at = EXCLUDED.created_at,
  metadata = EXCLUDED.metadata;

INSERT INTO public.subscriptions (
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  price_id,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '11111111-1111-1111-1111-111111111111',
  'cus_demo_owner',
  'sub_demo_owner',
  'active',
  'price_demo_pro_monthly',
  now() + interval '20 days',
  false,
  now() - interval '12 days',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  status = EXCLUDED.status,
  price_id = EXCLUDED.price_id,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = now();

INSERT INTO public.audit_logs (
  id,
  actor_id,
  action,
  target_type,
  target_id,
  metadata,
  created_at
)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  'seeded_demo_workspace',
  'circle',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '{"source":"supabase/seed.sql"}'::jsonb,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  actor_id = EXCLUDED.actor_id,
  action = EXCLUDED.action,
  target_type = EXCLUDED.target_type,
  target_id = EXCLUDED.target_id,
  metadata = EXCLUDED.metadata,
  created_at = EXCLUDED.created_at;

COMMIT;
