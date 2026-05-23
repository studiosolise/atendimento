import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@/components/crm/status-badge'
import { SERVICE_LABELS } from '@/lib/constants'
import { Contact, Interaction } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { InteractionForm } from './interaction-form'
import { EditContactForm } from './edit-contact-form'
import { AgentePanel } from './agente-panel'
import { FollowupsPanel } from './followups-panel'
import { ProjectsPanel } from './projects-panel'
import { Followup } from '@/types'

const INTERACTION_LABELS: Record<string, string> = {
  mensagem: 'Mensagem',
  nota: 'Nota',
  proposta: 'Proposta',
  reuniao: 'Reunião',
  email: 'E-mail',
}

export default async function ContatoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single() as { data: Contact | null }

  if (!contact) notFound()

  const { data: interactions } = await supabase
    .from('interactions')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false }) as { data: Interaction[] | null }

  const { data: followups } = await supabase
    .from('followups')
    .select('*')
    .eq('contact_id', id)
    .order('scheduled_for', { ascending: true }) as { data: Followup[] | null }

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/contatos"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
        style={{ color: '#5A5C7E' }}
      >
        <ArrowLeft size={14} />
        Contatos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#E8E9F4' }}>
            {contact.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={contact.status} />
            {contact.service && (
              <span className="text-sm" style={{ color: '#5A5C7E' }}>
                {SERVICE_LABELS[contact.service]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VERA — hero panel, sempre visível */}
      <div className="mb-6">
        <AgentePanel contact={contact} interactions={interactions ?? []} />
      </div>

      {/* 2 colunas: histórico | dados */}
      <div className="grid grid-cols-3 gap-5">
        {/* Histórico */}
        <div className="col-span-2 space-y-4">
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A1B28' }}>
              <p className="text-sm font-semibold" style={{ color: '#E8E9F4' }}>Histórico</p>
            </div>
            <InteractionForm contactId={id} />
            <div>
              {!interactions?.length ? (
                <p className="px-5 py-6 text-sm" style={{ color: '#5A5C7E' }}>
                  Nenhuma interação registrada.
                </p>
              ) : (
                interactions.map(item => (
                  <div
                    key={item.id}
                    className="px-5 py-4"
                    style={{ borderBottom: '1px solid #181926' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#7273A0' }}
                      >
                        {INTERACTION_LABELS[item.type] ?? item.type}
                      </span>
                      <span className="text-xs" style={{ color: '#3A3C55' }}>
                        {format(new Date(item.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#B0B2D0' }}>
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dados + painéis */}
        <div className="space-y-3">
          {/* Dados do contato */}
          <div
            className="p-5 space-y-3 rounded-xl"
            style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
          >
            <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#4A4B6A', letterSpacing: '0.12em' }}>
              Dados
            </p>
            {contact.phone && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>WhatsApp</p>
                <p className="text-sm" style={{ color: '#E8E9F4' }}>{contact.phone}</p>
              </div>
            )}
            {contact.email && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>E-mail</p>
                <p className="text-sm" style={{ color: '#E8E9F4' }}>{contact.email}</p>
              </div>
            )}
            {contact.instagram && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>Instagram</p>
                <p className="text-sm" style={{ color: '#E8E9F4' }}>{contact.instagram}</p>
              </div>
            )}
            {contact.company && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>Empresa</p>
                <p className="text-sm" style={{ color: '#E8E9F4' }}>{contact.company}</p>
              </div>
            )}
            {contact.notes && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>Observações</p>
                <p className="text-sm leading-relaxed" style={{ color: '#B0B2D0' }}>{contact.notes}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: '#3A3C55' }}>Cadastrado em</p>
              <p className="text-sm" style={{ color: '#7273A0' }}>
                {format(new Date(contact.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <EditContactForm contact={contact} />
          <FollowupsPanel contactId={id} initial={followups ?? []} />

          {contact.status === 'fechado' && (
            <ProjectsPanel contactId={id} contactName={contact.name} />
          )}
        </div>
      </div>
    </div>
  )
}
