# Expense Tracker Pro Frontend

Professional Next.js dashboard for Expense Tracker Pro with authentication, analytics, budgets, filters, CSV export, dark mode, and responsive UX.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- React Query
- React Hook Form + Zod
- Sonner

## Features

- Register and login flows
- Protected dashboard experience
- Income, expense, balance, and budget overview
- Transaction create, edit, delete, search, filter, pagination, and CSV export
- Expense breakdown pie chart
- Monthly income vs expense trend chart
- Budget progress tracking
- Profile/settings management
- Dark and light mode toggle
- Empty states, skeleton loading, and toasts

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

The app runs on [http://localhost:3000](http://localhost:3000).

## Test Credentials

- Email: `demo@expensetracker.pro`
- Password: `Passw0rd!2026`

## Backend Dependency

This frontend expects the NestJS API to be available at:

- Local: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/docs`

## Deployment to Vercel

1. Import the `expense-tracker-frontend` repository into Vercel.
2. Set the root directory to the frontend project.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://<your-render-service>/api`
4. Deploy.

## Screenshots

- Login page
- Dashboard overview
- Transactions management
- Analytics page
- Budgets page
- Settings page

## Notes

- The frontend is fully static-output friendly for the authenticated shell.
- Lint and production build both pass locally.
