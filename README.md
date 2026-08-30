# AI Booking Agent

An AI-powered appointment booking SaaS platform for businesses like dentists, salons, barbers, clinics, consultants, gyms, and real-estate agents.

## Features

- AI Booking Agent - Natural language appointment scheduling
- Business Dashboard - Analytics, appointments, calendar
- Calendar Management - Day/week/month views
- Customer Management - Profiles, history, notes
- Service Management - Configurable services with duration and pricing
- Automated Notifications - Email confirmations, reminders, follow-ups
- Multi-tenant - Support for multiple businesses
- Dark/Light mode

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Custom JWT-based authentication
- **AI:** Modular provider (OpenAI, Anthropic, Ollama, etc.)
- **Email:** Resend (with abstraction layer)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) OpenAI/Anthropic API key for AI features
- (Optional) Resend API key for email

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd ai-booking-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `AI_PROVIDER` | AI provider (openai/anthropic/ollama/mock) | No |
| `AI_API_KEY` | API key for AI provider | No |
| `AI_MODEL` | Model to use | No |
| `RESEND_API_KEY` | Resend API key for email | No |
| `EMAIL_FROM` | Sender email address | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   ├── calendar/          # Calendar components
│   └── ai-chat/           # AI chat components
├── lib/                   # Utilities and services
│   ├── ai/                # AI service abstraction
│   ├── email/             # Email service abstraction
│   ├── db/                # Database client
│   └── utils.ts           # Helper functions
├── hooks/                 # React hooks
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## License

MIT
