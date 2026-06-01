# FounderOS AI Frontend — Product & Engineering Spec

## 1. Product Summary

The FounderOS AI frontend is the operational interface for founders managing one or more ventures. It presents workspaces, tasks, accountability, outreach, notifications, and AI-generated insights in a fast, minimal, execution-focused experience.

### What it is

- A founder command center
- A workspace-aware operational UI
- A lightweight interface for accountability and execution
- A frontend layer for AI-assisted founder workflows

### What it is not

- A flashy SaaS dashboard
- A social platform
- An enterprise ERP interface
- A chatbot-first product

---

## 2. Frontend Goals

### Primary goals

- Fast and responsive UI
- Clean operational workflows
- Modular component architecture
- Strong API integration patterns
- Mobile responsiveness
- Excellent UX consistency
- Scalable developer experience

### Product outcomes

- Founders instantly understand priorities
- Common actions are quick to complete
- The interface reinforces accountability and momentum
- Users return daily with low friction

---

## 3. Target User

### Primary persona: Solo Founder

A founder managing one or more startups who needs to:

- switch between workspaces
- track tasks and deadlines
- complete daily check-ins
- review AI-generated suggestions
- log outreach
- monitor notifications and reminders

---

## 4. MVP Scope

### Included

#### Authentication

- Login
- Registration
- Session handling
- Protected routes

#### Workspace management

- Workspace switching
- Workspace dashboards
- Startup-level summaries

#### Task management

- Task CRUD
- Filters
- Priority badges
- Completion tracking
- Due dates and overdue state

#### Accountability system

- Daily check-in forms
- Weekly summaries
- Productivity metrics
- Streak display

#### AI interface

- AI content prompts
- AI feedback cards
- AI recommendation panels

#### Outreach tracking

- Outreach logs
- Follow-up management
- Reminder display

#### Notifications center

- Alerts
- Reminders
- Weekly summaries
- Unread indicators

### Excluded from MVP

- Team collaboration
- Mobile app
- AI agents
- Social automation
- WhatsApp automation
- Public APIs
- Voice assistants
- Advanced analytics
- Payments

---

## 5. Frontend Architecture Principles

### Core principles

- Feature-based structure
- Centralized API calls
- Typed server responses
- Consistent UI primitives
- Minimal cognitive load
- Fast navigation
- Clear loading and error states

### UX principles

- Operational, not decorative
- Founder-centric
- Lightweight and calm
- Clear hierarchy
- Fast task completion

---

## 6. Recommended Stack

### Core framework

- Next.js 15+
- React 19+
- TypeScript

### Styling and UI

- TailwindCSS
- shadcn/ui
- Lucide React

### State and data

- Zustand for global state
- TanStack Query for server state
- React Hook Form for forms
- Zod for validation

### Optional enhancements

- Recharts for charts
- Framer Motion for subtle motion

---

## 7. Recommended Repository Structure

```text
frontend/
├── app/
├── components/
│   ├── ui/
│   ├── layouts/
│   ├── shared/
│   └── feedback/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── workspaces/
│   ├── tasks/
│   ├── checkins/
│   ├── outreach/
│   ├── ai/
│   ├── notifications/
│   └── analytics/
├── hooks/
├── services/
├── store/
├── lib/
├── types/
├── utils/
├── constants/
├── styles/
└── middleware.ts
```

---

