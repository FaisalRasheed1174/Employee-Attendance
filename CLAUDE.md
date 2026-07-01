# Employee Attendance System

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Context Files

Read all the context files before writing any code. 

@context/project-overview.md
@context/current-feature.md
@context/coding-standard.md
@context/ai-interaction.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

No test runner is configured.

## Architecture

Next.js 16 App Router project with React 19, TypeScript (strict), and Tailwind CSS v4.

**Key details:**
- All source lives under `src/` — path alias `@/*` resolves to `./src/*`
- CSS: Tailwind v4 via `@tailwindcss/postcss`; the only entry point is `src/app/globals.css` which uses `@import "tailwindcss"` (no `tailwind.config` file)
- Fonts: no custom fonts loaded — use system fonts or add via `next/font` if needed
- `src/app/layout.tsx` is the root layout; `src/app/page.tsx` is the `/` route

**Before writing any Next.js code**, read the relevant guide in `node_modules/next/dist/docs/` — this version (16.x) has breaking changes from earlier releases.
