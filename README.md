# Resume Tailor

AI-powered resume optimization platform that helps you create highly tailored, ATS-compliant resumes for specific job descriptions.

## Features

### Core Features
- **Resume Management** - Upload, create, edit, and organize multiple resumes
- **PDF Upload & Export** - Upload existing resumes as PDF, export optimized versions
- **Job Tracking** - Save job postings and track application status
- **Application Management** - Track applications through the hiring pipeline

### AI-Powered Analysis Modules
- **Resume Tailoring** - Automatically customize your resume for specific jobs
- **Soft Skills Assessment** - Interactive chat to identify and articulate soft skills with evidence
- **Company Research** - AI-powered company culture and interview preparation insights
- **Impact Quantification** - Transform vague bullet points into measurable achievements
- **Context Alignment** - Analyze resume-job fit and identify skill gaps
- **Uniqueness Extraction** - Identify rare skills and unique differentiators

### User Experience
- **Dark/Light/System Theme** - Customizable appearance
- **Accessible Design** - WCAG 2.1 AA compliant with keyboard navigation
- **Responsive Layout** - Works on desktop and mobile devices
- **Smooth Animations** - Polished Framer Motion transitions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **AI**: Anthropic Claude / OpenAI GPT
- **Styling**: Tailwind CSS 4 with OKLCH colors
- **UI Components**: shadcn/ui + Radix UI
- **State**: React Query + Zustand
- **Testing**: Vitest + Playwright
- **PDF**: @react-pdf/renderer

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Anthropic or OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/resume-maker.git
cd resume-maker
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
# Required: Your AI provider API key
ANTHROPIC_API_KEY="your-api-key"

# Optional: Database location (defaults to ./data/resume-maker.db)
DATABASE_URL="file:./data/resume-maker.db"
```

5. Initialize the database:
```bash
pnpm db:push
```

6. Start the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests in watch mode |
| `pnpm test:run` | Run unit tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Drizzle Studio for database inspection |

## Project Structure

```
resume-maker/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (dashboard)/      # Main application pages
│   │   │   ├── resumes/      # Resume management
│   │   │   ├── jobs/         # Job tracking
│   │   │   ├── applications/ # Application tracking
│   │   │   ├── modules/      # AI analysis modules
│   │   │   └── settings/     # User settings
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and services
│   │   ├── ai/               # AI service integrations
│   │   ├── db/               # Database schema and queries
│   │   ├── pdf/              # PDF generation/parsing
│   │   └── validations/      # Zod schemas
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand stores
│   └── providers/            # React context providers
├── tests/                    # E2E test files
├── docs/                     # Documentation
└── data/                     # SQLite database (gitignored)
```

## Documentation

- [API Reference](./docs/API.md) - Complete API endpoint documentation
- [User Guide](./docs/USER-GUIDE.md) - How to use the application
- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture overview

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `file:./data/resume-maker.db` | SQLite database path |
| `AI_PROVIDER` | No | `anthropic` | AI provider (anthropic/openai) |
| `ANTHROPIC_API_KEY` | Yes* | - | Anthropic API key |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `AI_MODEL` | No | `claude-sonnet-4-5-20250929` | AI model to use |
| `AI_TEMPERATURE` | No | `0.7` | Model temperature (0-2) |
| `AI_MAX_TOKENS` | No | `4000` | Max tokens per response |

*One of `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is required based on `AI_PROVIDER`

## Testing

### Unit Tests
```bash
# Run in watch mode
pnpm test

# Run once with coverage
pnpm test:coverage
```

### E2E Tests
```bash
# Install Playwright browsers (first time)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

## License

MIT
