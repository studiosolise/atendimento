'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/constants'
import { LeadStatus } from '@/types'

const FILTER_STATUSES: [string, string][] = [
  ['', 'Todos'],
  ...Object.entries(STATUS_LABELS) as [LeadStatus, string][],
]

export function ContactsSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4A4B6A' }} />
        <input
          placeholder="Buscar por nome, e-mail, telefone..."
          defaultValue={q}
          onChange={e => update('q', e.target.value)}
          className="h-9 rounded-lg pl-8 pr-3 text-sm w-72 focus:outline-none transition-colors"
          style={{
            backgroundColor: '#111218',
            border: '1px solid #1E1F2E',
            color: '#E8E9F4',
          }}
          onFocus={e => (e.target.style.borderColor = '#5B21B6')}
          onBlur={e => (e.target.style.borderColor = '#1E1F2E')}
        />
      </div>
      <div className="flex gap-1 flex-wrap">
        {FILTER_STATUSES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => update('status', key)}
            className="text-xs px-3 py-1.5 rounded-md transition-all whitespace-nowrap"
            style={status === key ? {
              backgroundColor: 'rgba(139,92,246,0.15)',
              color: '#C4B5FD',
              border: '1px solid rgba(139,92,246,0.3)',
            } : {
              backgroundColor: '#111218',
              color: '#5A5C7E',
              border: '1px solid #1E1F2E',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
