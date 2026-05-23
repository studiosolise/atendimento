'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
      <div className="px-5 py-3 border-b border-[#E5E4E0]">
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-[#888] hover:text-[#1A1A18] transition-colors"
        >
          + Registrar interação
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-b border-[#E5E4E0] space-y-3">
      <div className="flex gap-2">
        {TYPES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              type === key
                ? 'bg-[#1A1A18] text-white'
                : 'bg-[#F0EFE9] text-[#555] hover:bg-[#E5E4E0]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Descreva a interação..."
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading || !content.trim()}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setContent('') }}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
