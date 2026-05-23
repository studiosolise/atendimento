'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROJECT_FUNNEL, PROJECT_STATUS_LABELS } from '@/lib/constants'
import { ProjectStatus } from '@/types'

export function ProjectFunnelClient({ projectId, currentStatus }: { projectId: string; currentStatus: ProjectStatus }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function advance() {
    const current = PROJECT_FUNNEL.indexOf(currentStatus)
    if (current === PROJECT_FUNNEL.length - 1) return
    const next = PROJECT_FUNNEL[current + 1]
    setLoading(true)
    await fetch(`/api/projetos/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    router.refresh()
    setLoading(false)
  }

  async function goBack() {
    const current = PROJECT_FUNNEL.indexOf(currentStatus)
    if (current === 0) return
    const prev = PROJECT_FUNNEL[current - 1]
    setLoading(true)
    await fetch(`/api/projetos/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: prev }),
    })
    router.refresh()
    setLoading(false)
  }

  const currentIndex = PROJECT_FUNNEL.indexOf(currentStatus)
  const isLast = currentIndex === PROJECT_FUNNEL.length - 1
  const isFirst = currentIndex === 0

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
    >
      <p className="text-[10px] font-semibold uppercase mb-4" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
        Mover etapa
      </p>

      <div className="space-y-1.5 mb-5">
        {PROJECT_FUNNEL.map((stage, i) => {
          const isActive = stage === currentStatus
          const isDone = i < currentIndex
          return (
            <div
              key={stage}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: isActive ? '#F1F1F3' : 'transparent',
                color: isActive ? '#1A1A18' : isDone ? '#CCCCCC' : '#AAAAAA',
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                style={{
                  border: `1px solid ${isActive ? '#1A1A18' : isDone ? '#E5E5E8' : '#E5E5E8'}`,
                  color: isActive ? '#1A1A18' : isDone ? '#CCCCCC' : '#CCCCCC',
                  background: isActive ? 'transparent' : 'transparent',
                }}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                {PROJECT_STATUS_LABELS[stage]}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        {!isFirst && (
          <button
            onClick={goBack}
            disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-lg transition-all disabled:opacity-40 hover:bg-[#F1F1F3]"
            style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
          >
            ← Voltar etapa
          </button>
        )}
        {!isLast && (
          <button
            onClick={advance}
            disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-lg font-medium transition-all disabled:opacity-40 hover:opacity-80"
            style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
          >
            Avançar → {PROJECT_STATUS_LABELS[PROJECT_FUNNEL[currentIndex + 1]]}
          </button>
        )}
        {isLast && (
          <div
            className="flex-1 py-2.5 text-sm text-center rounded-lg"
            style={{ backgroundColor: 'rgba(5,150,105,0.06)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}
          >
            Projeto entregue
          </div>
        )}
      </div>
    </div>
  )
}
