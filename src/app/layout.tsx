import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import HeaderSearch from "./ui/HeaderSearch";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moneywise",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen grid grid-cols-[260px_1fr] grid-rows-[64px_1fr]" style={{background: 'var(--color-background)'}}>
          <aside className="row-span-2 col-start-1 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-4">
            <div className="h1 mb-6">💰 Moneywise</div>
            <nav className="space-y-2 text-sm">
              <Link className="block btn btn-secondary !w-full" href="/">Home</Link>
              <Link className="block btn btn-secondary !w-full" href="/transactions">Transactions</Link>
              <Link className="block btn btn-secondary !w-full" href="/analytics">Analytics</Link>
              <Link className="block btn btn-secondary !w-full" href="/categories">Categories</Link>
            </nav>
          </aside>
          <header className="col-start-2 row-start-1 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="text-lg font-medium">Dashboard</div>
            <div className="flex items-center gap-3">
              <Suspense fallback={<input className="input w-[260px]" placeholder="Search transactions…" disabled />}>
                <HeaderSearch />
              </Suspense>
            </div>
          </header>
          <main className="col-start-2 row-start-2 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
