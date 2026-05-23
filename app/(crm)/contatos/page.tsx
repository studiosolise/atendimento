import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
          <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Gestão</p>
          <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Contatos</h1>
        </div>
        <Link href="/contatos/novo">
          <Button size="sm" className="gap-2">
            <Plus size={14} />
            Novo contato
          </Button>
        </Link>
      </div>

      <Suspense>
        <ContactsSearch />
      </Suspense>

      <div className="bg-white rounded-lg border border-[#E5E4E0] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#888]">Nenhum contato encontrado.</p>
            <Link href="/contatos/novo" className="mt-3 inline-block text-sm text-[#1A1A18] underline underline-offset-2">
              Adicionar primeiro contato
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E4E0] bg-[#FAFAF8]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Serviço</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Último contato</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact, i) => (
                <tr
                  key={contact.id}
                  className={`border-b border-[#F0EFE9] last:border-0 hover:bg-[#FAFAF8] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FDFDFC]'}`}
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/contatos/${contact.id}`} className="font-medium text-[#1A1A18] hover:underline underline-offset-2 text-sm">
                      {contact.name}
                    </Link>
                    {contact.phone && <p className="text-xs text-[#888] mt-0.5">{contact.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#555]">
                    {contact.service ? SERVICE_LABELS[contact.service] : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#888]">
                    {contact.last_contact_at
                      ? formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true, locale: ptBR })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#888]">
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
