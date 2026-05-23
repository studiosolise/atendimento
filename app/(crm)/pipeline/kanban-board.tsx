'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PIPELINE_COLUMNS, STATUS_LABELS, PIPELINE_COLUMN_COLORS, SERVICE_LABELS } from '@/lib/constants'
import { Contact, LeadStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function KanbanBoard({ initialGrouped }: { initialGrouped: Record<LeadStatus, Contact[]> }) {
  const [grouped, setGrouped] = useState(initialGrouped)
  const [dragging, setDragging] = useState<Contact | null>(null)
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null)
  const supabase = createClient()

  function onDragStart(contact: Contact) {
    setDragging(contact)
  }

  function onDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault()
    setDragOver(status)
  }

  async function onDrop(status: LeadStatus) {
    if (!dragging || dragging.status === status) {
      setDragging(null)
      setDragOver(null)
      return
    }

    const updated = { ...grouped }
    updated[dragging.status] = updated[dragging.status].filter(c => c.id !== dragging.id)
    const updatedContact = { ...dragging, status }
    updated[status] = [updatedContact, ...updated[status]]
    setGrouped(updated)

    await supabase.from('contacts').update({
      status,
      updated_at: new Date().toISOString(),
    }).eq('id', dragging.id)

    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map(status => {
        const cards = grouped[status] ?? []
        const isOver = dragOver === status
        const colors = PIPELINE_COLUMN_COLORS[status]

        return (
          <div
            key={status}
            className={cn('flex-shrink-0 w-56 rounded-xl transition-all', isOver ? 'scale-[1.01]' : '')}
            style={{
              backgroundColor: isOver
                ? colors.bgColor.replace(/[\d.]+\)$/, '0.14)')
                : colors.bgColor,
              border: `1px solid ${colors.borderColor}`,
            }}
            onDragOver={e => onDragOver(e, status)}
            onDrop={() => onDrop(status)}
            onDragLeave={() => setDragOver(null)}
          >
            {/* Column header */}
            <div className="px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.dotColor }}
                />
                <span className={cn('text-xs font-semibold', colors.text)}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold rounded-md px-1.5 py-0.5"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: colors.dotColor,
                }}
              >
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="px-2 pb-2 space-y-2 min-h-[100px]">
              {cards.map(contact => (
                <div
                  key={contact.id}
                  draggable
                  onDragStart={() => onDragStart(contact)}
                  className="rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-all"
                  style={{
                    backgroundColor: '#111218',
                    border: '1px solid #1E1F2E',
                    opacity: dragging?.id === contact.id ? 0.35 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = colors.borderColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E1F2E')}
                >
                  <Link href={`/contatos/${contact.id}`} onClick={e => e.stopPropagation()}>
                    <p
                      className="text-sm font-medium hover:underline underline-offset-1 leading-tight"
                      style={{ color: '#E8E9F4' }}
                    >
                      {contact.name}
                    </p>
                  </Link>
                  {contact.service && (
                    <p className="text-xs mt-1" style={{ color: '#5A5C7E' }}>
                      {SERVICE_LABELS[contact.service]}
                    </p>
                  )}
                  {contact.last_contact_at && (
                    <p className="text-[11px] mt-1.5" style={{ color: '#3A3C55' }}>
                      {formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
