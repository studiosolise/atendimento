'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Contact, LeadStatus, ServiceType } from '@/types'
import { STATUS_LABELS, SERVICE_LABELS } from '@/lib/constants'
import { Trash2 } from 'lucide-react'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1A1A18'
    e.target.style.outline = 'none'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E5E8'
  }

  async function handleDelete() {
    if (!confirm('Excluir este contato? O histórico e follow-ups serão removidos. Esta ação não pode ser desfeita.')) return
    await supabase.from('contacts').delete().eq('id', contact.id)
    router.push('/contatos')
    router.refresh()
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
        className="w-full text-sm py-2 rounded-xl transition-all hover:bg-[#F1F1F3]"
        style={{ color: '#AAAAAA', border: '1px solid #E5E5E8', backgroundColor: '#FFFFFF' }}
      >
        Editar dados
      </button>
    )
  }

  return (
    <div
      className="p-4 space-y-3 rounded-xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
    >
      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
        Editar
      </p>

      {[
        { label: 'Nome', field: 'name', value: form.name },
        { label: 'WhatsApp', field: 'phone', value: form.phone },
      ].map(({ label, field, value }) => (
        <div key={field} className="space-y-1">
          <label className="text-xs" style={{ color: '#AAAAAA' }}>{label}</label>
          <input
            value={value}
            onChange={e => set(field, e.target.value)}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#AAAAAA' }}>Status</label>
        <select
          value={form.status}
          onChange={e => set('status', e.target.value)}
          style={{ ...inputStyle, appearance: 'none' }}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {STATUSES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#AAAAAA' }}>Serviço</label>
        <select
          value={form.service}
          onChange={e => set('service', e.target.value)}
          style={{ ...inputStyle, appearance: 'none' }}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <option value="">—</option>
          {SERVICES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs" style={{ color: '#AAAAAA' }}>Observações</label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full min-h-[60px] px-3 py-2 text-sm resize-none focus:outline-none bg-white rounded-lg"
          style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-40 hover:opacity-80"
          style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-8 px-4 rounded-lg text-xs transition-all hover:bg-[#F1F1F3]"
          style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
        >
          Cancelar
        </button>
      </div>

      <div className="pt-3" style={{ borderTop: '1px solid #F0F0F0' }}>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: '#CCCCCC' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
          onMouseLeave={e => (e.currentTarget.style.color = '#CCCCCC')}
        >
          <Trash2 size={12} />
          Excluir contato
        </button>
      </div>
    </div>
  )
}
