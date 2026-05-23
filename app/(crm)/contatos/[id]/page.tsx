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

  const INTERACTION_LABELS = {
    mensagem: 'Mensagem',
    nota: 'Nota',
    proposta: 'Proposta',
    reuniao: 'Reunião',
    email: 'E-mail',
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/contatos" className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A18] mb-6">
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">{contact.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={contact.status} />
            {contact.service && (
              <span className="text-sm text-[#888]">{SERVICE_LABELS[contact.service]}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Histórico de interações */}
          <div className="bg-white rounded-lg border border-[#E5E4E0]">
            <div className="px-5 py-4 border-b border-[#E5E4E0]">
              <p className="text-sm font-semibold text-[#1A1A18]">Histórico</p>
            </div>
            <InteractionForm contactId={id} />
            <div className="divide-y divide-[#F0EFE9]">
              {!interactions?.length ? (
                <p className="px-5 py-6 text-sm text-[#888]">Nenhuma interação registrada.</p>
              ) : (
                interactions.map(item => (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#555] bg-[#F0EFE9] px-2 py-0.5 rounded">
                        {INTERACTION_LABELS[item.type]}
                      </span>
                      <span className="text-xs text-[#aaa]">
                        {format(new Date(item.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-[#333] whitespace-pre-wrap">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dados do contato + edição */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E5E4E0] p-5 space-y-3">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Dados</p>
            {contact.phone && (
              <div>
                <p className="text-xs text-[#aaa]">WhatsApp</p>
                <p className="text-sm text-[#1A1A18]">{contact.phone}</p>
              </div>
            )}
            {contact.email && (
              <div>
                <p className="text-xs text-[#aaa]">E-mail</p>
                <p className="text-sm text-[#1A1A18]">{contact.email}</p>
              </div>
            )}
            {contact.instagram && (
              <div>
                <p className="text-xs text-[#aaa]">Instagram</p>
                <p className="text-sm text-[#1A1A18]">{contact.instagram}</p>
              </div>
            )}
            {contact.company && (
              <div>
                <p className="text-xs text-[#aaa]">Empresa</p>
                <p className="text-sm text-[#1A1A18]">{contact.company}</p>
              </div>
            )}
            {contact.notes && (
              <div>
                <p className="text-xs text-[#aaa]">Observações</p>
                <p className="text-sm text-[#1A1A18]">{contact.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#aaa]">Cadastrado em</p>
              <p className="text-sm text-[#1A1A18]">
                {format(new Date(contact.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <EditContactForm contact={contact} />

          <AgentePanel contact={contact} interactions={interactions ?? []} />
        </div>
      </div>
    </div>
  )
}
