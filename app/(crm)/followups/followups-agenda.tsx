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
      <div className="mb-6">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${destaque ? 'text-red-500' : 'text-[#888]'}`}>
          {titulo}
        </p>
        <div className="bg-white rounded-lg border border-[#E5E4E0] divide-y divide-[#F0EFE9]">
          {visiveis.map(f => (
            <div key={f.id} className="flex items-center gap-3 px-4 py-3 group">
              <button
                onClick={() => marcarFeito(f.id)}
                disabled={isPending}
                className="w-5 h-5 rounded border border-[#C8C7C0] hover:border-[#1A1A18] hover:bg-[#1A1A18] flex items-center justify-center transition-colors flex-shrink-0 group/btn"
              >
                <Check size={11} className="text-transparent group-hover/btn:text-white" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#1A1A18] truncate">
                    {f.contacts?.name ?? 'Contato removido'}
                  </p>
                  <span className="text-xs text-[#aaa]">
                    {format(new Date(f.scheduled_for), "d 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
                {f.message_template && (
                  <p className="text-xs text-[#999] truncate mt-0.5">{f.message_template}</p>
                )}
              </div>

              {f.contacts?.id && (
                <Link
                  href={`/contatos/${f.contacts.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#C8C7C0] hover:text-[#1A1A18]"
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
