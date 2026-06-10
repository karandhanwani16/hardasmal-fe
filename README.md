# Hardasmal CMS — Frontend (`fe/`)

Admin SPA for Hardasmal staff (React or Vue + Tailwind).

## Stack

- React.js or Vue.js (per PRD)
- Tailwind CSS
- Consumes Laravel API at `/api/v1/`

## Setup (after scaffolding the app here)

```bash
cd fe
cp .env.example .env   # set VITE_API_URL (or equivalent) to your API base
npm install
npm run dev
```

## UI standards

Before building screens, read:

- [`docs/taste-rules.md`](../docs/taste-rules.md) — condensed rules (required by Cursor)
- [`DESIGN.md`](../DESIGN.md) — full design system
- [`PRODUCT.md`](../PRODUCT.md) — users, principles, anti-references
