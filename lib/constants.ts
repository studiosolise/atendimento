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
  contato_feito: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  qualificado: 'bg-purple-50 text-purple-700 border-purple-200',
  proposta_enviada: 'bg-orange-50 text-orange-700 border-orange-200',
  negociacao: 'bg-amber-50 text-amber-700 border-amber-200',
  fechado: 'bg-green-50 text-green-700 border-green-200',
  perdido: 'bg-red-50 text-red-700 border-red-200',
  frio: 'bg-slate-50 text-slate-500 border-slate-200',
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
  contrato: 'bg-slate-50 text-slate-600 border-slate-200',
  briefing: 'bg-blue-50 text-blue-700 border-blue-200',
  alinhamento: 'bg-purple-50 text-purple-700 border-purple-200',
  desenvolvimento: 'bg-yellow-50 text-yellow-700 border-yellow-200',
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
