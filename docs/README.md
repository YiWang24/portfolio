# Documentation Site

This directory contains the Docusaurus documentation site.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │   Browser       │
│   www.yiw.me    │     │   www.yiw.me/   │
│                 │     │     docs        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
    ┌────▼───────────────────────▼────┐
    │         Production Build         │
    │         (Vercel / Static)        │
    │  /docs → Static Docusaurus files │
    └──────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   Next.js       │     │   Docusaurus    │
│  Port 3000      │     │   Port 3001     │
│                 │     │                 │
│  /docs/*        │────▶│  :rewrites      │
│  (proxy)        │     │                 │
└─────────────────┘     └─────────────────┘
```

## Development

### Start only Docs

```bash
cd docs
npm start
```

Access at: http://localhost:3001

### Start Everything (Next.js + Docs)

From project root:

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Docs (proxied)**: http://localhost:3000/docs
- **Docs (direct)**: http://localhost:3001

## Build for Production

```bash
cd docs
npm run build
```

Output: `docs/build/` → Deploy to `/docs` path

## Adding Content

### New Documentation Page

1. Create file in `docs/docs/` folder
2. Add to `sidebars.ts`

```typescript
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "intro",
    "your-new-page",  // Add here
  ],
};
```

### New Blog Post

Create markdown in `blog/YYYY-MM-DD-title/index.md`

## Configuration

- `docusaurus.config.ts` - Main config
- `sidebars.ts` - Documentation structure
- `src/css/custom.css` - Custom styles
