'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Contact, LeadStatus, ServiceType } from '@/types'
import { STATUS_LABELS, SERVICE_LABELS } from '@/lib/constants'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]
const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

export function EditContactForm({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    instagram: contact.instagram ?? '',
    company: contact.company ?? '',
    service: contact.service ?? '',
    status: contact.status,
    notes: contact.notes ?? '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    await supabase.from('contacts').update({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      instagram: form.instagram || null,
      company: form.company || null,
      service: form.service || null,
      status: form.status,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', contact.id)

    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-sm text-center py-2 text-[#888] hover:text-[#1A1A18] transition-colors border border-[#E5E4E0] rounded-lg bg-white"
      >
        Editar dados
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E4E0] p-5 space-y-3">
      <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-1">Editar</p>

      <div className="space-y-1.5">
        <Label>Nome</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>WhatsApp</Label>
        <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <select
          value={form.status}
          onChange={e => set('status', e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        >
          {STATUSES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Serviço</Label>
        <select
          value={form.service}
          onChange={e => set('service', e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        >
          <option value="">—</option>
          {SERVICES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Observações</Label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
