'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { LeadStatus, ServiceType } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

export default function NovoContatoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    instagram: '',
    company: '',
    service: '' as ServiceType | '',
    status: 'novo_lead' as LeadStatus,
    source: 'instagram_ads',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('contacts').insert({
      name: form.name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      instagram: form.instagram || null,
      company: form.company || null,
      service: form.service || null,
      status: form.status,
      source: form.source || null,
      notes: form.notes || null,
    })

    if (error) { setError('Erro ao salvar. Tente novamente.'); setLoading(false); return }
    router.push('/contatos')
    router.refresh()
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1A1A18'
    e.target.style.outline = 'none'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E5E8'
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/contatos"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-60"
        style={{ color: '#AAAAAA' }}
      >
        <ArrowLeft size={14} />
        Contatos
      </Link>

      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#AAAAAA', letterSpacing: '0.14em' }}>
          Contatos
        </p>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>Novo contato</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5 rounded-xl"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Nome *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Nome completo"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>WhatsApp</label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="(11) 9 0000-0000"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@exemplo.com"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Instagram</label>
            <input
              value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              placeholder="@handle"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Empresa</label>
            <input
              value={form.company}
              onChange={e => set('company', e.target.value)}
              placeholder="Nome da empresa"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Serviço de interesse</label>
            <select
              value={form.service}
              onChange={e => set('service', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Selecionar...</option>
              {SERVICES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              {STATUSES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Canal de entrada</label>
            <select
              value={form.source}
              onChange={e => set('source', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="instagram_ads">Instagram Ads</option>
              <option value="whatsapp_direto">WhatsApp Direto</option>
              <option value="indicacao">Indicação</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-xs" style={{ color: '#AAAAAA' }}>Observações</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Contexto sobre o lead, necessidades específicas..."
              className="w-full min-h-[80px] px-3 py-2.5 text-sm resize-none focus:outline-none bg-white rounded-lg"
              style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="h-9 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-80"
            style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
          >
            {loading ? 'Salvando...' : 'Salvar contato'}
          </button>
          <Link href="/contatos">
            <button
              type="button"
              className="h-9 px-5 rounded-lg text-sm transition-all hover:bg-[#F1F1F3]"
              style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
            >
              Cancelar
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
