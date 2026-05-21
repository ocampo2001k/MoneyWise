## MoneyWise

Personal finance tracker built with Next.js (App Router), TypeScript, and Prisma/SQLite.

### Features
- Transactions: add, edit, delete income/expense
- Categories: CRUD with type (INCOME | EXPENSE)
- Filters: by category, type, date range
- Summaries: income, expenses, balance
- Design system: brand tokens, dark mode, reusable classes

### Tech
- Next.js 15 (App Router) + React 19
- Prisma 6 + SQLite
- TypeScript, ESLint

### Getting started
1) Install deps
```bash
npm ci
```
2) Configure env (SQLite)
```bash
echo DATABASE_URL="file:./dev.db" > prisma/.env
```
3) Migrate & seed
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```
4) Dev server
```bash
npm run dev
```

### Useful scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run prisma:seed` – seed default categories
- `npx prisma studio` – inspect the DB

### API
- `GET/POST /api/transactions`
- `GET/PUT/DELETE /api/transactions/[id]`
- `GET/POST /api/categories`
- `PUT/DELETE /api/categories/[id]`

### Design system
Tokens defined in `src/app/globals.css` (colors, radius, shadow, typography). Utility classes: `btn`, `input`, `card`, `table`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
