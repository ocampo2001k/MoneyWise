import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import HeaderSearch from "./ui/HeaderSearch";
import ThemeToggle from "./ui/ThemeToggle";
import "./globals.css";

const themeInitScript = `try{var t=localStorage.getItem('moneywise-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

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
  title: "moneywise — financial tracker",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen grid grid-cols-[260px_1fr] grid-rows-[64px_1fr]" style={{background: 'var(--color-background)'}}>
          <aside className="row-span-2 col-start-1 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-4">
            <Link href="/" className="block mb-6" aria-label="moneywise home">
              <Image
                src="/branding/logo-transparent.png"
                alt="moneywise"
                width={1380}
                height={430}
                priority
                className="w-full h-auto brand-logo-light"
              />
              <Image
                src="/branding/logo-transparent-dark.png"
                alt="moneywise"
                width={1380}
                height={430}
                priority
                className="w-full h-auto brand-logo-dark"
              />
            </Link>
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
              <ThemeToggle />
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
