export type LeadStatus =
  | 'novo_lead'
  | 'contato_feito'
  | 'reuniao'
  | 'qualificado'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado'
  | 'perdido'
  | 'frio'

export type ServiceType =
  | 'identidade_visual'
  | 'identidade_naming'
  | 'naming'
  | 'landing_page'
  | 'site'
  | 'site_blog'
  | 'loja_virtual'
  | 'material_avulso'
  | 'apresentacao'
  | 'outro'

export type LeadSource = 'instagram_ads' | 'whatsapp_direto' | 'indicacao' | 'outro'

export type InteractionType = 'mensagem' | 'nota' | 'proposta' | 'reuniao' | 'email' | 'vera'

export interface Contact {
  id: string
  name: string
  phone: string | null
  email: string | null
  instagram: string | null
  company: string | null
  service: ServiceType | null
  status: LeadStatus
  source: LeadSource | null
  notes: string | null
  flags: string[]
  created_at: string
  updated_at: string
  last_contact_at: string | null
}

export interface Interaction {
  id: string
  contact_id: string
  type: InteractionType
  content: string
  created_at: string
  created_by: string | null
}

export interface Followup {
  id: string
  contact_id: string
  scheduled_for: string
  message_template: string | null
  done: boolean
  created_at: string
}

export type ProjectStatus =
  | 'contrato'
  | 'briefing'
  | 'alinhamento'
  | 'desenvolvimento'
  | 'apresentacao'
  | 'aprovacao'
  | 'entregue'

export interface Project {
  id: string
  contact_id: string | null
  title: string
  service: ServiceType | null
  status: ProjectStatus
  value: number | null
  deadline: string | null
  start_date: string | null
  presentation_date: string | null
  delivery_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
