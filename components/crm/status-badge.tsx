import { LeadStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      STATUS_COLORS[status]
    )}>
      {STATUS_LABELS[status]}
    </span>
  )
}
