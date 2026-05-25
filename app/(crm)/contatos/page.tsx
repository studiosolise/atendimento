import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/crm/status-badge'
import { ContactsSearch } from '@/components/crm/contacts-search'
import { ImportCSVButton } from './import-csv-button'
import { SERVICE_LABELS } from '@/lib/constants'
import { Contact } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense } from 'react'

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return `https://wa.me/${digits}`
  return `https://wa.me/55${digits}`
}

export default async function ContatosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: contacts } = await query as { data: Contact[] | null }

  const filtered = contacts?.filter(c => {
    if (!q) return true
    const search = q.toLowerCase()
    return (
      c.name.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.phone?.includes(search) ||
      c.company?.toLowerCase().includes(search)
    )
  }) ?? []

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#AAAAAA', letterSpacing: '0.14em' }}>
            Gestão
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>Contatos</h1>
        </div>
        <div className="flex items-center gap-2">
          <ImportCSVButton />
          <Link href="/contatos/novo">
            <button
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
            >
              <Plus size={14} />
              Novo contato
            </button>
          </Link>
        </div>
      </div>

      <Suspense>
        <ContactsSearch />
      </Suspense>

      <div
        className="overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8', borderRadius: '10px' }}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum contato encontrado.</p>
            <Link
              href="/contatos/novo"
              className="mt-3 inline-block text-sm underline underline-offset-2"
              style={{ color: '#1A1A18' }}
            >
              Adicionar primeiro contato
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E5E8', backgroundColor: '#FAFAFA' }}>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Nome</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Serviço</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Último contato</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  className="transition-colors hover:bg-[#FAFAFA]"
                  style={{ borderBottom: '1px solid #F5F5F5' }}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/contatos/${contact.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2"
                      style={{ color: '#1A1A18' }}
                    >
                      {contact.name}
                    </Link>
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs" style={{ color: '#AAAAAA' }}>{contact.phone}</p>
                        <a
                          href={toWhatsAppUrl(contact.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir no WhatsApp"
                          className="hover:opacity-70 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.073 23.445a.75.75 0 00.92.92l5.704-1.447A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.699-.502-5.253-1.38l-.374-.214-3.886.986.997-3.77-.23-.389A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                          </svg>
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#888888' }}>
                    {contact.service ? SERVICE_LABELS[contact.service] : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#AAAAAA' }}>
                    {contact.last_contact_at
                      ? formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true, locale: ptBR })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#AAAAAA' }}>
                    {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
