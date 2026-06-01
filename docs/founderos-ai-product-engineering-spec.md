# FounderOS AI — Product & Engineering Spec

## 1. Product Summary

FounderOS AI is an execution-focused operating system for solo founders who manage one or more ventures. The product helps founders stay accountable, organize work, track outreach, generate useful AI-assisted content ideas, and maintain consistent daily execution.

### What it is

- A founder accountability system
- A startup execution workspace
- An operational dashboard for multiple ventures
- An AI assistant for summaries, suggestions, and content prompts

### What it is not

- A generic productivity app
- A chatbot-first product
- An autonomous AI agent system
- A clinic, agency, or ERP management platform

---

## 2. Product Goals

### Primary goals

- Help founders execute consistently
- Reduce mental overhead through AI assistance
- Centralize tasks, outreach, check-ins, and summaries
- Support multiple startup workspaces in one account

### Success criteria

- High daily usage
- Strong weekly retention
- Consistent check-in completion
- Reliable task completion and outreach logging

---

## 3. Target User

### Primary persona: Solo Founder

A founder managing one or more ventures who needs help:

- staying accountable
- planning daily priorities
- tracking execution
- logging outreach
- generating content and follow-up ideas

---

## 4. MVP Scope

### Included in MVP

#### Authentication

- Register
- Login and logout
- Password reset
- JWT-based auth

#### Workspaces

- Create startup workspaces
- Switch between workspaces
- View workspace-specific dashboards
- Store separate venture data per workspace

#### Tasks and goals

- Create and update tasks
- Set priority and deadlines
- Mark tasks complete
- Detect overdue tasks

#### Accountability check-ins

- Daily check-ins
- Productivity scoring
- Streak tracking
- Weekly summaries

#### Founder dashboard

- Daily execution overview
- Task and progress summaries
- Accountability metrics
- AI suggestions
- Weekly activity tracking

#### AI content prompt engine

- Content ideas
- Caption suggestions
- Startup marketing prompts
- Outreach suggestions

#### Outreach tracking

- Log outreach activities
- Track follow-ups
- Monitor engagement status
- Send outreach reminders

#### Notifications

- Daily reminders
- Deadline alerts
- Accountability prompts
- Weekly reports

### Excluded from MVP

- Team collaboration
- Mobile app
- AI agents
- Social media automation
- WhatsApp automation
- Live stream tracking
- Public APIs
- Voice assistants
- Advanced analytics
- Payments

---

## 5. Core Daily Loop

```text
Founder creates goals
    ↓
Founder executes tasks
    ↓
System checks accountability
    ↓
AI gives feedback
    ↓
Founder returns the next day
```

### Morning

1. Founder logs in
2. Reviews dashboard
3. Checks today’s priorities
4. Reviews AI suggestions

### Midday

5. Updates task progress
6. Logs outreach activity
7. Completes startup work

### Evening

8. Completes accountability check-in
9. Reviews AI productivity feedback
10. Plans next day priorities

---

## 6. Information Architecture

### Main screens

- Authentication
- Dashboard
- Workspace dashboard
- Task management
- Accountability check-in
- AI content assistant
- Outreach tracker
- Weekly summary

### Navigation principle

Keep the product lightweight, operational, and execution-first. Every screen should help the founder decide what to do next.

---

## 7. Domain Model

### Core entities

- `users`
- `workspaces`
- `tasks`
- `check_ins`
- `outreach_logs`
- `ai_generations`
- `notifications`
- `activity_logs`

### Data principles

- Use UUID primary keys
- Timestamp important records
- Store AI metadata in JSONB
- Keep workspace data isolated
- Model records so future expansion stays modular

---

## 8. Backend Architecture

### Stack

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- PostgreSQL
- Redis
- Celery or Dramatiq

### Backend modules

- Authentication
- Workspace management
- Task management
- Check-ins
- AI generation
- Outreach tracking
- Notifications
- Activity logging

### API versioning

- Use `/api/v1/`

