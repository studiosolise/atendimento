import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants'
import { LeadStatus, ProjectStatus } from '@/types'
import Link from 'next/link'
import { isToday, isPast } from 'date-fns'

const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8', borderRadius: '10px' }
const labelStyle = { color: '#AAAAAA', letterSpacing: '0.14em' }

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
        <p className="text-[10px] font-semibold uppercase mb-1" style={labelStyle}>Visão geral</p>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>Dashboard</h1>
      </div>

      <p className="text-[10px] font-semibold uppercase mb-3" style={labelStyle}>Leads</p>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-5" style={card}>
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Total de leads</p>
          <p className="text-3xl font-semibold" style={{ color: '#1A1A18' }}>{total}</p>
        </div>
        <div className="p-5" style={card}>
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Em aberto</p>
          <p className="text-3xl font-semibold" style={{ color: '#1A1A18' }}>{ativos}</p>
        </div>
        <div className="p-5" style={card}>
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Fechados</p>
          <p className="text-3xl font-semibold" style={{ color: '#059669' }}>{fechados}</p>
        </div>
        <Link
          href="/followups"
          className="p-5 block transition-all group"
          style={{ ...card, ...(followupsHoje > 0 ? { borderColor: '#FCA5A5' } : {}) }}
        >
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Follow-ups hoje</p>
          <p className="text-3xl font-semibold" style={{ color: followupsHoje > 0 ? '#DC2626' : '#E5E5E8' }}>
            {followupsHoje}
          </p>
          {followupsHoje > 0 && (
            <p className="text-[10px] mt-1.5 transition-colors group-hover:text-[#1A1A18]" style={{ color: '#AAAAAA' }}>
              Ver agenda →
            </p>
          )}
        </Link>
      </div>

      <p className="text-[10px] font-semibold uppercase mb-3" style={labelStyle}>Projetos</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/projetos" className="p-5 block transition-all group" style={card}>
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Em andamento</p>
          <p className="text-3xl font-semibold" style={{ color: projetosAtivos > 0 ? '#1A1A18' : '#E5E5E8' }}>
            {projetosAtivos}
          </p>
          {projetosAtivos > 0 && (
            <p className="text-[10px] mt-1.5 transition-colors group-hover:text-[#1A1A18]" style={{ color: '#AAAAAA' }}>
              Ver projetos →
            </p>
          )}
        </Link>
        <div className="p-5" style={card}>
          <p className="text-xs mb-2" style={{ color: '#AAAAAA' }}>Faturamento previsto</p>
          <p className="text-2xl font-semibold" style={{ color: faturamentoPrevisto > 0 ? '#1A1A18' : '#E5E5E8' }}>
            {faturamentoPrevisto > 0
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoPrevisto)
              : 'R$ 0'}
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#CCCCCC' }}>projetos ativos com valor definido</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-5" style={card}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#1A1A18' }}>Leads por etapa</p>
          {byStatus.length === 0 ? (
            <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum lead cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-36 truncate" style={{ color: '#666666' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F1F3' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#1A1A18', width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium w-5 text-right" style={{ color: '#1A1A18' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5" style={card}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#1A1A18' }}>Projetos por etapa</p>
          {projectsByStatus.length === 0 ? (
            <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum projeto ainda.</p>
          ) : (
            <div className="space-y-3">
              {projectsByStatus.map(({ key, label, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-36 truncate" style={{ color: '#666666' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F1F3' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#1A1A18', width: (projects?.length ?? 0) ? `${(count / (projects?.length ?? 1)) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium w-5 text-right" style={{ color: '#1A1A18' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
