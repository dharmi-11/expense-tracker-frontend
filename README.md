# Expense Tracker Pro Frontend

Polished Next.js frontend for Expense Tracker Pro, a modern personal finance dashboard with responsive UX, analytics, budget tracking, transaction management, and secure authentication.

## Project Overview

This frontend powers the user-facing experience for Expense Tracker Pro. It focuses on clean fintech-style UI, clear financial summaries, smooth navigation, responsive layouts, and production-ready integration with the NestJS backend API.

## Features

- Secure login and registration flows
- Protected dashboard experience
- Improved fintech-style dashboard layout
- Transaction create, edit, delete, search, filter, pagination, and CSV export
- Category analytics and monthly trend charts
- Budget tracking with progress indicators
- Profile and settings management
- Dark and light mode toggle
- Loading skeletons, empty states, and toast notifications
- Responsive design for mobile, tablet, and desktop

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- TanStack React Query
- React Hook Form
- Zod
- Sonner

## Environment Variables

Create `.env` from `.env.example`.

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

## Local Setup

```bash
npm install
npm run lint
npm run build
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000).

## Backend Dependency

This frontend expects the backend API to be available at:

- Local API: `http://localhost:4000/api`
- Local Swagger: `http://localhost:4000/docs`

## Deployment Links

- Live frontend: [expense-tracker-frontend-weld-nu.vercel.app](https://expense-tracker-frontend-weld-nu.vercel.app)
- Live backend API: [expense-tracker-backend-ra9z.onrender.com](https://expense-tracker-backend-ra9z.onrender.com)
- Swagger docs: [expense-tracker-backend-ra9z.onrender.com/docs](https://expense-tracker-backend-ra9z.onrender.com/docs)

## Demo Credentials

- Email: `demo@expensetracker.pro`
- Password: `Passw0rd!2026`

## Deployment Notes

To deploy on Vercel:

1. Import the repository into Vercel.
2. Set the root directory to the frontend project.
3. Add `NEXT_PUBLIC_API_URL` pointing to the deployed backend API.
4. Trigger a production deployment.

## Screenshots Section

Recommended screenshots for README or portfolio use:

- Login page
- Register page
- Dashboard overview
- Transactions page
- Analytics page
- Budgets page
- Settings page

## Quality Checks

- `npm run lint`
- `npm run build`

