import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ── Change this before running in a new environment ──────────────────────────
const SEED_EMAIL = "faisal@example.com";
// ─────────────────────────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

// ── Item Types ────────────────────────────────────────────────────────────────
const ITEM_TYPES = [
  { name: "snippet", icon: "Code",       color: "#3b82f6" },
  { name: "prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { name: "command", icon: "Terminal",   color: "#f97316" },
  { name: "note",    icon: "StickyNote", color: "#fde047" },
  { name: "file",    icon: "File",       color: "#6b7280" },
  { name: "image",   icon: "Image",      color: "#ec4899" },
  { name: "link",    icon: "Link",       color: "#10b981" },
];

// ── Collections ───────────────────────────────────────────────────────────────
const COLLECTIONS: Array<{
  name: string;
  description: string;
  items: Array<{
    typeName: string;
    title: string;
    content: string;
    language?: string;
  }>;
}> = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        typeName: "snippet",
        title: "Custom React Hooks",
        language: "typescript",
        content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [storedValue, setValue] as const;
}`,
      },
      {
        typeName: "snippet",
        title: "Component Patterns",
        language: "typescript",
        content: `import React, { createContext, useContext, useState } from 'react';

// ── Context Provider Pattern ──────────────────────────────────────────────────
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

// ── Compound Component Pattern ────────────────────────────────────────────────
function Tabs({ children }: { children: React.ReactNode }) {
  return <div className="tabs">{children}</div>;
}
Tabs.Tab = function Tab({ label, children }: { label: string; children: React.ReactNode }) {
  return <div data-label={label}>{children}</div>;
};
export { Tabs };`,
      },
      {
        typeName: "snippet",
        title: "Utility Functions",
        language: "typescript",
        content: `export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const group = String(item[key]);
    return { ...acc, [group]: [...(acc[group] ?? []), item] };
  }, {} as Record<string, T[]>);
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return \`\${mins}m ago\`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return \`\${hrs}h ago\`;
  return \`\${Math.floor(hrs / 24)}d ago\`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}`,
      },
    ],
  },

  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        typeName: "prompt",
        title: "Code Review Prompt",
        content: `You are an expert code reviewer. Review the following code and provide structured feedback:

1. **Security issues** — vulnerabilities, injection risks, unsafe patterns
2. **Performance concerns** — inefficiencies, unnecessary re-renders, N+1 queries
3. **Code quality** — readability, naming, complexity, DRY violations
4. **Best practices** — language/framework conventions not followed
5. **Suggested improvements** — with specific before/after code examples

Rules:
- Be concise. Flag critical issues first.
- Skip praise — only actionable feedback.
- Rate overall severity: Low / Medium / High / Critical

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      },
      {
        typeName: "prompt",
        title: "Documentation Generation",
        content: `Generate comprehensive documentation for the following code:

- Write a clear one-sentence summary of what it does
- List all parameters with their types and descriptions
- Describe the return value (type + meaning)
- Note any thrown errors or edge cases
- Add a realistic usage example
- Use JSDoc format for functions/methods

Output only the documentation — no explanations around it.

Code:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      },
      {
        typeName: "prompt",
        title: "Refactoring Assistance",
        content: `Refactor the following code to improve:
- Readability and clarity
- Performance where obviously beneficial
- Separation of concerns
- Type safety (TypeScript)
- Remove duplication (DRY)

Strict rules:
- Preserve all existing behaviour exactly — no regressions
- Do not add new features or handle new edge cases
- Keep changes minimal and focused
- After the refactored code, explain each significant change and the reason for it

Code to refactor:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      },
    ],
  },

  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        typeName: "snippet",
        title: "Docker & CI/CD Config",
        language: "yaml",
        content: `# Dockerfile — multi-stage Next.js build
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS prod
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]

---
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build`,
      },
      {
        typeName: "command",
        title: "Deployment Scripts",
        content: `# Deploy to Vercel production
npx vercel --prod --yes

# Run DB migrations then deploy
npx prisma migrate deploy && npx vercel --prod --yes

# Rollback last Vercel deployment
npx vercel rollback

