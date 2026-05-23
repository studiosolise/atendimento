'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Contact, Interaction } from '@/types'
import { SERVICE_LABELS } from '@/lib/constants'

type ActionType = 'primeiro_contato' | 'followup_proposta' | 'objecao' | 'encerrar' | 'livre'

const ACTIONS: [ActionType, string][] = [
  ['primeiro_contato', 'Primeiro contato'],
  ['followup_proposta', 'Follow-up pós-proposta'],
  ['objecao', 'Responder objeção'],
  ['encerrar', 'Encerrar ciclo'],
  ['livre', 'Sugerir próximo passo'],
]

interface Props {
  contact: Contact
  interactions: Interaction[]
}

export function AgentePanel({ contact, interactions }: Props) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<ActionType>('primeiro_contato')
  const [contexto, setContexto] = useState('')
  const [sugestao, setSugestao] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    setLoading(true)
    setSugestao('')
    try {
      const res = await fetch('/api/agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          contact: {
            name: contact.name,
            service: contact.service ? SERVICE_LABELS[contact.service] : null,
            status: contact.status,
            notes: contact.notes,
            company: contact.company,
          },
          interactions,
          contexto: contexto.trim() || undefined,
        }),
      })
      const data = await res.json()
      setSugestao(data.sugestao ?? data.error ?? 'Erro desconhecido.')
    } catch {
      setSugestao('Erro ao conectar com o agente.')
    } finally {
      setLoading(false)
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(sugestao)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-white rounded-lg border border-[#E5E4E0] p-4 hover:border-[#C8C7C0] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wider">Vera</span>
          <span className="text-xs text-[#aaa]">Agente de atendimento</span>
        </div>
        <p className="text-xs text-[#888] mt-1 group-hover:text-[#555] transition-colors">
          Gerar sugestão de mensagem →
        </p>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E4E0]">
      <div className="px-4 py-3 border-b border-[#E5E4E0] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wider">Vera</span>
          <span className="text-xs text-[#aaa] ml-2">Agente de atendimento</span>
        </div>
        <button
          onClick={() => { setOpen(false); setSugestao(''); setContexto('') }}
          className="text-xs text-[#aaa] hover:text-[#555]"
        >
          fechar
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-[#888] mb-1.5">Tipo de mensagem</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setAction(key); setSugestao('') }}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  action === key
                    ? 'bg-[#1A1A18] text-white'
                    : 'bg-[#F0EFE9] text-[#555] hover:bg-[#E5E4E0]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={contexto}
            onChange={e => setContexto(e.target.value)}
            placeholder="Contexto adicional (opcional) — ex: cliente mencionou que tem sócio, orçamento apertado..."
            className="w-full min-h-[60px] text-xs rounded border border-[#E5E4E0] bg-[#FAFAF8] px-3 py-2 resize-none text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#888]"
          />
        </div>

        <button
          onClick={gerar}
          disabled={loading}
          className="w-full text-xs font-medium bg-[#1A1A18] text-white py-2 rounded hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Gerando...' : 'Gerar sugestão'}
        </button>

        {sugestao && (
          <div className="rounded border border-[#E5E4E0] bg-[#FAFAF8]">
            <div className="flex items-start justify-between gap-2 p-3">
              <p className="text-sm text-[#1A1A18] whitespace-pre-wrap leading-relaxed">{sugestao}</p>
              <button
                onClick={copiar}
                title={copiado ? 'Copiado!' : 'Copiar'}
                className="shrink-0 mt-0.5 text-[#aaa] hover:text-[#1A1A18] transition-colors"
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
