'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { LeadStatus, ServiceType } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]
const SERVICES = Object.entries(SERVICE_LABELS) as [ServiceType, string][]

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

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/contatos" className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A18] mb-6">
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Contatos</p>
        <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Novo contato</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E5E4E0] p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 9 0000-0000" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@handle" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome da empresa" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service">Serviço de interesse</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
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
            <Label htmlFor="source">Canal de entrada</Label>
            <select
              id="source"
              value={form.source}
              onChange={e => set('source', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="instagram_ads">Instagram Ads</option>
              <option value="whatsapp_direto">WhatsApp Direto</option>
              <option value="indicacao">Indicação</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Contexto sobre o lead, necessidades específicas..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar contato'}
          </Button>
          <Link href="/contatos">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
