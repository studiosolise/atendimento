import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

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
      email: c.email?.trim().toLowerCase() || null,
      company: c.company?.trim() || null,
      instagram: c.instagram?.trim() || null,
      notes: c.notes?.trim() || null,
      status: 'novo_lead' as const,
      source: 'outro' as const,
    }))

  if (!rows.length) {
    return NextResponse.json({ error: 'Nenhum contato com nome válido' }, { status: 400 })
  }

  // Busca contatos existentes para deduplicar
  const { data: existing } = await supabase
    .from('contacts')
    .select('name, phone, email')

  const existingPhones = new Set(
    (existing ?? []).map(c => c.phone ? normalizePhone(c.phone) : '').filter(Boolean)
  )
  const existingEmails = new Set(
    (existing ?? []).map(c => c.email?.toLowerCase() ?? '').filter(Boolean)
  )
  const existingNames = new Set(
    (existing ?? []).map(c => normalizeName(c.name))
  )

  const toInsert = []
  const skipped = []

  for (const row of rows) {
    const phone = row.phone ? normalizePhone(row.phone) : ''
    const email = row.email ?? ''
    const name = normalizeName(row.name)

    const isDuplicate =
      (phone && existingPhones.has(phone)) ||
      (email && existingEmails.has(email)) ||
      existingNames.has(name)

    if (isDuplicate) {
      skipped.push(row.name)
    } else {
      toInsert.push(row)
      // Adiciona ao set para evitar duplicatas dentro do próprio CSV
      if (phone) existingPhones.add(phone)
      if (email) existingEmails.add(email)
      existingNames.add(name)
    }
  }

  if (!toInsert.length) {
    return NextResponse.json({ imported: 0, skipped: skipped.length })
  }

  const { data, error } = await supabase.from('contacts').insert(toInsert).select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    imported: data?.length ?? 0,
    skipped: skipped.length,
  })
}