### Example endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/workspaces
POST /api/v1/workspaces
GET  /api/v1/tasks
POST /api/v1/tasks
PATCH /api/v1/tasks/{id}
POST /api/v1/checkins
POST /api/v1/ai/content
POST /api/v1/ai/feedback
```

---

## 9. Frontend Architecture

### Stack

- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand
- React Hook Form
- TanStack Query

### Frontend structure

```text
frontend/
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
└── styles/
```

### UI principles

- Clean
- Operational
- Lightweight
- Execution-focused
- Low cognitive overhead

---

## 10. Worker and Queue Design

### Worker responsibilities

- Schedule reminders
- Run AI generation jobs
- Build weekly summaries
- Handle inactivity detection
- Deliver notifications

### Queue flow

```text
API Request
    ↓
Redis Queue
    ↓
Worker processes job
    ↓
Result stored in database
```

---

## 11. Security Baseline

### Backend

- JWT authentication
- Bcrypt password hashing
- Protected routes
- Environment variable protection

### Frontend

- Protected pages
- Token validation
- Secure session handling

---

## 12. Observability

Track:

- API failures
- Worker failures
- AI request failures
- Authentication issues
- Notification failures

Recommended tools:

- Sentry for errors
- PostHog for product analytics

---

## 13. MVP Delivery Order

### Phase 1 — Foundation

- FastAPI setup
- PostgreSQL setup
- Redis setup
- Environment config
- Logging

### Phase 2 — Authentication

- Registration
- Login/logout
- JWT auth
- Protected routes

### Phase 3 — Core database models

- users
- workspaces
- tasks
- check_ins
- outreach_logs
- notifications
- ai_generations

### Phase 4 — Workspace system

- Create workspace
- Fetch workspace
- Update workspace

### Phase 5 — Task system

- Create task
- Update task
- Complete task
- Overdue logic

### Phase 6 — Accountability engine

- Daily check-ins
- Streak tracking
- Productivity scoring
- Weekly summaries

### Phase 7 — AI layer

- Content prompts
- Accountability feedback
- Outreach suggestions

### Phase 8 — Outreach tracking

- Outreach logs
- Follow-up reminders
- Status management

### Phase 9 — Notifications

- Reminder jobs
- Weekly summaries
- Inactivity detection

---

## 14. Recommended Backend Module Pattern

```text
tasks/
├── models.py
├── schemas.py
├── services.py
├── routes.py
├── repository.py
└── utils.py
```

### Workflow for each module

1. Create database model
2. Create Pydantic schemas
3. Create service layer
4. Create API routes
5. Test in Swagger or Postman
6. Move to the next module

---

## 15. AI Product Strategy

### AI should

- Assist
- Guide
- Summarize
- Reduce mental overhead

### AI should not

- Replace decision-making
- Operate autonomously in MVP
- Produce generic motivational output
- Generate overly long responses

### AI MVP use cases

- Content ideas
- Captions
- Outreach prompts
- Accountability feedback
- Weekly execution summaries

---

## 16. Metrics

### User metrics

- Daily active usage
- Weekly retention
- Check-in completion rate
- Task completion rate

### Product metrics

- AI usage frequency
- Outreach consistency
- Accountability streaks
- Founder engagement

---

## 17. Future Phases

These are intentionally out of scope for MVP:

- AI agents
- Voice AI assistant
- WhatsApp automation
- Social media scheduling
- Team collaboration
- Live stream analytics
- Mobile apps
- Founder CRM
- Advanced startup intelligence

---

## 18. Recommended Repository Layout

```text
founderos-ai/
├── frontend/
├── backend/
├── infrastructure/
├── docs/
└── scripts/
```

### Backend layout

```text
backend/
├── app/
│   ├── api/
│   ├── auth/
│   ├── users/
│   ├── workspaces/
│   ├── tasks/
│   ├── checkins/
│   ├── outreach/
│   ├── ai/
│   ├── analytics/
│   ├── notifications/
│   ├── activity_logs/
│   ├── database/
│   ├── core/
│   └── config/
├── workers/
├── tests/
├── migrations/
├── requirements/
├── main.py
├── .env
├── Dockerfile
└── pyproject.toml
```

---

## 19. Open Decisions

These should be settled before implementation begins:

- Celery vs Dramatiq for workers
- Auth token storage strategy on the frontend
- Whether weekly summaries are generated synchronously or as jobs
- Whether the first release supports only one active workspace at a time or full switching from day one

---

## 20. Product Positioning

FounderOS AI should be positioned as an execution-focused founder operating system that helps founders stay accountable, reduce overload, execute consistently, and grow their ventures with clarity.
