# Frontend

Next.js + TypeScript client application for FounderOS AI.

## Foundation setup

- Install dependencies from `package.json`
- Copy environment variables into `.env.local`
- Run the app with `npm run dev`

## Authentication phase

- Login and register screens live under `app/(auth)/`
- Session token is stored in both a cookie and localStorage
- Protected routes are enforced via `middleware.ts`

## Dashboard phase

- Dashboard data is assembled from workspaces, tasks, weekly check-ins, and notifications
- Workspace switching is handled in the dashboard shell
- AI suggestions are shown as embedded operational guidance rather than chat UI
