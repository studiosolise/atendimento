'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/constants'
import { ServiceType } from '@/types'

const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid #1E1F2E',
  color: '#E8E9F4',
  borderRadius: '8px',
  height: '36px',
  padding: '0 12px',
  fontSize: '14px',
}

export function NovoProjetoButton({ contactId, contactName, compact }: { contactId?: string; contactName?: string; compact?: boolean } = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    title: contactName ? `Projeto ${contactName}` : '',
    service: '' as ServiceType | '',
    value: '',
    deadline: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(91,33,182,0.5)'
    e.target.style.outline = 'none'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1E1F2E'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: contactId ?? null,
        title: form.title.trim(),
        service: form.service || null,
        value: form.value ? parseFloat(form.value.replace(',', '.')) : null,
        deadline: form.deadline || null,
        notes: form.notes || null,
      }),
    })

    if (!res.ok) { setError('Erro ao criar projeto.'); setLoading(false); return }
    const project = await res.json()
    setOpen(false)
    router.push(`/projetos/${project.id}`)
    router.refresh()
  }

  if (!open) {
    if (compact) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
          style={{ color: '#7273A0' }}
        >
          <Plus size={12} />
          Novo
        </button>
      )
    }
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all"
        style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
      >
        <Plus size={14} />
        Novo projeto
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-md p-6 rounded-xl"
        style={{ backgroundColor: '#13131C', border: '1px solid #1E1F2E', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: '#E8E9F4' }}>Novo projeto</p>
          <button
            onClick={() => setOpen(false)}
            className="transition-colors hover:opacity-80"
            style={{ color: '#5A5C7E' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#5A5C7E' }}>Título *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Identidade Visual — Studio X"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#5A5C7E' }}>Serviço</label>
            <select
              value={form.service}
              onChange={e => set('service', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Selecionar...</option>
              {SERVICES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: '#5A5C7E' }}>Valor (R$)</label>
              <input
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder="1.370,00"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: '#5A5C7E' }}>Prazo</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#5A5C7E' }}>Observações</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes do briefing, requisitos..."
              className="w-full min-h-[72px] px-3 py-2.5 text-sm resize-none focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid #1E1F2E',
                color: '#E8E9F4',
                borderRadius: '8px',
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
            >
              {loading ? 'Criando...' : 'Criar projeto'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 px-5 rounded-lg text-sm transition-all hover:bg-white/5"
              style={{ color: '#5A5C7E', border: '1px solid #1E1F2E' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
