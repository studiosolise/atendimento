'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InteractionType } from '@/types'

const TYPES: [InteractionType, string][] = [
  ['mensagem', 'Mensagem'],
  ['nota', 'Nota'],
  ['proposta', 'Proposta'],
  ['reuniao', 'Reunião'],
  ['email', 'E-mail'],
]

export function InteractionForm({ contactId }: { contactId: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<InteractionType>('mensagem')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (!content.trim()) return
    setLoading(true)

    await supabase.from('interactions').insert({
      contact_id: contactId,
      type,
      content: content.trim(),
    })

    await supabase.from('contacts').update({
      last_contact_at: new Date().toISOString(),
    }).eq('id', contactId)

    setContent('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
        <button
          onClick={() => setOpen(true)}
          className="text-sm transition-colors hover:opacity-60"
          style={{ color: '#AAAAAA' }}
        >
          + Registrar interação
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
            style={type === key ? {
              backgroundColor: '#1A1A18',
              color: '#FFFFFF',
            } : {
              backgroundColor: '#F1F1F3',
              color: '#666666',
              border: '1px solid #E5E5E8',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Descreva a interação..."
        className="w-full min-h-[80px] rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none transition-colors bg-white"
        style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
        onFocus={e => (e.target.style.borderColor = '#1A1A18')}
        onBlur={e => (e.target.style.borderColor = '#E5E5E8')}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading || !content.trim()}
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-40 hover:opacity-80"
          style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={() => { setOpen(false); setContent('') }}
          className="h-8 px-4 rounded-lg text-xs transition-all hover:bg-[#F1F1F3]"
          style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
