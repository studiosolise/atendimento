'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_LABELS } from '@/lib/constants'
import { Project, ServiceType } from '@/types'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

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
    e.target.style.borderColor = '#1A1A18'
    e.target.style.outline = 'none'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E5E8'
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
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-colors hover:bg-[#FAFAFA]"
        style={{ color: '#1A1A18' }}
      >
        Editar projeto
        {open
          ? <ChevronUp size={14} style={{ color: '#AAAAAA' }} />
          : <ChevronDown size={14} style={{ color: '#AAAAAA' }} />
        }
      </button>

      {open && (
        <form
          onSubmit={handleSave}
          className="px-5 pb-5 space-y-4"
          style={{ borderTop: '1px solid #F0F0F0' }}
        >
          <div className="space-y-1.5 pt-4">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Título *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
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

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Observações</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full min-h-[72px] px-3 py-2 text-sm resize-none focus:outline-none bg-white rounded-lg"
              style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-40 hover:opacity-80"
              style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 px-4 rounded-lg text-xs transition-all hover:bg-[#F1F1F3]"
              style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
            >
              Cancelar
            </button>
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid #F0F0F0' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: '#CCCCCC' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#CCCCCC')}
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
