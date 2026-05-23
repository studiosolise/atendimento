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
  novo_lead: 'bg-blue-50 text-blue-700 border-blue-200',
  contato_feito: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  qualificado: 'bg-violet-50 text-violet-700 border-violet-200',
  proposta_enviada: 'bg-orange-50 text-orange-700 border-orange-200',
  negociacao: 'bg-amber-50 text-amber-700 border-amber-200',
  fechado: 'bg-green-50 text-green-700 border-green-200',
  perdido: 'bg-red-50 text-red-700 border-red-200',
  frio: 'bg-gray-100 text-gray-500 border-gray-200',
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
  novo_lead:        { text: 'text-blue-700',    dotColor: '#3B82F6', bgColor: 'rgba(59,130,246,0.06)',   borderColor: 'rgba(59,130,246,0.18)' },
  contato_feito:    { text: 'text-cyan-700',    dotColor: '#0891B2', bgColor: 'rgba(8,145,178,0.06)',    borderColor: 'rgba(8,145,178,0.18)' },
  qualificado:      { text: 'text-violet-700',  dotColor: '#7C3AED', bgColor: 'rgba(124,58,237,0.05)',   borderColor: 'rgba(124,58,237,0.15)' },
  proposta_enviada: { text: 'text-orange-700',  dotColor: '#EA580C', bgColor: 'rgba(234,88,12,0.06)',    borderColor: 'rgba(234,88,12,0.18)' },
  negociacao:       { text: 'text-amber-700',   dotColor: '#D97706', bgColor: 'rgba(217,119,6,0.06)',    borderColor: 'rgba(217,119,6,0.18)' },
  fechado:          { text: 'text-emerald-700', dotColor: '#059669', bgColor: 'rgba(5,150,105,0.06)',    borderColor: 'rgba(5,150,105,0.18)' },
  perdido:          { text: 'text-red-700',     dotColor: '#DC2626', bgColor: 'rgba(220,38,38,0.06)',    borderColor: 'rgba(220,38,38,0.18)' },
  frio:             { text: 'text-gray-500',    dotColor: '#9CA3AF', bgColor: 'rgba(156,163,175,0.08)',  borderColor: 'rgba(156,163,175,0.2)' },
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
  contrato: 'bg-gray-100 text-gray-600 border-gray-200',
  briefing: 'bg-blue-50 text-blue-700 border-blue-200',
  alinhamento: 'bg-violet-50 text-violet-700 border-violet-200',
  desenvolvimento: 'bg-amber-50 text-amber-700 border-amber-200',
  apresentacao: 'bg-orange-50 text-orange-700 border-orange-200',
  aprovacao: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  entregue: 'bg-green-50 text-green-700 border-green-200',
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
