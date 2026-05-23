'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_LABELS } from '@/lib/constants'
import { ServiceType } from '@/types'

const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

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
          className="flex items-center gap-1 text-xs text-[#888] hover:text-[#1A1A18] transition-colors"
        >
          <Plus size={12} />
          Novo
        </button>
      )
    }
    return (
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus size={14} />
        Novo projeto
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-[#E5E4E0] shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-[#1A1A18]">Novo projeto</p>
          <button onClick={() => setOpen(false)} className="text-[#aaa] hover:text-[#1A1A18]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Identidade Visual — Studio X" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service">Serviço</Label>
            <select
              id="service"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input id="value" value={form.value} onChange={e => set('value', e.target.value)} placeholder="1.370,00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Prazo</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes do briefing, requisitos..."
              className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar projeto'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
