import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/crm/status-badge'
import { ContactsSearch } from '@/components/crm/contacts-search'
import { SERVICE_LABELS } from '@/lib/constants'
import { Contact } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense } from 'react'

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
          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#4A4B6A', letterSpacing: '0.14em' }}>
            Gestão
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#E8E9F4' }}>Contatos</h1>
        </div>
        <Link href="/contatos/novo">
          <button
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
          >
            <Plus size={14} />
            Novo contato
          </button>
        </Link>
      </div>

      <Suspense>
        <ContactsSearch />
      </Suspense>

      <div
        className="overflow-hidden"
        style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E', borderRadius: '10px' }}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: '#5A5C7E' }}>Nenhum contato encontrado.</p>
            <Link
              href="/contatos/novo"
              className="mt-3 inline-block text-sm underline underline-offset-2"
              style={{ color: '#8B5CF6' }}
            >
              Adicionar primeiro contato
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1F2E', backgroundColor: '#0D0E16' }}>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4A4B6A' }}>Nome</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4A4B6A' }}>Serviço</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4A4B6A' }}>Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4A4B6A' }}>Último contato</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4A4B6A' }}>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid #181926' }}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/contatos/${contact.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2"
                      style={{ color: '#E8E9F4' }}
                    >
                      {contact.name}
                    </Link>
                    {contact.phone && (
                      <p className="text-xs mt-0.5" style={{ color: '#5A5C7E' }}>{contact.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#7273A0' }}>
                    {contact.service ? SERVICE_LABELS[contact.service] : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#5A5C7E' }}>
                    {contact.last_contact_at
                      ? formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true, locale: ptBR })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#5A5C7E' }}>
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
