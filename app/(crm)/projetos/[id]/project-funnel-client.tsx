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
      style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
    >
      <p className="text-[10px] font-semibold uppercase mb-4" style={{ color: '#4A4B6A', letterSpacing: '0.12em' }}>
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
                backgroundColor: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: isActive ? '#C4B5FD' : isDone ? '#3A3C55' : '#5A5C7E',
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                style={{
                  border: `1px solid ${isActive ? '#7C3AED' : isDone ? '#2A2B3D' : '#1E1F2E'}`,
                  color: isActive ? '#A78BFA' : isDone ? '#3A3C55' : '#2A2B3D',
                  background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
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
            className="flex-1 py-2.5 text-sm rounded-lg transition-all disabled:opacity-40 hover:bg-white/5"
            style={{ color: '#7273A0', border: '1px solid #1E1F2E' }}
          >
            ← Voltar etapa
          </button>
        )}
        {!isLast && (
          <button
            onClick={advance}
            disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}
          >
            Avançar → {PROJECT_STATUS_LABELS[PROJECT_FUNNEL[currentIndex + 1]]}
          </button>
        )}
        {isLast && (
          <div
            className="flex-1 py-2.5 text-sm text-center rounded-lg"
            style={{ backgroundColor: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            Projeto entregue
          </div>
        )}
      </div>
    </div>
  )
}
