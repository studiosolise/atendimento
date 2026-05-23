'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_LABELS } from '@/lib/constants'
import { Project, ServiceType } from '@/types'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.03)',
  border: '1px solid #1E1F2E',
  color: '#E8E9F4',
  borderRadius: '8px',
  height: '36px',
  padding: '0 12px',
  fontSize: '14px',
}

export function ProjectEditForm({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    title: project.title,
    service: project.service ?? '',
    value: project.value ? String(project.value) : '',
    deadline: project.deadline ?? '',
    notes: project.notes ?? '',
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/projetos/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        service: form.service || null,
        value: form.value ? parseFloat(form.value.replace(',', '.')) : null,
        deadline: form.deadline || null,
        notes: form.notes || null,
      }),
    })

    setLoading(false)
    if (!res.ok) { setError('Erro ao salvar.'); return }
    setOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Excluir este projeto? Esta ação não pode ser desfeita.')) return
    await fetch(`/api/projetos/${project.id}`, { method: 'DELETE' })
    router.push('/projetos')
    router.refresh()
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-colors hover:bg-white/[0.02]"
        style={{ color: '#E8E9F4' }}
      >
        Editar projeto
        {open
          ? <ChevronUp size={14} style={{ color: '#5A5C7E' }} />
          : <ChevronDown size={14} style={{ color: '#5A5C7E' }} />
        }
      </button>

      {open && (
        <form
          onSubmit={handleSave}
          className="px-5 pb-5 space-y-4"
          style={{ borderTop: '1px solid #1A1B28' }}
        >
          <div className="space-y-1.5 pt-4">
            <label className="text-xs" style={{ color: '#5A5C7E' }}>Título *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
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
              className="w-full min-h-[72px] px-3 py-2 text-sm resize-none focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid #1E1F2E',
                color: '#E8E9F4',
                borderRadius: '8px',
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 px-4 rounded-lg text-xs transition-all hover:bg-white/5"
              style={{ color: '#5A5C7E', border: '1px solid #1E1F2E' }}
            >
              Cancelar
            </button>
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid #1A1B28' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: '#3A3C55' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3A3C55')}
            >
              <Trash2 size={12} />
              Excluir projeto
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