# Check deployment status
npx vercel ls --limit 5`,
      },
      {
        typeName: "link",
        title: "Docker Reference Docs",
        content: "https://docs.docker.com/reference/",
      },
      {
        typeName: "link",
        title: "GitHub Actions Docs",
        content: "https://docs.github.com/en/actions",
      },
    ],
  },

  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        typeName: "command",
        title: "Git Operations",
        content: `# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Create branch and push to remote
git checkout -b feat/my-feature && git push -u origin feat/my-feature

# Clean up merged local branches
git branch --merged main | grep -v '^\\* \\|main\\|master' | xargs git branch -d

# Amend last commit message without changing files
git commit --amend --only -m "new message"

# Show log as graph
git log --oneline --graph --all --decorate`,
      },
      {
        typeName: "command",
        title: "Docker Commands",
        content: `# Remove all stopped containers and dangling images
docker system prune -af

# Exec into running container (finds by name)
docker exec -it $(docker ps -qf "name=app") sh

# Stream container logs (last 100 lines)
docker logs -f --tail=100 $(docker ps -qf "name=app")

# Build image and run with env file
docker build -t myapp:latest . && docker run --env-file .env -p 3000:3000 myapp:latest

# Show running containers with resource usage
docker stats --no-stream`,
      },
      {
        typeName: "command",
        title: "Process Management",
        content: `# Kill process on a specific port
lsof -ti:3000 | xargs kill -9

# Find node processes
ps aux | grep node | grep -v grep

# Run process in background, save PID
nohup node server.js > app.log 2>&1 & echo $! > app.pid

# Graceful shutdown via PID file
kill -SIGTERM $(cat app.pid)

# Watch file changes (macOS/Linux)
watch -n 2 'ls -lh dist/'`,
      },
      {
        typeName: "command",
        title: "Package Manager Utils",
        content: `# Check for outdated packages
npm outdated

# Upgrade all deps to latest (interactive)
npx npm-check-updates -ui

# Audit and auto-fix vulnerabilities
npm audit fix

# List global packages
npm list -g --depth=0

# Clean reinstall
rm -rf node_modules package-lock.json && npm install

# Check why a package is installed
npm why <package-name>`,
      },
    ],
  },

  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        typeName: "link",
        title: "Tailwind CSS Documentation",
        content: "https://tailwindcss.com/docs",
      },
      {
        typeName: "link",
        title: "shadcn/ui Components",
        content: "https://ui.shadcn.com/docs/components",
      },
      {
        typeName: "link",
        title: "Material Design 3 Components",
        content: "https://m3.material.io/components",
      },
      {
        typeName: "link",
        title: "Lucide Icons Library",
        content: "https://lucide.dev/icons",
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. User
  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: { isPro: true, emailVerified: new Date() },
    create: {
      name: "Faisal",
      email: SEED_EMAIL,
      passwordHash,
      isPro: true,
      emailVerified: new Date(),
    },
  });
  console.log(`✓ User upserted: ${user.email}`);

  // 2. Item Types (system)
  for (const t of ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { name: t.name },
      update: { icon: t.icon, color: t.color, isSystem: true },
      create: { ...t, isSystem: true },
    });
  }
  console.log(`✓ Item types seeded (${ITEM_TYPES.length})`);

  // 3. Collections + Items
  for (const col of COLLECTIONS) {
    // Upsert the collection
    const collection = await prisma.collection.upsert({
      where: { userId_name: { userId: user.id, name: col.name } },
      update: { description: col.description },
      create: { userId: user.id, name: col.name, description: col.description },
    });

    // Replace all items in this collection (idempotent)
    await prisma.item.deleteMany({ where: { collectionId: collection.id } });

    for (const item of col.items) {
      const typeRecord = await prisma.itemType.findUniqueOrThrow({
        where: { name: item.typeName },
      });
      await prisma.item.create({
        data: {
          collectionId: collection.id,
          typeId: typeRecord.id,
          title: item.title,
          content: item.content,
          language: item.language ?? null,
        },
      });
    }

    console.log(`✓ Collection "${col.name}" — ${col.items.length} items`);
  }

  console.log("\n✅  Seed complete.");
  console.log(`   User:     ${SEED_EMAIL}`);
  console.log(`   Password: 12345678`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
