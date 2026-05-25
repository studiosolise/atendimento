import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { contacts } = body as {
    contacts: Array<{
      name: string
      phone?: string
      email?: string
      company?: string
      instagram?: string
      notes?: string
    }>
  }

  if (!contacts?.length) {
    return NextResponse.json({ error: 'Nenhum contato para importar' }, { status: 400 })
  }

  const rows = contacts
    .filter(c => c.name?.trim())
    .map(c => ({
      name: c.name.trim(),
      phone: c.phone?.trim() || null,
      email: c.email?.trim() || null,
      company: c.company?.trim() || null,
      instagram: c.instagram?.trim() || null,
      notes: c.notes?.trim() || null,
      status: 'novo_lead' as const,
      source: 'outro' as const,
    }))

  if (!rows.length) {
    return NextResponse.json({ error: 'Nenhum contato com nome válido' }, { status: 400 })
  }

  const { data, error } = await supabase.from('contacts').insert(rows).select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ imported: data?.length ?? 0 })
}