## 8. App Router Structure

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── dashboard/
│   ├── workspaces/
│   ├── tasks/
│   ├── checkins/
│   ├── outreach/
│   ├── ai/
│   ├── notifications/
│   └── settings/
├── api/
├── globals.css
├── layout.tsx
└── page.tsx
```

---

## 9. Core Layout System

### Main layout

```text
┌──────────────────────────────────────┐
│ Top Navigation                       │
├───────────────┬──────────────────────┤
│ Sidebar       │ Main Content Area    │
│ Navigation    │                      │
│               │                      │
└───────────────┴──────────────────────┘
```

### Layout components

#### Top navigation

- Workspace switcher
- Search
- Notifications
- AI quick actions
- User menu

#### Sidebar

- Dashboard
- Tasks
- Check-ins
- Outreach
- AI
- Notifications
- Settings

#### Main content

- Dashboard widgets
- Forms
- Lists
- AI output
- Operational summaries

---

## 10. Main Screens

### Authentication

- Login screen
- Register screen
- Validation
- Loading states
- Error handling

### Dashboard

- Today’s tasks
- Accountability score
- Workspace overview
- AI suggestions
- Recent activity

### Workspace dashboard

- Startup metrics
- Tasks
- Outreach
- AI prompts
- Recent activity

### Task management

- Task list
- Task modal
- Filters
- Priority badges
- Completion state

### Accountability check-in

- Daily reflection form
- Blockers
- Next priorities
- AI feedback after submit

### AI interface

- Content prompt panels
- AI summary cards
- Recommendation panels

### Outreach tracker

- Outreach logs
- Follow-up scheduling
- Status tracking

### Notifications center

- Alerts
- Reminders
- Weekly summaries
- Unread badges

---

## 11. API Layer

### Principles

- Centralize API calls in `services/`
- Avoid direct fetch calls in components
- Use typed responses
- Handle errors consistently

### Suggested service files

```text
services/
├── api-client.ts
├── auth.service.ts
├── workspace.service.ts
├── task.service.ts
├── checkin.service.ts
├── outreach.service.ts
├── ai.service.ts
└── notification.service.ts
```

### API integration requirements

- JWT-based auth support
- Protected request handling
- Global error handling
- Query caching and invalidation

---

## 12. State Management Strategy

### Global state with Zustand

Use Zustand for:

- auth state
- selected workspace
- notifications state
- UI preferences

### Server state with TanStack Query

Use TanStack Query for:

- fetching
- mutations
- caching
- synchronization
- optimistic updates where useful

---

## 13. Authentication Strategy

### Responsibilities

- Store session token
- Fetch current user
- Protect dashboard routes
- Persist login state
- Handle logout and token expiry

### Flow

```text
Login
   ↓
Store JWT
   ↓
Fetch user
   ↓
Protect dashboard routes
```

---

## 14. Responsive Design Strategy

### Desktop

- Primary optimized layout
- Persistent sidebar
- Dense operational view

### Tablet

- Collapsible sidebar
- Stacked panels where needed

### Mobile

- Simplified stacked workflow
- Reduced navigation complexity
- High-clarity action-first layout

---

## 15. Accessibility Requirements

- Semantic HTML
- Keyboard navigation
- Proper contrast
- Accessible forms
- Clear focus states
- Screen reader-friendly labels

---

## 16. Error and Loading States

Every major page should support:

- Loading state
- Empty state
- Error state
- Retry flow

UI should never feel broken or ambiguous when data is missing.

---

## 17. Performance Strategy

### Principles

- Lazy load heavy features
- Cache API requests
- Minimize unnecessary re-renders
- Keep bundles lean

### Heavy features to defer

- Charts
- AI panels
- Analytics views

---

## 18. Testing Strategy

### Recommended tools

- React Testing Library
- Playwright later

### Initial test priorities

- Auth flows
- Task flows
- Check-in forms
- API integrations

---

## 19. Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_ENV=
```

---

## 20. Frontend Development Order

### Phase 1 — Foundation

- Next.js setup
- Tailwind setup
- shadcn/ui setup
- layout system
- routing

### Phase 2 — Authentication

- Login
- Register
- Protected routes

### Phase 3 — Dashboard

- Dashboard widgets
- Workspace switching
- Overview metrics

### Phase 4 — Tasks

- Task CRUD UI
- Filters
- Task states

### Phase 5 — Check-ins

- Check-in forms
- Summaries
- Streaks

### Phase 6 — AI layer

- AI content panels
- AI summaries
- AI insights

### Phase 7 — Outreach

- Outreach tracking
- Follow-ups
- Reminders

### Phase 8 — Notifications

- Inbox
- Alerts
- Reminder center

---

## 21. Success Criteria

The frontend should make founders feel:

- focused
- organized
- accountable
- operationally clear

Users should be able to:

- understand priorities instantly
- complete actions quickly
- return daily with minimal friction

---

## 22. Final Positioning

The FounderOS AI frontend is not just a dashboard. It is the operational interface for founder execution, designed to reinforce accountability, momentum, consistency, and startup progress.
