'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Contact, LeadStatus, ServiceType } from '@/types'
import { STATUS_LABELS, SERVICE_LABELS } from '@/lib/constants'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]
const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

const inputStyle = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  border: '1px solid #1E1F2E',
  color: '#E8E9F4',
  borderRadius: '8px',
}

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
        className="w-full text-sm py-2 rounded-xl transition-all hover:opacity-80"
        style={{ color: '#7273A0', border: '1px solid #1E1F2E', backgroundColor: '#111218' }}
      >
        Editar dados
      </button>
    )
  }

  return (
    <div
      className="p-4 space-y-3 rounded-xl"
      style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
    >
      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#4A4B6A', letterSpacing: '0.12em' }}>
        Editar
      </p>

      {[
        { label: 'Nome', field: 'name', value: form.name },
        { label: 'WhatsApp', field: 'phone', value: form.phone },
      ].map(({ label, field, value }) => (
        <div key={field} className="space-y-1">
          <label className="text-xs" style={{ color: '#5A5C7E' }}>{label}</label>
          <input
            value={value}
            onChange={e => set(field, e.target.value)}
            className="w-full h-8 px-3 text-sm focus:outline-none"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(91,33,182,0.4)')}
            onBlur={e => (e.target.style.borderColor = '#1E1F2E')}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#5A5C7E' }}>Status</label>
        <select
          value={form.status}
          onChange={e => set('status', e.target.value)}
          className="w-full h-8 px-3 text-sm focus:outline-none"
          style={{ ...inputStyle, appearance: 'none' }}
        >
          {STATUSES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#5A5C7E' }}>Serviço</label>
        <select
          value={form.service}
          onChange={e => set('service', e.target.value)}
          className="w-full h-8 px-3 text-sm focus:outline-none"
          style={{ ...inputStyle, appearance: 'none' }}
        >
          <option value="">—</option>
          {SERVICES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#5A5C7E' }}>Observações</label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full min-h-[60px] px-3 py-2 text-sm resize-none focus:outline-none"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(91,33,182,0.4)')}
          onBlur={e => (e.target.style.borderColor = '#1E1F2E')}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-8 px-4 rounded-lg text-xs transition-all hover:bg-white/5"
          style={{ color: '#5A5C7E', border: '1px solid #1E1F2E' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
