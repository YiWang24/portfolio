# Portfolio Frontend

> A modern, interactive portfolio website built with Next.js 16, React 19, and TypeScript. Features a cinematic terminal interface with AI-powered chat capabilities.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## Features

- **Terminal-Style Interface** - Interactive chat experience with real-time streaming responses
- **AI-Powered Chat** - Server-Sent Events (SSE) streaming with thinking chain visualization
- **Dynamic Portfolio Sections** - Animated cards for experience, projects, and skills
- **Dark Mode Support** - Seamless theme switching with `next-themes`
- **Responsive Design** - Fully responsive across all devices
- **Cloudflare Zero Trust Integration** - Secure API proxying through Cloudflare Access

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1 (App Router) |
| **UI Library** | React 19.2 |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 4.0 |
| **Animations** | Framer Motion 12.26 |
| **State Management** | Zustand 5.0 |
| **Terminal** | xterm.js 6.0 |
| **Components** | shadcn/ui (Radix UI primitives) |
| **Markdown** | react-markdown |
| **Testing** | Vitest 4.0 + React Testing Library |
| **Deployment** | Vercel |

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes (proxy handlers)
│   │   │   ├── contact/          # Contact form proxy
│   │   │   ├── chat/             # Chat stream proxy
│   │   │   └── github/           # GitHub stats proxy
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React Components
│   │   ├── effects/              # Visual effects (MatrixRain, etc.)
│   │   ├── portfolio/            # Portfolio sections
│   │   ├── terminal/             # Terminal/chat components
│   │   └── ui/                   # shadcn/ui components
│   │
│   ├── data/                     # Static data
│   │   └── profile.json          # Profile, experience, projects
│   │
│   ├── hooks/                    # React Hooks
│   │   ├── useGitHubStats.ts     # GitHub statistics
│   │   └── useTypewriter.ts      # Typewriter effect
│   │
│   ├── lib/                      # Utilities
│   │   ├── command-processor.ts  # Terminal command processor
│   │   └── utils.ts              # Helper functions
│   │
│   ├── services/                 # API Services
│   │   ├── contact.ts            # Contact form service
│   │   └── sse.ts                # SSE stream service
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── chatStore.ts          # Chat state management
│   │   └── ui-store.ts           # UI state management
│   │
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
│
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YiWang24/portfolio.git
cd portfolio/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Cloudflare Zero Trust credentials (optional, for production)
CF_CLIENT_ID=your-cloudflare-client-id
CF_CLIENT_SECRET=your-cloudflare-client-secret

# Backend API URL
BACKEND_URL=https://api.yoursite.com
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CF_CLIENT_ID` | Cloudflare Zero Trust Client ID | - |
| `CF_CLIENT_SECRET` | Cloudflare Zero Trust Client Secret | - |
| `BACKEND_URL` | Backend API base URL | `http://localhost:8080` |

> **Note:** Variables without `NEXT_PUBLIC_` prefix are only accessible on the server side, keeping credentials secure.

## API Proxy Architecture

This frontend uses Next.js API Routes to proxy requests to the backend, allowing Cloudflare Zero Trust headers to be added server-side:

```
Frontend JS → Next.js API Route → (CF-Access Headers) → Backend
              /api/contact         /api/v1/contact
              /api/chat/stream     /api/v1/chat/stream
              /api/github/stats    /api/v1/github/stats
```

### API Routes

| Route | Method | Backend Endpoint | Description |
|-------|--------|------------------|-------------|
| `/api/contact` | POST | `/api/v1/contact` | Contact form submissions |
| `/api/chat/stream` | GET | `/api/v1/chat/stream` | SSE chat streaming |
| `/api/github/stats` | GET | `/api/v1/github/stats` | GitHub statistics |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in your project settings:
   - `CF_CLIENT_ID`
   - `CF_CLIENT_SECRET`
   - `BACKEND_URL`
4. Deploy

### Other Platforms

This project can be deployed to any platform that supports Next.js:

- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## Customization

### Profile Data

Edit `src/data/profile.json` to customize:

- Personal information (name, role, bio)
- Social links
- Education history
- Work experience
- Projects
- Skills and modules
- Certifications

### Styling

The theme uses Tailwind CSS with custom colors defined in `tailwind.config.ts`:

```typescript
colors: {
  void: "var(--void)",
  panel: "var(--panel)",
  "neon-green": "var(--neon-green)",
  "neon-purple": "var(--neon-purple)",
}
```

Modify `src/app/globals.css` to adjust CSS variables.

### Terminal Commands

Add custom commands in `src/lib/command-processor.ts`.

## Component Overview

### Portfolio Sections

| Component | Description |
|-----------|-------------|
| `AboutSection` | Personal intro and focus areas |
| `ExperienceSection` | Work history timeline |
| `ProjectsDashboard` | Interactive project grid |
| `TechStackMatrix` | Skills visualization |

### Terminal Components

| Component | Description |
|-----------|-------------|
| `TerminalConversation` | Chat interface with streaming |
| `TerminalInput` | Command/message input |
| `ThinkingChain` | AI thinking visualization |
| `StatusBar` | Terminal-style status bar |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Yi Wang
- GitHub: [@YiWang24](https://github.com/YiWang24)
- LinkedIn: [yiwang2025](https://www.linkedin.com/in/yiwang2025/)
- Email: yiwang2457@gmail.com

---

Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/).
