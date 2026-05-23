import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants'
import { LeadStatus, ProjectStatus } from '@/types'
import Link from 'next/link'
import { isToday, isPast } from 'date-fns'

const S = {
  page: { color: '#E8E9F4' },
  label: { color: '#4A4B6A', letterSpacing: '0.14em' },
  card: { backgroundColor: '#111218', border: '1px solid #1E1F2E', borderRadius: '10px' },
  cardValue: { color: '#E8E9F4' },
  cardLabel: { color: '#5A5C7E' },
  barBg: { backgroundColor: '#1A1B2E' },
  barFill: { background: 'linear-gradient(90deg, #5B21B6, #7C3AED)' },
}

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
        <p className="text-[10px] font-semibold uppercase mb-1" style={S.label}>Visão geral</p>
        <h1 className="text-2xl font-semibold tracking-tight" style={S.page}>Dashboard</h1>
      </div>

      <p className="text-[10px] font-semibold uppercase mb-3" style={S.label}>Leads</p>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-5" style={S.card}>
          <p className="text-xs mb-2" style={S.cardLabel}>Total de leads</p>
          <p className="text-3xl font-semibold" style={S.cardValue}>{total}</p>
        </div>
        <div className="p-5" style={S.card}>
          <p className="text-xs mb-2" style={S.cardLabel}>Em aberto</p>
          <p className="text-3xl font-semibold" style={S.cardValue}>{ativos}</p>
        </div>
        <div className="p-5" style={S.card}>
          <p className="text-xs mb-2" style={S.cardLabel}>Fechados</p>
          <p className="text-3xl font-semibold" style={{ color: '#34D399' }}>{fechados}</p>
        </div>
        <Link
          href="/followups"
          className="p-5 block transition-all group"
          style={{ ...S.card, ...(followupsHoje > 0 ? { borderColor: 'rgba(249,115,22,0.4)' } : {}) }}
        >
          <p className="text-xs mb-2" style={S.cardLabel}>Follow-ups hoje</p>
          <p className="text-3xl font-semibold" style={{ color: followupsHoje > 0 ? '#FB923C' : '#2A2B3E' }}>
            {followupsHoje}
          </p>
          {followupsHoje > 0 && (
            <p className="text-[10px] mt-1.5 transition-colors group-hover:text-white" style={{ color: '#5A5C7E' }}>
              Ver agenda →
            </p>
          )}
        </Link>
      </div>

      <p className="text-[10px] font-semibold uppercase mb-3" style={S.label}>Projetos</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/projetos"
          className="p-5 block transition-all group"
          style={S.card}
        >
          <p className="text-xs mb-2" style={S.cardLabel}>Em andamento</p>
          <p className="text-3xl font-semibold" style={{ color: projetosAtivos > 0 ? '#A78BFA' : '#2A2B3E' }}>
            {projetosAtivos}
          </p>
          {projetosAtivos > 0 && (
            <p className="text-[10px] mt-1.5 transition-colors group-hover:text-white" style={{ color: '#5A5C7E' }}>
              Ver projetos →
            </p>
          )}
        </Link>
        <div className="p-5" style={S.card}>
          <p className="text-xs mb-2" style={S.cardLabel}>Faturamento previsto</p>
          <p className="text-2xl font-semibold" style={{ color: faturamentoPrevisto > 0 ? '#34D399' : '#2A2B3E' }}>
            {faturamentoPrevisto > 0
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoPrevisto)
              : 'R$ 0'}
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#3A3C55' }}>projetos ativos com valor definido</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-5" style={S.card}>
          <p className="text-sm font-semibold mb-4" style={S.page}>Leads por etapa</p>
          {byStatus.length === 0 ? (
            <p className="text-sm" style={S.cardLabel}>Nenhum lead cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-36 truncate" style={{ color: '#7273A0' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={S.barBg}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ ...S.barFill, width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium w-5 text-right" style={S.cardValue}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5" style={S.card}>
          <p className="text-sm font-semibold mb-4" style={S.page}>Projetos por etapa</p>
          {projectsByStatus.length === 0 ? (
            <p className="text-sm" style={S.cardLabel}>Nenhum projeto ainda.</p>
          ) : (
            <div className="space-y-3">
              {projectsByStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-36 truncate" style={{ color: '#7273A0' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={S.barBg}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ ...S.barFill, width: (projects?.length ?? 0) ? `${(count / (projects?.length ?? 1)) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium w-5 text-right" style={S.cardValue}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
