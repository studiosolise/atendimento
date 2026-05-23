import { createClient } from '@/lib/supabase/server'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, SERVICE_LABELS } from '@/lib/constants'
import { Project, ProjectStatus, ServiceType } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FolderOpen, Plus } from 'lucide-react'
import { NovoProjetoButton } from './novo-projeto-button'

type ProjectWithContact = Project & { contacts: { name: string } | null }

export default async function ProjetosPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, contacts(name)')
    .order('created_at', { ascending: false }) as { data: ProjectWithContact[] | null }

  const ativos = (projects ?? []).filter(p => p.status !== 'entregue')
  const entregues = (projects ?? []).filter(p => p.status === 'entregue')

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Produção</p>
          <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">Projetos</h1>
        </div>
        <NovoProjetoButton />
      </div>

      {!projects?.length ? (
        <div className="bg-white rounded-lg border border-[#E5E4E0] p-12 text-center">
          <FolderOpen size={32} className="mx-auto text-[#C8C7C0] mb-3" />
          <p className="text-sm text-[#888]">Nenhum projeto ainda.</p>
          <p className="text-xs text-[#aaa] mt-1">Projetos aparecem quando um lead é fechado.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {ativos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Em andamento</p>
              <div className="space-y-2">
                {ativos.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {entregues.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Entregues</p>
              <div className="space-y-2">
                {entregues.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project }: { project: ProjectWithContact }) {
  const statusLabel = PROJECT_STATUS_LABELS[project.status]
  const statusColor = PROJECT_STATUS_COLORS[project.status]

  return (
    <Link
      href={`/projetos/${project.id}`}
      className="flex items-center gap-4 bg-white rounded-lg border border-[#E5E4E0] px-5 py-4 hover:border-[#C8C7C0] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A18] truncate">{project.title}</p>
        {project.contacts?.name && (
          <p className="text-xs text-[#888] mt-0.5">{project.contacts.name}</p>
        )}
      </div>

      {project.service && (
        <span className="text-xs text-[#888] hidden sm:block">
          {SERVICE_LABELS[project.service as ServiceType]}
        </span>
      )}

      {project.value && (
        <span className="text-sm font-medium text-[#1A1A18]">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
        </span>
      )}

      {project.deadline && (
        <span className="text-xs text-[#888]">
          {format(new Date(project.deadline + 'T12:00:00'), "d MMM", { locale: ptBR })}
        </span>
      )}

      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
        {statusLabel}
      </span>
    </Link>
  )
}
