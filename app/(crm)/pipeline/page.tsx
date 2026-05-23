import { createClient } from '@/lib/supabase/server'
import { PIPELINE_COLUMNS, STATUS_LABELS, SERVICE_LABELS } from '@/lib/constants'
import { Contact, LeadStatus } from '@/types'
import { KanbanBoard } from './kanban-board'

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .in('status', PIPELINE_COLUMNS)
    .order('created_at', { ascending: false }) as { data: Contact[] | null }

  const grouped = PIPELINE_COLUMNS.reduce((acc, status) => {
    acc[status] = contacts?.filter(c => c.status === status) ?? []
    return acc
  }, {} as Record<LeadStatus, Contact[]>)

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Funil</p>
        <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Pipeline</h1>
      </div>

      <KanbanBoard initialGrouped={grouped} />
    </div>
  )
}
