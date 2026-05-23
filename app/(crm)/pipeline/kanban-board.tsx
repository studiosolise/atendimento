'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PIPELINE_COLUMNS, STATUS_LABELS, STATUS_COLORS, SERVICE_LABELS } from '@/lib/constants'
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

        return (
          <div
            key={status}
            className={cn(
              'flex-shrink-0 w-56 rounded-lg transition-colors',
              isOver ? 'bg-[#E5E4E0]' : 'bg-[#EBEBEA]'
            )}
            onDragOver={e => onDragOver(e, status)}
            onDrop={() => onDrop(status)}
            onDragLeave={() => setDragOver(null)}
          >
            <div className="px-3 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#555]">{STATUS_LABELS[status]}</span>
              <span className="text-xs text-[#aaa] bg-white rounded px-1.5 py-0.5">{cards.length}</span>
            </div>

            <div className="px-2 pb-2 space-y-2 min-h-[120px]">
              {cards.map(contact => (
                <div
                  key={contact.id}
                  draggable
                  onDragStart={() => onDragStart(contact)}
                  className={cn(
                    'bg-white rounded-md border border-[#E5E4E0] p-3 cursor-grab active:cursor-grabbing select-none transition-opacity',
                    dragging?.id === contact.id ? 'opacity-40' : ''
                  )}
                >
                  <Link href={`/contatos/${contact.id}`} onClick={e => e.stopPropagation()}>
                    <p className="text-sm font-medium text-[#1A1A18] hover:underline underline-offset-1 leading-tight">
                      {contact.name}
                    </p>
                  </Link>
                  {contact.service && (
                    <p className="text-xs text-[#888] mt-1">{SERVICE_LABELS[contact.service]}</p>
                  )}
                  {contact.last_contact_at && (
                    <p className="text-xs text-[#aaa] mt-1.5">
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
