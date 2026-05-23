import { LeadStatus, ProjectStatus, ServiceType } from '@/types'

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo_lead: 'Novo Lead',
  contato_feito: 'Contato Feito',
  qualificado: 'Qualificado',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
  frio: 'Frio',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo_lead: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  contato_feito: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  qualificado: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  proposta_enviada: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
  negociacao: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  fechado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  perdido: 'bg-red-500/10 text-red-400 border-red-500/25',
  frio: 'bg-zinc-700/20 text-zinc-500 border-zinc-600/25',
}

export const PIPELINE_COLUMNS: LeadStatus[] = [
  'novo_lead',
  'contato_feito',
  'qualificado',
  'proposta_enviada',
  'negociacao',
  'fechado',
  'perdido',
]

export const PIPELINE_COLUMN_COLORS: Record<LeadStatus, {
  text: string
  dotColor: string
  bgColor: string
  borderColor: string
}> = {
  novo_lead:        { text: 'text-blue-400',    dotColor: '#3B82F6', bgColor: 'rgba(59,130,246,0.07)',   borderColor: 'rgba(59,130,246,0.2)' },
  contato_feito:    { text: 'text-cyan-400',    dotColor: '#06B6D4', bgColor: 'rgba(6,182,212,0.07)',    borderColor: 'rgba(6,182,212,0.2)' },
  qualificado:      { text: 'text-violet-400',  dotColor: '#8B5CF6', bgColor: 'rgba(139,92,246,0.07)',   borderColor: 'rgba(139,92,246,0.2)' },
  proposta_enviada: { text: 'text-orange-400',  dotColor: '#F97316', bgColor: 'rgba(249,115,22,0.07)',   borderColor: 'rgba(249,115,22,0.2)' },
  negociacao:       { text: 'text-amber-400',   dotColor: '#F59E0B', bgColor: 'rgba(245,158,11,0.07)',   borderColor: 'rgba(245,158,11,0.2)' },
  fechado:          { text: 'text-emerald-400', dotColor: '#10B981', bgColor: 'rgba(16,185,129,0.07)',   borderColor: 'rgba(16,185,129,0.2)' },
  perdido:          { text: 'text-red-400',     dotColor: '#EF4444', bgColor: 'rgba(239,68,68,0.07)',    borderColor: 'rgba(239,68,68,0.2)' },
  frio:             { text: 'text-zinc-500',    dotColor: '#71717A', bgColor: 'rgba(113,113,122,0.05)',  borderColor: 'rgba(113,113,122,0.15)' },
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  identidade_visual: 'Identidade Visual',
  identidade_naming: 'Identidade + Naming',
  naming: 'Naming',
  landing_page: 'Landing Page',
  site: 'Site',
  site_blog: 'Site com Blog',
  loja_virtual: 'Loja Virtual',
  material_avulso: 'Material Avulso',
  apresentacao: 'Apresentação',
  outro: 'Outro',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  contrato: 'Contrato',
  briefing: 'Briefing',
  alinhamento: 'Alinhamento',
  desenvolvimento: 'Desenvolvimento',
  apresentacao: 'Apresentação',
  aprovacao: 'Aprovação',
  entregue: 'Entregue',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  contrato: 'bg-zinc-700/20 text-zinc-400 border-zinc-600/25',
  briefing: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  alinhamento: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  desenvolvimento: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  apresentacao: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
  aprovacao: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  entregue: 'bg-green-500/10 text-green-400 border-green-500/25',
}

export const PROJECT_FUNNEL: ProjectStatus[] = [
  'contrato', 'briefing', 'alinhamento', 'desenvolvimento',
  'apresentacao', 'aprovacao', 'entregue',
]

export const SERVICE_PRICES: Record<ServiceType, string> = {
  identidade_visual: 'R$ 1.370',
  identidade_naming: 'R$ 1.970',
  naming: 'R$ 1.370',
  landing_page: 'R$ 1.270',
  site: 'R$ 1.570',
  site_blog: 'R$ 1.870',
  loja_virtual: 'R$ 2.970',
  material_avulso: 'a partir de R$ 130',
  apresentacao: 'a partir de R$ 370',
  outro: '—',
}
