import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ContactsSearch } from '@/components/crm/contacts-search'
import { ImportCSVButton } from './import-csv-button'
import { ContactsTable } from './contacts-table'
import { Contact } from '@/types'
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
        <ContactsTable contacts={filtered} />
      </div>
    </div>
  )
}
