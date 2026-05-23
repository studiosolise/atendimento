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
    <div className="bg-white rounded-lg border border-[#E5E4E0] p-5">
      <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Mover etapa</p>

      <div className="space-y-2 mb-5">
        {PROJECT_FUNNEL.map((stage, i) => {
          const isActive = stage === currentStatus
          const isDone = i < currentIndex
          return (
            <div
              key={stage}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[#1A1A18] text-white'
                  : isDone
                  ? 'text-[#888] line-through'
                  : 'text-[#C8C7C0]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                isActive
                  ? 'border-white text-white'
                  : isDone
                  ? 'border-[#888] text-[#888]'
                  : 'border-[#E5E4E0] text-[#C8C7C0]'
              }`}>
                {isDone ? '✓' : i + 1}
              </span>
              {PROJECT_STATUS_LABELS[stage]}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        {!isFirst && (
          <button
            onClick={goBack}
            disabled={loading}
            className="flex-1 py-2 text-sm border border-[#E5E4E0] rounded-md text-[#555] hover:border-[#C8C7C0] hover:text-[#1A1A18] transition-colors disabled:opacity-50"
          >
            ← Voltar etapa
          </button>
        )}
        {!isLast && (
          <button
            onClick={advance}
            disabled={loading}
            className="flex-1 py-2 text-sm bg-[#1A1A18] text-white rounded-md hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            Avançar → {PROJECT_STATUS_LABELS[PROJECT_FUNNEL[currentIndex + 1]]}
          </button>
        )}
        {isLast && (
          <div className="flex-1 py-2 text-sm text-center text-[#888] bg-[#F0EFE9] rounded-md">
            Projeto entregue
          </div>
        )}
      </div>
    </div>
  )
}
