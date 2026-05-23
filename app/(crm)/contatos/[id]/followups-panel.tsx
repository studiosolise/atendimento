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

  function corData(iso: string) {
    const d = new Date(iso)
    if (isPast(d) && !isToday(d)) return '#F87171'
    if (isToday(d)) return '#E8E9F4'
    return '#5A5C7E'
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-white/[0.02] rounded-xl"
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E8E9F4' }}>
            Follow-ups
          </p>
          {pendentes.length > 0 && (
            <span
              className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}
            >
              {pendentes.length}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className="transition-transform"
          style={{ color: '#5A5C7E', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5" style={{ borderTop: '1px solid #1A1B28' }}>
          <div className="pt-3 relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-full text-left text-xs rounded-lg px-3 py-2 transition-colors"
              style={{
                color: '#5A5C7E',
                border: '1px dashed #1E1F2E',
              }}
            >
              + Criar roteiro de follow-up
            </button>
            {menuOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-full rounded-xl z-10 overflow-hidden"
                style={{ backgroundColor: '#17172A', border: '1px solid #252538', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              >
                <button
                  onClick={() => criarRoteiro('primeiro_contato')}
                  className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5"
                >
                  <p className="font-medium" style={{ color: '#E8E9F4' }}>Primeiro contato</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A5C7E' }}>D+3, D+7, D+14</p>
                </button>
                <div style={{ borderTop: '1px solid #1E1F2E' }} />
                <button
                  onClick={() => criarRoteiro('proposta')}
                  className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5"
                >
                  <p className="font-medium" style={{ color: '#E8E9F4' }}>Após proposta</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A5C7E' }}>D+3, D+7, D+14, D+21</p>
                </button>
              </div>
            )}
          </div>

          {pendentes.length === 0 && feitos.length === 0 && (
            <p className="text-xs" style={{ color: '#3A3C55' }}>Nenhum follow-up agendado.</p>
          )}

          {pendentes.map(f => (
            <div key={f.id} className="flex items-start gap-2 group">
              <button
                onClick={() => marcarFeito(f.id)}
                disabled={isPending}
                className="mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0"
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
                <Check size={10} style={{ color: 'transparent' }} className="group-hover:text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: corData(f.scheduled_for) }}>
                  {labelData(f.scheduled_for)}
                </p>
                {f.message_template && (
                  <p className="text-xs truncate mt-0.5" style={{ color: '#3A3C55' }}>{f.message_template}</p>
                )}
              </div>
              <button
                onClick={() => deletar(f.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#3A3C55' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3C55')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {feitos.length > 0 && (
            <p className="text-[11px]" style={{ color: '#2A2B3D' }}>
              {feitos.length} feito{feitos.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
