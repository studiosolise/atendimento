import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const contactId = req.nextUrl.searchParams.get('contact_id')

  let query = supabase.from('projects').select('*, contacts(name)').order('created_at', { ascending: false })
  if (contactId) query = query.eq('contact_id', contactId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      contact_id: body.contact_id ?? null,
      title: body.title.trim(),
      service: body.service ?? null,
      status: body.status ?? 'contrato',
      value: body.value ?? null,
      deadline: body.deadline ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
