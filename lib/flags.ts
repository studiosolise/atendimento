export type FlagId = 'reuniao' | 'enviar_contrato' | 'aguardando_pagamento' | 'urgente'

export const FLAGS: { id: FlagId; label: string; color: string; bg: string; border: string }[] = [
  { id: 'reuniao',              label: 'Reunião agendada',     color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'enviar_contrato',      label: 'Enviar contrato',      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { id: 'aguardando_pagamento', label: 'Aguardando pagamento', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  { id: 'urgente',              label: 'Urgente',              color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
]

export const FLAGS_MAP = Object.fromEntries(FLAGS.map(f => [f.id, f])) as Record<FlagId, typeof FLAGS[0]>
