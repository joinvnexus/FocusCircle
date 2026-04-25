# Review Fix Plan

## In Progress
- [x] Convert review findings into an implementation checklist
- [x] Fix `TaskForm` typing so `npm run typecheck` passes
- [x] Fix comment notification type mismatch
- [x] Fail closed when `CRON_SECRET` is missing
- [x] Fix lint script for Next 16

## Next
- [x] Remove duplicate client-side profile insert in `AuthContext`
- [x] Refetch `appUser` after auth state changes
- [ ] Restrict member role changes to `admin | member` or add real ownership transfer
- [ ] Hide invite codes from non-managers if that is the intended policy
- [ ] Replace in-memory rate limiting with shared storage
- [ ] Remove duplicated task creation logic between server action and API route

## Verification
- [x] Run `npm run typecheck`
- [x] Run `npm run test`
- [x] Run `npm run lint`
