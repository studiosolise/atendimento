import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addDays, startOfDay } from 'date-fns'

const ROTEIROS = {
  primeiro_contato: [3, 7, 14],
  proposta: [3, 7, 14, 21],
}

const TEMPLATES: Record<string, Record<number, string>> = {
  primeiro_contato: {
    3: 'Follow-up D+3 — tom diferente, mais leve',
    7: 'Follow-up D+7 — ancora em valor (portfólio relevante)',
    14: 'Follow-up D+14 — último contato, encerra ciclo',
  },
  proposta: {
    3: 'Follow-up proposta D+3 — pergunta sobre dúvidas específicas',
    7: 'Follow-up proposta D+7 — ancora em disponibilidade de agenda',
    14: 'Follow-up proposta D+14 — lida com objeção provável',
    21: 'Follow-up proposta D+21 — encerra com elegância, abre porta futura',
  },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  if (body.action === 'criar_roteiro') {
    const { contact_id, roteiro } = body as { contact_id: string; roteiro: 'primeiro_contato' | 'proposta' }

    if (!contact_id || !roteiro || !ROTEIROS[roteiro]) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const base = startOfDay(new Date())
    const inserts = ROTEIROS[roteiro].map(day => ({
      contact_id,
      scheduled_for: addDays(base, day).toISOString(),
      message_template: TEMPLATES[roteiro][day],
      done: false,
    }))

    const { data, error } = await supabase.from('followups').insert(inserts).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ followups: data })
  }

  if (body.action === 'criar_avulso') {
    const { contact_id, scheduled_for, message_template } = body
    if (!contact_id || !scheduled_for) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('followups')
      .insert({ contact_id, scheduled_for, message_template: message_template ?? null, done: false })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ followup: data })
  }

  return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { id, done } = await req.json()

  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

  const { error } = await supabase
    .from('followups')
    .update({ done: done ?? true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { id } = await req.json()

  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

  const { error } = await supabase.from('followups').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
