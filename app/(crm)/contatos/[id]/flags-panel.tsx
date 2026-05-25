'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FLAGS, FlagId } from '@/lib/flags'

export function FlagsPanel({ contactId, initial }: { contactId: string; initial: string[] }) {
  const supabase = createClient()
  const [flags, setFlags] = useState<string[]>(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function toggle(id: FlagId) {
    setLoading(id)
    const next = flags.includes(id) ? flags.filter(f => f !== id) : [...flags, id]
    await supabase.from('contacts').update({ flags: next }).eq('id', contactId)
    setFlags(next)
    setLoading(null)
  }

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
    >
      <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
        Sinalizadores
      </p>
      <div className="flex flex-col gap-2">
        {FLAGS.map(flag => {
          const active = flags.includes(flag.id)
          return (
            <button
              key={flag.id}
              onClick={() => toggle(flag.id as FlagId)}
              disabled={loading === flag.id}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={active ? {
                backgroundColor: flag.bg,
                color: flag.color,
                border: `1px solid ${flag.border}`,
              } : {
                backgroundColor: '#FAFAFA',
                color: '#AAAAAA',
                border: '1px solid #EEEEEE',
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: active ? flag.color : '#CCCCCC' }}
              />
              {flag.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
