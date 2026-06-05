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

## Vercel deployment

- Set `NEXT_PUBLIC_API_URL` to the deployed backend API, for example `http://13.60.248.169:8000/api/v1`
- Set `NEXT_PUBLIC_APP_ENV=production`
- Add the Vercel domain to the backend `CORS_ORIGINS` value so browser requests are allowed
