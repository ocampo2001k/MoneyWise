'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HeaderSearch() {
  const router = useRouter()
  const params = useSearchParams()
  const pathname = usePathname()
  const [value, setValue] = useState('')

  useEffect(() => {
    if (pathname === '/transactions') setValue(params.get('q') ?? '')
    else setValue('')
  }, [pathname, params])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    router.push(`/transactions${qs.toString() ? `?${qs}` : ''}`)
  }

  return (
    <form onSubmit={submit} role="search">
      <input
        type="search"
        className="input w-[260px]"
        placeholder="Search transactions…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search transactions"
      />
    </form>
  )
}
