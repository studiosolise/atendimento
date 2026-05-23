'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
import { Contact, Interaction } from '@/types'
import { SERVICE_LABELS } from '@/lib/constants'

type ActionType = 'primeiro_contato' | 'followup_proposta' | 'objecao' | 'encerrar' | 'livre'

const ACTIONS: [ActionType, string][] = [
  ['primeiro_contato', 'Primeiro contato'],
  ['followup_proposta', 'Follow-up pós-proposta'],
  ['objecao', 'Responder objeção'],
  ['encerrar', 'Encerrar ciclo'],
  ['livre', 'Próximo passo'],
]

interface Props {
  contact: Contact
  interactions: Interaction[]
}

export function AgentePanel({ contact, interactions }: Props) {
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

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1A1A18' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Sparkles size={14} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-wide" style={{ color: '#FFFFFF' }}>Vera</span>
            <span className="text-xs ml-2" style={{ color: '#888888' }}>Agente de atendimento</span>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#888888' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          ativa
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Action pills */}
        <div>
          <p className="text-[10px] font-medium uppercase mb-2.5" style={{ color: '#555555', letterSpacing: '0.12em' }}>
            Tipo de mensagem
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setAction(key); setSugestao('') }}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={action === key ? {
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A18',
                } : {
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#888888',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea + button */}
        <div className="flex gap-3 items-start">
          <textarea
            value={contexto}
            onChange={e => setContexto(e.target.value)}
            placeholder="Contexto adicional — ex: cliente mencionou sócio, orçamento apertado, prazo urgente..."
            className="flex-1 min-h-[72px] text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E8E8E4',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
          <button
            onClick={gerar}
            disabled={loading}
            className="flex-shrink-0 h-10 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 whitespace-nowrap"
            style={{ backgroundColor: '#FFFFFF', color: '#1A1A18' }}
          >
            {loading ? 'Gerando...' : 'Gerar →'}
          </button>
        </div>

        {/* Response */}
        {sugestao && (
          <div
            className="rounded-lg"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-start justify-between gap-3 p-4">
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap flex-1"
                style={{ color: '#E8E8E4' }}
              >
                {sugestao}
              </p>
              <button
                onClick={copiar}
                title={copiado ? 'Copiado!' : 'Copiar'}
                className="shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all mt-0.5"
                style={copiado ? {
                  backgroundColor: 'rgba(52,211,153,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52,211,153,0.3)',
                } : {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#888888',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {copiado ? <Check size={13} /> : <Copy size={13} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
