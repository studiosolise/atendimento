'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/crm/status-badge'
import { SERVICE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { Contact, LeadStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FLAGS_MAP } from '@/lib/flags'

const STATUSES = Object.entries(STATUS_LABELS) as [LeadStatus, string][]

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return `https://wa.me/${digits}`
  return `https://wa.me/55${digits}`
}

const WA_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.073 23.445a.75.75 0 00.92.92l5.704-1.447A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.699-.502-5.253-1.38l-.374-.214-3.886.986.997-3.77-.23-.389A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
)

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [statusAction, setStatusAction] = useState<LeadStatus | ''>('')

  const allSelected = contacts.length > 0 && selected.size === contacts.length
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(contacts.map(c => c.id)))
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
    setStatusAction('')
  }

  async function handleDelete() {
    if (!selected.size) return
    const n = selected.size
    if (!confirm(`Excluir ${n} contato${n > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`)) return
    setLoading(true)
    await fetch('/api/contatos/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected] }),
    })
    setLoading(false)
    clearSelection()
    router.refresh()
  }

  async function handleStatusChange() {
    if (!selected.size || !statusAction) return
    setLoading(true)
    await fetch('/api/contatos/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], updates: { status: statusAction } }),
    })
    setLoading(false)
    clearSelection()
    router.refresh()
  }

  if (contacts.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum contato encontrado.</p>
        <Link
          href="/contatos/novo"
          className="mt-3 inline-block text-sm underline underline-offset-2"
          style={{ color: '#1A1A18' }}
        >
          Adicionar primeiro contato
        </Link>
      </div>
    )
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid #E5E5E8', backgroundColor: '#FAFAFA' }}>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                style={{ accentColor: '#1A1A18', width: '15px', height: '15px', cursor: 'pointer' }}
              />
            </th>
            <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Nome</th>
            <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Serviço</th>
            <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Status</th>
            <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Último contato</th>
            <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AAAAAA' }}>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const isSelected = selected.has(contact.id)
            return (
              <tr
                key={contact.id}
                style={{
                  borderBottom: '1px solid #F5F5F5',
                  backgroundColor: isSelected ? '#F5F3FF' : undefined,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(contact.id)}
                    style={{ accentColor: '#1A1A18', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/contatos/${contact.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2"
                      style={{ color: '#1A1A18' }}
                    >
                      {contact.name}
                    </Link>
                    {contact.flags?.map(f => {
                      const flag = FLAGS_MAP[f as keyof typeof FLAGS_MAP]
                      if (!flag) return null
                      return (
                        <span
                          key={f}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap"
                          style={{ backgroundColor: flag.bg, color: flag.color, border: `1px solid ${flag.border}` }}
                        >
                          {flag.label}
                        </span>
                      )
                    })}
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs" style={{ color: '#AAAAAA' }}>{contact.phone}</p>
                      <a
                        href={toWhatsAppUrl(contact.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no WhatsApp"
                        className="hover:opacity-70 transition-opacity"
                      >
                        {WA_ICON}
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3.5 text-sm" style={{ color: '#888888' }}>
                  {contact.service ? SERVICE_LABELS[contact.service] : '—'}
                </td>
                <td className="px-3 py-3.5">
                  <StatusBadge status={contact.status} />
                </td>
                <td className="px-3 py-3.5 text-sm" style={{ color: '#AAAAAA' }}>
                  {contact.last_contact_at
                    ? formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true, locale: ptBR })
                    : '—'}
                </td>
                <td className="px-3 py-3.5 text-sm" style={{ color: '#AAAAAA' }}>
                  {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: ptBR })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Barra de ações flutuante */}
      {someSelected && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{ backgroundColor: '#1A1A18', border: '1px solid #2A2A28', minWidth: '420px' }}
        >
          {/* Contagem */}
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#FFFFFF' }}>
            {selected.size} selecionado{selected.size > 1 ? 's' : ''}
          </span>

          <div className="w-px h-4 shrink-0" style={{ backgroundColor: '#3A3A38' }} />

          {/* Mudar status */}
          <div className="flex items-center gap-2">
            <select
              value={statusAction}
              onChange={e => setStatusAction(e.target.value as LeadStatus | '')}
              className="text-xs rounded-lg h-7 px-2 focus:outline-none"
              style={{ backgroundColor: '#2A2A28', color: '#CCCCCC', border: '1px solid #3A3A38' }}
            >
              <option value="">Mudar status...</option>
              {STATUSES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {statusAction && (
              <button
                onClick={handleStatusChange}
                disabled={loading}
                className="text-xs h-7 px-3 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
                style={{ backgroundColor: '#5B21B6', color: '#FFFFFF' }}
              >
                {loading ? '...' : 'Aplicar'}
              </button>
            )}
          </div>

          <div className="w-px h-4 shrink-0" style={{ backgroundColor: '#3A3A38' }} />

          {/* Excluir */}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs h-7 px-3 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
            style={{ backgroundColor: 'rgba(127,29,29,0.6)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}
          >
            <Trash2 size={11} />
            Excluir
          </button>

          <div className="w-px h-4 shrink-0" style={{ backgroundColor: '#3A3A38' }} />

          {/* Cancelar */}
          <button
            onClick={clearSelection}
            className="text-xs h-7 px-2 rounded-lg transition-all hover:opacity-70 whitespace-nowrap"
            style={{ color: '#777777' }}
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  )
}
