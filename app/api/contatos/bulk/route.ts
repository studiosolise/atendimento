import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { ids } = await request.json() as { ids: string[] }

  if (!ids?.length) {
    return NextResponse.json({ error: 'Nenhum ID informado' }, { status: 400 })
  }

  const { error } = await supabase.from('contacts').delete().in('id', ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: ids.length })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { ids, updates } = await request.json() as {
    ids: string[]
    updates: { status?: string; service?: string }
  }

  if (!ids?.length || !updates) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const { error } = await supabase.from('contacts').update(updates).in('id', ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: ids.length })
}
