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
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CCCCCC' }} />
        <input
          placeholder="Buscar por nome, e-mail, telefone..."
          defaultValue={q}
          onChange={e => update('q', e.target.value)}
          className="h-9 rounded-lg pl-8 pr-3 text-sm w-72 bg-white focus:outline-none transition-colors"
          style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
          onFocus={e => (e.target.style.borderColor = '#1A1A18')}
          onBlur={e => (e.target.style.borderColor = '#E5E5E8')}
        />
      </div>
      <div className="flex gap-1 flex-wrap">
        {FILTER_STATUSES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => update('status', key)}
            className="text-xs px-3 py-1.5 rounded-md transition-all whitespace-nowrap"
            style={status === key ? {
              backgroundColor: '#1A1A18',
              color: '#FFFFFF',
              border: '1px solid #1A1A18',
            } : {
              backgroundColor: '#FFFFFF',
              color: '#666666',
              border: '1px solid #E5E5E8',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
