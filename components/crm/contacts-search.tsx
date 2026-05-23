'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
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
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
        <Input
          placeholder="Buscar por nome, e-mail, telefone..."
          defaultValue={q}
          onChange={e => update('q', e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-1">
        {FILTER_STATUSES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => update('status', key)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              status === key
                ? 'bg-[#1A1A18] text-white'
                : 'bg-white border border-[#E5E4E0] text-[#555] hover:border-[#ccc]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
