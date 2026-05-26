import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return `https://wa.me/${digits}`
  return `https://wa.me/55${digits}`
}
import { StatusDropdown } from './status-dropdown'
import { SERVICE_LABELS } from '@/lib/constants'
import { Contact } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EditContactForm } from './edit-contact-form'
import { AgentePanel } from './agente-panel'
import { FollowupsPanel } from './followups-panel'
import { ProjectsPanel } from './projects-panel'
import { FlagsPanel } from './flags-panel'
import { Followup } from '@/types'

export default async function ContatoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single() as { data: Contact | null }

  if (!contact) notFound()

  const { data: followups } = await supabase
    .from('followups')
    .select('*')
    .eq('contact_id', id)
    .order('scheduled_for', { ascending: true }) as { data: Followup[] | null }

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/contatos"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-60"
        style={{ color: '#AAAAAA' }}
      >
        <ArrowLeft size={14} />
        Contatos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>
            {contact.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusDropdown contactId={id} status={contact.status} />
            {contact.service && (
              <span className="text-sm" style={{ color: '#AAAAAA' }}>
                {SERVICE_LABELS[contact.service]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VERA — hero panel */}
      <div className="mb-6">
        <AgentePanel contact={contact} />
      </div>

      {/* 2 colunas: dados | painéis */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-3 md:col-span-1 space-y-3">
          {/* Dados do contato */}
          <div
            className="p-5 space-y-3 rounded-xl"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
          >
            <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
              Dados
            </p>
            {contact.phone && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>WhatsApp</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm" style={{ color: '#1A1A18' }}>{contact.phone}</p>
                  <a
                    href={toWhatsAppUrl(contact.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all hover:opacity-80"
                    style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#16A34A">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.073 23.445a.75.75 0 00.92.92l5.704-1.447A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.699-.502-5.253-1.38l-.374-.214-3.886.986.997-3.77-.23-.389A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Abrir
                  </a>
                </div>
              </div>
            )}
            {contact.email && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>E-mail</p>
                <p className="text-sm" style={{ color: '#1A1A18' }}>{contact.email}</p>
              </div>
            )}
            {contact.instagram && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Instagram</p>
                <p className="text-sm" style={{ color: '#1A1A18' }}>{contact.instagram}</p>
              </div>
            )}
            {contact.company && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Empresa</p>
                <p className="text-sm" style={{ color: '#1A1A18' }}>{contact.company}</p>
              </div>
            )}
            {contact.notes && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Observações</p>
                <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>{contact.notes}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Cadastrado em</p>
              <p className="text-sm" style={{ color: '#AAAAAA' }}>
                {format(new Date(contact.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <FlagsPanel contactId={id} initial={contact.flags ?? []} />
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
