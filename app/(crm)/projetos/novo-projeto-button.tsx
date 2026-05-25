'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/constants'
import { ServiceType } from '@/types'

const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E8',
  color: '#1A1A18',
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
    start_date: '',
    presentation_date: '',
    delivery_date: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1A1A18'
    e.target.style.outline = 'none'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E5E8'
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
        start_date: form.start_date || null,
        presentation_date: form.presentation_date || null,
        delivery_date: form.delivery_date || null,
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
          className="flex items-center gap-1 text-xs transition-colors hover:opacity-60"
          style={{ color: '#AAAAAA' }}
        >
          <Plus size={12} />
          Novo
        </button>
      )
    }
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
      >
        <Plus size={14} />
        Novo projeto
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-md p-6 rounded-xl"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: '#1A1A18' }}>Novo projeto</p>
          <button
            onClick={() => setOpen(false)}
            className="transition-colors hover:opacity-60"
            style={{ color: '#AAAAAA' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Título *</label>
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
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Serviço</label>
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
              <label className="text-xs" style={{ color: '#AAAAAA' }}>Valor (R$)</label>
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
              <label className="text-xs" style={{ color: '#AAAAAA' }}>Prazo</label>
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

          <div className="pt-1 pb-1" style={{ borderTop: '1px solid #F5F5F5' }}>
            <p className="text-[10px] font-semibold uppercase mb-3 pt-2" style={{ color: '#CCCCCC', letterSpacing: '0.12em' }}>
              Datas do fluxo
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: '#AAAAAA' }}>Início</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => set('start_date', e.target.value)}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: '#AAAAAA' }}>Apresentação</label>
                <input
                  type="date"
                  value={form.presentation_date}
                  onChange={e => set('presentation_date', e.target.value)}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: '#AAAAAA' }}>Entrega</label>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={e => set('delivery_date', e.target.value)}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Observações</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes do briefing, requisitos..."
              className="w-full min-h-[72px] px-3 py-2.5 text-sm resize-none focus:outline-none bg-white rounded-lg"
              style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-80"
              style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
            >
              {loading ? 'Criando...' : 'Criar projeto'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 px-5 rounded-lg text-sm transition-all hover:bg-[#F1F1F3]"
              style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
