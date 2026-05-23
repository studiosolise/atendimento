import { createClient } from '@/lib/supabase/server'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, SERVICE_LABELS } from '@/lib/constants'
import { Project, ProjectStatus, ServiceType } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FolderOpen } from 'lucide-react'
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
          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#4A4B6A', letterSpacing: '0.14em' }}>
            Produção
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#E8E9F4' }}>Projetos</h1>
        </div>
        <NovoProjetoButton />
      </div>

      {!projects?.length ? (
        <div
          className="p-12 text-center rounded-xl"
          style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
        >
          <FolderOpen size={32} className="mx-auto mb-3" style={{ color: '#2A2B3D' }} />
          <p className="text-sm" style={{ color: '#5A5C7E' }}>Nenhum projeto ainda.</p>
          <p className="text-xs mt-1" style={{ color: '#3A3C55' }}>
            Projetos aparecem quando um lead é fechado.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {ativos.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#4A4B6A', letterSpacing: '0.12em' }}>
                Em andamento
              </p>
              <div className="space-y-2">
                {ativos.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {entregues.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#4A4B6A', letterSpacing: '0.12em' }}>
                Entregues
              </p>
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
      className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all group hover:border-[#2A2B3D]"
      style={{ backgroundColor: '#111218', border: '1px solid #1E1F2E' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#E8E9F4' }}>{project.title}</p>
        {project.contacts?.name && (
          <p className="text-xs mt-0.5" style={{ color: '#5A5C7E' }}>{project.contacts.name}</p>
        )}
      </div>

      {project.service && (
        <span className="text-xs hidden sm:block" style={{ color: '#5A5C7E' }}>
          {SERVICE_LABELS[project.service as ServiceType]}
        </span>
      )}

      {project.value && (
        <span className="text-sm font-medium" style={{ color: '#A78BFA' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
        </span>
      )}

      {project.deadline && (
        <span className="text-xs" style={{ color: '#5A5C7E' }}>
          {format(new Date(project.deadline + 'T12:00:00'), "d MMM", { locale: ptBR })}
        </span>
      )}

      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
        {statusLabel}
      </span>
    </Link>
  )
}
