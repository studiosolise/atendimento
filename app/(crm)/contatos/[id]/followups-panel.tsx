'use client'

import { useState, useTransition } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, Trash2, ChevronDown } from 'lucide-react'
import { Followup } from '@/types'

interface Props {
  contactId: string
  initial: Followup[]
}

export function FollowupsPanel({ contactId, initial }: Props) {
  const [followups, setFollowups] = useState<Followup[]>(initial)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function criarRoteiro(roteiro: 'primeiro_contato' | 'proposta') {
    setMenuOpen(false)
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'criar_roteiro', contact_id: contactId, roteiro }),
    })
    const data = await res.json()
    if (data.followups) {
      setFollowups(prev => [...prev, ...data.followups])
      setOpen(true)
    }
  }

  function marcarFeito(id: string) {
    startTransition(async () => {
      await fetch('/api/followups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFollowups(prev => prev.map(f => f.id === id ? { ...f, done: true } : f))
    })
  }

  function deletar(id: string) {
    startTransition(async () => {
      await fetch('/api/followups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFollowups(prev => prev.filter(f => f.id !== id))
    })
  }

  const pendentes = followups.filter(f => !f.done)
  const feitos = followups.filter(f => f.done)

  function labelData(iso: string) {
    const d = new Date(iso)
    if (isToday(d)) return 'Hoje'
    if (isPast(d)) return `Vencido — ${format(d, "d 'de' MMM", { locale: ptBR })}`
    return format(d, "d 'de' MMM", { locale: ptBR })
  }

  function classeData(iso: string) {
    const d = new Date(iso)
    if (isPast(d) && !isToday(d)) return 'text-red-500'
    if (isToday(d)) return 'text-[#1A1A18] font-semibold'
    return 'text-[#888]'
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E4E0]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAF8] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wider">Follow-ups</p>
          {pendentes.length > 0 && (
            <span className="text-[10px] font-semibold bg-[#1A1A18] text-white rounded-full px-1.5 py-0.5">
              {pendentes.length}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-[#888] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-3">
          {/* Botão criar roteiro */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-full text-left text-xs text-[#888] border border-dashed border-[#D0CFC9] rounded px-3 py-2 hover:border-[#888] hover:text-[#555] transition-colors"
            >
              + Criar roteiro de follow-up
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E5E4E0] rounded-lg shadow-sm z-10 overflow-hidden">
                <button
                  onClick={() => criarRoteiro('primeiro_contato')}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[#F7F7F5] transition-colors"
                >
                  <p className="font-medium text-[#1A1A18]">Primeiro contato</p>
                  <p className="text-xs text-[#888] mt-0.5">D+3, D+7, D+14</p>
                </button>
                <div className="border-t border-[#F0EFE9]" />
                <button
                  onClick={() => criarRoteiro('proposta')}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[#F7F7F5] transition-colors"
                >
                  <p className="font-medium text-[#1A1A18]">Após proposta</p>
                  <p className="text-xs text-[#888] mt-0.5">D+3, D+7, D+14, D+21</p>
                </button>
              </div>
            )}
          </div>

          {/* Lista pendentes */}
          {pendentes.length === 0 && feitos.length === 0 && (
            <p className="text-xs text-[#aaa]">Nenhum follow-up agendado.</p>
          )}

          {pendentes.map(f => (
            <div key={f.id} className="flex items-start gap-2 group">
              <button
                onClick={() => marcarFeito(f.id)}
                disabled={isPending}
                className="mt-0.5 w-4 h-4 rounded border border-[#C8C7C0] hover:border-[#1A1A18] hover:bg-[#1A1A18] flex items-center justify-center transition-colors flex-shrink-0 group/btn"
              >
                <Check size={10} className="text-transparent group-hover/btn:text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${classeData(f.scheduled_for)}`}>
                  {labelData(f.scheduled_for)}
                </p>
                {f.message_template && (
                  <p className="text-xs text-[#999] truncate mt-0.5">{f.message_template}</p>
                )}
              </div>
              <button
                onClick={() => deletar(f.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ccc] hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Feitos (colapsados) */}
          {feitos.length > 0 && (
            <p className="text-[11px] text-[#C8C7C0]">{feitos.length} feito{feitos.length > 1 ? 's' : ''}</p>
          )}
        </div>
      )}
    </div>
  )
}
