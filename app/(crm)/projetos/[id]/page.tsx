import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Project, ProjectStatus, ServiceType } from '@/types'
import { PROJECT_STATUS_LABELS, PROJECT_FUNNEL, SERVICE_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ProjectFunnelClient } from './project-funnel-client'
import { ProjectEditForm } from './project-edit-form'

type ProjectWithContact = Project & { contacts: { id: string; name: string } | null }

export default async function ProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, contacts(id, name)')
    .eq('id', id)
    .single() as { data: ProjectWithContact | null }

  if (!project) notFound()

  const currentIndex = PROJECT_FUNNEL.indexOf(project.status)

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/projetos"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-60"
        style={{ color: '#AAAAAA' }}
      >
        <ArrowLeft size={14} />
        Projetos
      </Link>

      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#AAAAAA', letterSpacing: '0.14em' }}>
          Projeto
        </p>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>{project.title}</h1>
        {project.contacts && (
          <Link
            href={`/contatos/${project.contacts.id}`}
            className="text-sm mt-1 inline-block transition-colors hover:opacity-60"
            style={{ color: '#AAAAAA' }}
          >
            {project.contacts.name} →
          </Link>
        )}
      </div>

      {/* Funil de etapas */}
      <div
        className="p-5 mb-6 rounded-xl"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
      >
        <p className="text-[10px] font-semibold uppercase mb-4" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
          Etapa atual
        </p>
        <div className="flex items-center gap-0">
          {PROJECT_FUNNEL.map((stage, i) => {
            const isActive = stage === project.status
            const isDone = i < currentIndex
            return (
              <div key={stage} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className="w-full h-1.5 rounded-sm mb-2"
                    style={{
                      background: isDone
                        ? '#1A1A18'
                        : isActive
                        ? '#1A1A18'
                        : '#E5E5E8',
                      opacity: isDone ? 0.35 : 1,
                    }}
                  />
                  <span
                    className="text-[10px] text-center truncate w-full px-0.5"
                    style={{
                      color: isActive ? '#1A1A18' : isDone ? '#AAAAAA' : '#CCCCCC',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {PROJECT_STATUS_LABELS[stage]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <ProjectFunnelClient projectId={id} currentStatus={project.status} />
        </div>

        <div className="space-y-4">
          <div
            className="p-5 space-y-3 rounded-xl"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
          >
            <p className="text-[10px] font-semibold uppercase mb-3" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
              Dados
            </p>

            {project.service && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Serviço</p>
                <p className="text-sm" style={{ color: '#1A1A18' }}>{SERVICE_LABELS[project.service as ServiceType]}</p>
              </div>
            )}

            {project.value && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Valor</p>
                <p className="text-sm font-medium" style={{ color: '#1A1A18' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
                </p>
              </div>
            )}

            {project.deadline && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Prazo</p>
                <p className="text-sm" style={{ color: '#1A1A18' }}>
                  {format(new Date(project.deadline + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}

            {project.notes && (
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Observações</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#666666' }}>{project.notes}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] mb-0.5" style={{ color: '#CCCCCC' }}>Criado em</p>
              <p className="text-sm" style={{ color: '#AAAAAA' }}>
                {format(new Date(project.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <ProjectEditForm project={project} />
        </div>
      </div>
    </div>
  )
}
