'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
import { Project, ProjectStatus } from '@/types'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants'
import { NovoProjetoButton } from '@/app/(crm)/projetos/novo-projeto-button'

export function ProjectsPanel({ contactId, contactName }: { contactId: string; contactName: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/projetos?contact_id=${contactId}`)
      .then(r => r.json())
      .then((data: Project[]) => {
        setProjects(Array.isArray(data) ? data : [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [contactId])

  if (!loaded) return null

  return (
    <div className="bg-white rounded-lg border border-[#E5E4E0]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFE9]">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-[#888]" />
          <p className="text-sm font-semibold text-[#1A1A18]">Projetos</p>
        </div>
        <NovoProjetoButton contactId={contactId} contactName={contactName} compact />
      </div>

      {projects.length === 0 ? (
        <div className="px-5 py-4">
          <p className="text-sm text-[#888]">Nenhum projeto vinculado.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EFE9]">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projetos/${project.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-[#FAFAF8] transition-colors"
            >
              <p className="text-sm text-[#1A1A18] truncate">{project.title}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ml-2 flex-shrink-0 ${PROJECT_STATUS_COLORS[project.status as ProjectStatus]}`}>
                {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
