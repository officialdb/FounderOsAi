# Backend

FastAPI service for authentication, workspaces, tasks, check-ins, outreach, AI, and notifications.

## Foundation setup

- Copy `backend/.env.example` to `backend/.env`
- Install dependencies from `backend/pyproject.toml`
- Run the API with `uvicorn main:app --reload`

## Auth phase

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/password-reset`
- `POST /api/v1/auth/password-reset/confirm`

## Core database models

- `users`
- `workspaces`
- `tasks`
- `check_ins`
- `outreach_logs`
- `notifications`
- `ai_generations`

## Workspace system

- `GET /api/v1/workspaces`
- `POST /api/v1/workspaces`
- `GET /api/v1/workspaces/{workspace_id}`
- `PATCH /api/v1/workspaces/{workspace_id}`

## Task system

- `GET /api/v1/tasks?workspace_id=...`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/{task_id}`
- `PATCH /api/v1/tasks/{task_id}`
- `POST /api/v1/tasks/{task_id}/complete`
- `DELETE /api/v1/tasks/{task_id}`

### Canonical task statuses

- `todo`
- `in_progress`
- `done`
- `overdue`

## Accountability engine

- `POST /api/v1/checkins`
- `GET /api/v1/checkins/weekly-summary?workspace_id=...`

### Streak fields

- `current_streak`: consecutive days ending today
- `longest_streak`: longest consecutive streak across stored check-ins
- `missed_days`: days without a check-in in the last 7-day window

## AI layer

- `POST /api/v1/ai/content`
- `POST /api/v1/ai/feedback`
- `POST /api/v1/ai/weekly-summary`

## Outreach tracking

- `GET /api/v1/outreach?workspace_id=...`
- `POST /api/v1/outreach`
- `PATCH /api/v1/outreach/{outreach_id}`
- `DELETE /api/v1/outreach/{outreach_id}`
- `POST /api/v1/outreach/{outreach_id}/follow-up`
- `GET /api/v1/outreach/follow-up-reminders?workspace_id=...`

### Canonical outreach statuses

- `pending`
- `contacted`
- `follow_up`
- `responded`
- `closed`

## Notifications

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/summary`
- `POST /api/v1/notifications`
- `PATCH /api/v1/notifications/{notification_id}`
- `POST /api/v1/notifications/{notification_id}/read`
- `DELETE /api/v1/notifications/{notification_id}`
- `POST /api/v1/notifications/generate/daily-reminders`
- `POST /api/v1/notifications/generate/missed-task-alerts`
- `POST /api/v1/notifications/generate/weekly-summary`
- `POST /api/v1/notifications/generate/inactivity-prompt`

### Notification update contract

- `scheduled_for` is supported on create requests.
- `scheduled_for` is not supported on update requests for MVP.
