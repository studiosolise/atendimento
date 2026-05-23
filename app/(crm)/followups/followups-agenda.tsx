'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, ExternalLink } from 'lucide-react'
import { Followup } from '@/types'

interface FollowupComContato extends Followup {
  contacts: { id: string; name: string; status: string } | null
}

interface Props {
  vencidos: FollowupComContato[]
  deHoje: FollowupComContato[]
  proximos: FollowupComContato[]
  depois: FollowupComContato[]
}

export function FollowupsAgenda({ vencidos: v, deHoje: h, proximos: p, depois: d }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function marcarFeito(id: string) {
    startTransition(async () => {
      await fetch('/api/followups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setDone(prev => new Set([...prev, id]))
    })
  }

  function visivel(f: FollowupComContato) {
    return !done.has(f.id)
  }

  function Grupo({ titulo, items, destaque }: { titulo: string; items: FollowupComContato[]; destaque?: boolean }) {
    const visiveis = items.filter(visivel)
    if (visiveis.length === 0) return null
    return (
      <div className="mb-5">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider mb-3"
          style={{ color: destaque ? '#F87171' : '#4A4B6A', letterSpacing: '0.12em' }}
        >
          {titulo}
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#111218', border: `1px solid ${destaque ? 'rgba(248,113,113,0.2)' : '#1E1F2E'}` }}
        >
          {visiveis.map((f, i) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < visiveis.length - 1 ? '1px solid #181926' : 'none' }}
            >
              <button
                onClick={() => marcarFeito(f.id)}
                disabled={isPending}
                className="w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0"
                style={{ border: '1px solid #2A2B3D' }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = '#5B21B6'
                  el.style.borderColor = '#5B21B6'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = 'transparent'
                  el.style.borderColor = '#2A2B3D'
                }}
              >
                <Check size={11} style={{ color: 'transparent' }} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: '#E8E9F4' }}>
                    {f.contacts?.name ?? 'Contato removido'}
                  </p>
                  <span className="text-xs" style={{ color: '#3A3C55' }}>
                    {format(new Date(f.scheduled_for), "d 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
                {f.message_template && (
                  <p className="text-xs truncate mt-0.5" style={{ color: '#3A3C55' }}>
                    {f.message_template}
                  </p>
                )}
              </div>

              {f.contacts?.id && (
                <Link
                  href={`/contatos/${f.contacts.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#3A3C55' }}
                >
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Grupo titulo="Vencidos" items={v} destaque />
      <Grupo titulo="Hoje" items={h} />
      <Grupo titulo="Próximos 7 dias" items={p} />
      <Grupo titulo="Mais adiante" items={d} />
    </div>
  )
}
