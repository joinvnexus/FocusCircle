# FocusCircle Architecture

## System Architecture
- Frontend: Next.js App Router with React Server Components for data-heavy views and client components for forms, charts, drag-and-drop, theme, and realtime hooks.
- Backend: Next.js Server Actions for trusted mutations and API routes for external or client-triggered workflows.
- Database: Supabase Postgres with Row Level Security on all multi-tenant tables.
- Auth: Supabase Auth with email/password, email verification, password reset, and session cookies handled through middleware.
- Realtime: Supabase Realtime subscriptions for tasks, notifications, and activity feeds.
- Storage: Supabase Storage for avatar uploads.
- Deployment: Vercel frontend with environment variables for Supabase project credentials.

## Domain Model
- `users`: profile and preferences for authenticated users.
- `circles`: collaborative workspaces owned by a user.
- `circle_members`: membership and roles for circles.
- `tasks`: personal and circle tasks, optionally linked to goals.
- `goals`: shared outcomes scoped to circles.
- `comments`: threaded discussion on tasks and goals, with mentions and reactions.
- `notifications`: in-app delivery for assignments, invites, comments, deadlines, and goal updates.
- `activity_logs`: append-only audit/activity timeline for circle actions.

## API Design
- Server Actions
  - `auth.ts`: sign in, sign up, sign out, password reset.
  - `tasks.ts`: create, update, delete, update status.
  - `circles.ts`: create, join, update member role.
  - `goals.ts`: create, update progress.
  - `comments.ts`: create comment, react to comment.
  - `notifications.ts`: mark one or all as read.
  - `profile.ts`: update user profile and credentials.
- API Routes
  - `GET/POST /api/tasks`
  - `POST /api/circles/join`
  - `POST /api/notifications/mark-read`
  - `GET /api/realtime`

## Page Structure
- Public
  - `/`
  - `/features`
  - `/pricing`
  - `/blog`
  - `/login`
  - `/signup`
  - `/reset-password`
- Authenticated
  - `/dashboard`
  - `/tasks`
  - `/circles`
  - `/circles/[id]`
  - `/goals`
  - `/activity`
  - `/notifications`
  - `/profile`

## Component Structure
- `components/marketing/*`: public website header, footer, page shell.
- `components/dashboard/*`: charts, stat cards, kanban board, section blocks.
- `components/forms/*`: task, goal, circle, profile, and comment forms.
- `components/shared/*`: empty states, section headers, badges, action buttons.
- `components/ui/*`: low-level shadcn-compatible primitives.

## Data Flow
1. Middleware refreshes Supabase auth cookies and redirects protected routes.
2. Server pages query Supabase directly with the current user session.
3. Client components submit validated payloads to server actions.
4. Server actions mutate data, insert notifications/activity logs, then `revalidatePath`.
5. Charts and boards receive serialized data from server pages.

## Security
- All tables use RLS with per-user and per-circle access rules.
- Inputs are validated with Zod before mutation.
- Protected routes are enforced in middleware and server-side auth helpers.
- API routes use a lightweight rate limiter for mutation endpoints.

## Testing Strategy
- Unit tests: validators, helpers, activity/goal progress utilities.
- Component tests: forms, kanban interactions, charts, notifications.
- Integration tests: auth flow, task lifecycle, circle join flow, profile updates.

## Deployment Checklist
- Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Apply `supabase/schema.sql`.
- Enable Auth email templates and redirect URLs in Supabase.
- Configure Storage bucket for avatars.
- Deploy to Vercel with production environment variables.
