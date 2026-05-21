'use client'

import { useEffect, useState } from 'react'

type Resolved = 'light' | 'dark'

function resolveTheme(): Resolved {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [resolved, setResolved] = useState<Resolved | null>(null)

  useEffect(() => {
    setResolved(resolveTheme())
  }, [])

  const toggle = () => {
    const next: Resolved = resolved === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('moneywise-theme', next)
    } catch {
      // localStorage may be blocked in private browsing or by storage quota; ignore
    }
    setResolved(next)
  }

  const label = resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  const icon = resolved === 'dark' ? '☀️' : resolved === 'light' ? '🌙' : ''

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-secondary"
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
