import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants'
import { LeadStatus, ProjectStatus } from '@/types'
import Link from 'next/link'
import { isToday, isPast } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: contacts },
    { data: followupsPendentes },
    { data: projects },
  ] = await Promise.all([
    supabase.from('contacts').select('id, status, created_at, last_contact_at'),
    supabase.from('followups').select('id, scheduled_for').eq('done', false),
    supabase.from('projects').select('id, status, value'),
  ])

  const followupsHoje = (followupsPendentes ?? []).filter(f =>
    isToday(new Date(f.scheduled_for)) || isPast(new Date(f.scheduled_for))
  ).length

  const total = contacts?.length ?? 0
  const fechados = contacts?.filter(c => c.status === 'fechado').length ?? 0
  const ativos = contacts?.filter(c =>
    !['fechado', 'perdido', 'frio'].includes(c.status)
  ).length ?? 0

  const projetosAtivos = (projects ?? []).filter(p => p.status !== 'entregue').length
  const faturamentoPrevisto = (projects ?? [])
    .filter(p => p.status !== 'entregue' && p.value)
    .reduce((sum, p) => sum + (p.value ?? 0), 0)

  const byStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key: key as LeadStatus,
    label,
    count: contacts?.filter(c => c.status === key).length ?? 0,
  })).filter(s => s.count > 0)

  const projectsByStatus = Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => ({
    key: key as ProjectStatus,
    label,
    count: (projects ?? []).filter(p => p.status === key).length,
  })).filter(s => s.count > 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Visão geral</p>
        <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Dashboard</h1>
      </div>

      {/* Cards de leads */}
      <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Leads</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
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

      {/* Cards de projetos */}
      <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Projetos</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/projetos" className="bg-white rounded-lg border border-[#E5E4E0] p-5 hover:border-[#C8C7C0] transition-colors group">
          <p className="text-xs text-[#888] mb-1">Em andamento</p>
          <p className={`text-3xl font-semibold ${projetosAtivos > 0 ? 'text-[#1A1A18]' : 'text-[#C8C7C0]'}`}>
            {projetosAtivos}
          </p>
          {projetosAtivos > 0 && (
            <p className="text-[10px] text-[#888] mt-1 group-hover:text-[#1A1A18] transition-colors">Ver projetos →</p>
          )}
        </Link>
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-xs text-[#888] mb-1">Faturamento previsto</p>
          <p className={`text-2xl font-semibold ${faturamentoPrevisto > 0 ? 'text-[#1A1A18]' : 'text-[#C8C7C0]'}`}>
            {faturamentoPrevisto > 0
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoPrevisto)
              : 'R$ 0'}
          </p>
          <p className="text-[10px] text-[#aaa] mt-1">projetos ativos com valor definido</p>
        </div>
      </div>

      {/* Distribuição por etapa */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-sm font-semibold text-[#1A1A18] mb-4">Leads por etapa</p>
          {byStatus.length === 0 ? (
            <p className="text-sm text-[#888]">Nenhum lead cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {byStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-[#555] w-36 truncate">{label}</span>
                  <div className="flex-1 h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A1A18] rounded-full"
                      style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1A1A18] w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
          <p className="text-sm font-semibold text-[#1A1A18] mb-4">Projetos por etapa</p>
          {projectsByStatus.length === 0 ? (
            <p className="text-sm text-[#888]">Nenhum projeto ainda.</p>
          ) : (
            <div className="space-y-2">
              {projectsByStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-[#555] w-36 truncate">{label}</span>
                  <div className="flex-1 h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A1A18] rounded-full"
                      style={{ width: (projects?.length ?? 0) ? `${(count / (projects?.length ?? 1)) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1A1A18] w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
