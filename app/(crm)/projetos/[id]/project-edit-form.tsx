'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_LABELS } from '@/lib/constants'
import { Project, ServiceType } from '@/types'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

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
    <div className="bg-white rounded-lg border border-[#E5E4E0]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#1A1A18]"
      >
        Editar projeto
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <form onSubmit={handleSave} className="px-5 pb-5 space-y-4 border-t border-[#F0EFE9]">
          <div className="space-y-1.5 pt-4">
            <Label htmlFor="edit-title">Título *</Label>
            <Input id="edit-title" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-service">Serviço</Label>
            <select
              id="edit-service"
              value={form.service}
              onChange={e => set('service', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Selecionar...</option>
              {SERVICES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-value">Valor (R$)</Label>
              <Input id="edit-value" value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-deadline">Prazo</Label>
              <Input id="edit-deadline" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Observações</Label>
            <textarea
              id="edit-notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>

          <div className="border-t border-[#F0EFE9] pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700"
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
