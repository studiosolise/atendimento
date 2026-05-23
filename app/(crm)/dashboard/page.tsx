import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS } from '@/lib/constants'
import { LeadStatus } from '@/types'
import Link from 'next/link'
import { isToday, isPast } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, status, created_at, last_contact_at')

  const { data: followupsPendentes } = await supabase
    .from('followups')
    .select('id, scheduled_for')
    .eq('done', false)

  const followupsHoje = (followupsPendentes ?? []).filter(f =>
    isToday(new Date(f.scheduled_for)) || isPast(new Date(f.scheduled_for))
  ).length

  const total = contacts?.length ?? 0
  const fechados = contacts?.filter(c => c.status === 'fechado').length ?? 0
  const ativos = contacts?.filter(c =>
    !['fechado', 'perdido', 'frio'].includes(c.status)
  ).length ?? 0

  const byStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key: key as LeadStatus,
    label,
    count: contacts?.filter(c => c.status === key).length ?? 0,
  })).filter(s => s.count > 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Visão geral</p>
        <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-xs text-[#888] mb-1">Total de leads</p>
          <p className="text-3xl font-semibold text-[#1A1A18]">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-xs text-[#888] mb-1">Em aberto</p>
          <p className="text-3xl font-semibold text-[#1A1A18]">{ativos}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-xs text-[#888] mb-1">Fechados</p>
          <p className="text-3xl font-semibold text-[#1A1A18]">{fechados}</p>
        </div>
        <Link href="/followups" className="bg-white rounded-lg border border-[#E5E4E0] p-5 hover:border-[#C8C7C0] transition-colors group">
          <p className="text-xs text-[#888] mb-1">Follow-ups pendentes</p>
          <p className={`text-3xl font-semibold ${followupsHoje > 0 ? 'text-[#1A1A18]' : 'text-[#C8C7C0]'}`}>
            {followupsHoje}
          </p>
          {followupsHoje > 0 && (
            <p className="text-[10px] text-[#888] mt-1 group-hover:text-[#1A1A18] transition-colors">Ver agenda →</p>
          )}
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
        <p className="text-sm font-semibold text-[#1A1A18] mb-4">Leads por etapa</p>
        {byStatus.length === 0 ? (
          <p className="text-sm text-[#888]">Nenhum lead cadastrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {byStatus.map(({ key, label, count }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-[#555] w-40">{label}</span>
                <div className="flex-1 h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A1A18] rounded-full"
                    style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-[#1A1A18] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
