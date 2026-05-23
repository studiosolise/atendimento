import { createClient } from '@/lib/supabase/server'
import { isToday, isPast, isFuture, addDays, startOfDay } from 'date-fns'
import { Followup } from '@/types'
import { FollowupsAgenda } from './followups-agenda'

interface FollowupComContato extends Followup {
  contacts: { id: string; name: string; status: string } | null
}

export default async function FollowupsPage() {
  const supabase = await createClient()

  const { data: followups } = await supabase
    .from('followups')
    .select('*, contacts(id, name, status)')
    .eq('done', false)
    .order('scheduled_for', { ascending: true }) as { data: FollowupComContato[] | null }

  const hoje = startOfDay(new Date())
  const em7dias = addDays(hoje, 7)

  const vencidos = (followups ?? []).filter(f => isPast(new Date(f.scheduled_for)) && !isToday(new Date(f.scheduled_for)))
  const deHoje = (followups ?? []).filter(f => isToday(new Date(f.scheduled_for)))
  const proximos = (followups ?? []).filter(f => isFuture(new Date(f.scheduled_for)) && new Date(f.scheduled_for) <= em7dias)
  const depois = (followups ?? []).filter(f => new Date(f.scheduled_for) > em7dias)

  const totalPendente = (followups ?? []).length

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#AAAAAA', letterSpacing: '0.14em' }}>
          Agenda
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>Follow-ups</h1>
          {totalPendente > 0 && (
            <span className="text-sm" style={{ color: '#AAAAAA' }}>
              {totalPendente} pendente{totalPendente > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {totalPendente === 0 ? (
        <div
          className="p-8 text-center rounded-xl"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
        >
          <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum follow-up pendente.</p>
          <p className="text-xs mt-1" style={{ color: '#CCCCCC' }}>
            Acesse um contato para criar um roteiro de follow-up.
          </p>
        </div>
      ) : (
        <FollowupsAgenda
          vencidos={vencidos}
          deHoje={deHoje}
          proximos={proximos}
          depois={depois}
        />
      )}
    </div>
  )
}
