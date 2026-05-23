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
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: '1px solid #F0F0F0' }}
      >
        <div className="flex items-center gap-2">
          <FolderOpen size={13} style={{ color: '#AAAAAA' }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1A1A18' }}>
            Projetos
          </p>
        </div>
        <NovoProjetoButton contactId={contactId} contactName={contactName} compact />
      </div>

      {projects.length === 0 ? (
        <div className="px-4 py-3.5">
          <p className="text-sm" style={{ color: '#AAAAAA' }}>Nenhum projeto vinculado.</p>
        </div>
      ) : (
        <div>
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projetos/${project.id}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#FAFAFA]"
              style={{ borderBottom: '1px solid #F5F5F5' }}
            >
              <p className="text-sm truncate" style={{ color: '#1A1A18' }}>{project.title}</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full border ml-2 flex-shrink-0 ${PROJECT_STATUS_COLORS[project.status as ProjectStatus]}`}
              >
                {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
