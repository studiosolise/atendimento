'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Sparkles, Send } from 'lucide-react'
import { Contact, Interaction } from '@/types'
import { SERVICE_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

type ActionType = 'primeiro_contato' | 'followup_proposta' | 'objecao' | 'encerrar' | 'livre'

const ACTIONS: [ActionType, string][] = [
  ['primeiro_contato', 'Primeiro contato'],
  ['followup_proposta', 'Follow-up pós-proposta'],
  ['objecao', 'Responder objeção'],
  ['encerrar', 'Encerrar ciclo'],
  ['livre', 'Próximo passo'],
]

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatEntry {
  userText: string
  veraText: string
  copied: boolean
}

interface Props {
  contact: Contact
  interactions: Interaction[]
}

function restoreFromInteractions(interactions: Interaction[]): {
  entries: ChatEntry[]
  history: ChatMessage[]
} {
  const veraItems = interactions
    .filter(i => i.type === 'vera')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const entries: ChatEntry[] = []
  const history: ChatMessage[] = []

  for (const item of veraItems) {
    let parsed: { userText?: string; veraText?: string } | null = null
    try {
      parsed = JSON.parse(item.content)
    } catch {
      parsed = null
    }
    if (parsed?.userText && parsed?.veraText) {
      entries.push({ userText: parsed.userText, veraText: parsed.veraText, copied: false })
      history.push({ role: 'user', content: parsed.userText })
      history.push({ role: 'assistant', content: parsed.veraText })
    }
  }

  return { entries, history }
}

export function AgentePanel({ contact, interactions }: Props) {
  const [action, setAction] = useState<ActionType>('primeiro_contato')
  const [contexto, setContexto] = useState('')
  const [loading, setLoading] = useState(false)

  const [chatEntries, setChatEntries] = useState<ChatEntry[]>(() => restoreFromInteractions(interactions).entries)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => restoreFromInteractions(interactions).history)
  const [profileSent, setProfileSent] = useState<boolean>(() => restoreFromInteractions(interactions).entries.length > 0)

  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatEntries])

  async function gerar() {
    const texto = contexto.trim()
    setLoading(true)

    const actionLabel = ACTIONS.find(([k]) => k === action)?.[1] ?? action
    const userLabel = texto ? `${actionLabel} — ${texto}` : actionLabel

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
          contexto: texto || undefined,
          chatHistory,
        }),
      })
      const data = await res.json()
      const veraText: string = data.sugestao ?? data.error ?? 'Erro desconhecido.'

      const newEntry: ChatEntry = { userText: userLabel, veraText, copied: false }
      setChatEntries(prev => [...prev, newEntry])

      const newUserMsg: ChatMessage = { role: 'user', content: userLabel }
      const newAssistantMsg: ChatMessage = { role: 'assistant', content: veraText }
      const updatedHistory = [...chatHistory, newUserMsg, newAssistantMsg]
      setChatHistory(updatedHistory)
      setProfileSent(true)

      await supabase.from('interactions').insert({
        contact_id: contact.id,
        type: 'vera',
        content: JSON.stringify({ userText: userLabel, veraText }),
      })

      setContexto('')
    } catch {
      const errorEntry: ChatEntry = {
        userText: userLabel,
        veraText: 'Erro ao conectar com o agente.',
        copied: false,
      }
      setChatEntries(prev => [...prev, errorEntry])
    } finally {
      setLoading(false)
    }
  }

  function setCopied(index: number) {
    setChatEntries(prev =>
      prev.map((e, i) => (i === index ? { ...e, copied: true } : e))
    )
    setTimeout(() => {
      setChatEntries(prev =>
        prev.map((e, i) => (i === index ? { ...e, copied: false } : e))
      )
    }, 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !loading) {
      e.preventDefault()
      gerar()
    }
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
                onClick={() => setAction(key)}
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

        {/* Chat thread */}
        {chatEntries.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {chatEntries.map((entry, index) => (
              <div key={index} className="space-y-2">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div
                    className="text-xs px-3 py-2 rounded-xl max-w-[80%]"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#AAAAAA',
                    }}
                  >
                    {entry.userText}
                  </div>
                </div>

                {/* Vera bubble */}
                <div
                  className="rounded-xl"
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
                      {entry.veraText}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(entry.veraText)
                        setCopied(index)
                      }}
                      title={entry.copied ? 'Copiado!' : 'Copiar'}
                      className="shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all mt-0.5"
                      style={entry.copied ? {
                        backgroundColor: 'rgba(52,211,153,0.15)',
                        color: '#34D399',
                        border: '1px solid rgba(52,211,153,0.3)',
                      } : {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#888888',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {entry.copied ? <Check size={13} /> : <Copy size={13} />}
                      {entry.copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 items-end">
          <textarea
            value={contexto}
            onChange={e => setContexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              profileSent
                ? 'Continue a conversa — adicione contexto ou peça uma variação...'
                : 'Contexto adicional — ex: cliente mencionou sócio, orçamento apertado, prazo urgente...'
            }
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
            className="flex-shrink-0 h-10 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            style={{ backgroundColor: '#FFFFFF', color: '#1A1A18' }}
          >
            {loading ? (
              'Gerando...'
            ) : (
              <>
                <Send size={14} />
                {profileSent ? 'Enviar' : 'Gerar'}
              </>
            )}
          </button>
        </div>

        {profileSent && (
          <p className="text-[10px]" style={{ color: '#444444' }}>
            Cmd+Enter para enviar. Conversa salva automaticamente.
          </p>
        )}
      </div>
    </div>
  )
}
