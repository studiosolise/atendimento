'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LeadStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]

interface Props {
  contactId: string
  status: LeadStatus
}

export function StatusDropdown({ contactId, status }: Props) {
  const [current, setCurrent] = useState<LeadStatus>(status)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSelect(newStatus: LeadStatus) {
    if (newStatus === current) { setOpen(false); return }
    setSaving(true)
    setOpen(false)
    setCurrent(newStatus)
    await supabase
      .from('contacts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', contactId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={saving}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border transition-opacity',
          STATUS_COLORS[current],
          saving && 'opacity-50'
        )}
      >
        {STATUS_LABELS[current]}
        <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-20 rounded-xl overflow-hidden bg-white"
          style={{ border: '1px solid #E5E5E8', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: '160px' }}
        >
          {STATUSES.map(([key, label], i) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-[#FAFAFA]"
              style={{ borderTop: i > 0 ? '1px solid #F5F5F5' : 'none' }}
            >
              <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium border', STATUS_COLORS[key])}>
                {label}
              </span>
              {key === current && (
                <span className="ml-auto text-[10px]" style={{ color: '#CCCCCC' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
