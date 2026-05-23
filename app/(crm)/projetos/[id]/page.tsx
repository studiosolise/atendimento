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
      <Link href="/projetos" className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A18] mb-6">
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-1">Projeto</p>
        <h1 className="text-2xl font-semibold text-[#1A1A18] tracking-tight">{project.title}</h1>
        {project.contacts && (
          <Link href={`/contatos/${project.contacts.id}`} className="text-sm text-[#888] hover:text-[#1A1A18] mt-1 inline-block">
            {project.contacts.name} →
          </Link>
        )}
      </div>

      {/* Funil de etapas */}
      <div className="bg-white rounded-lg border border-[#E5E4E0] p-5 mb-6">
        <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Etapa atual</p>
        <div className="flex items-center gap-0">
          {PROJECT_FUNNEL.map((stage, i) => {
            const isActive = stage === project.status
            const isDone = i < currentIndex
            return (
              <div key={stage} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-full h-1.5 rounded-sm mb-2 ${
                    isDone ? 'bg-[#1A1A18]' : isActive ? 'bg-[#1A1A18]' : 'bg-[#E5E4E0]'
                  }`} />
                  <span className={`text-[10px] text-center truncate w-full px-0.5 ${
                    isActive ? 'text-[#1A1A18] font-semibold' : isDone ? 'text-[#888]' : 'text-[#C8C7C0]'
                  }`}>
                    {PROJECT_STATUS_LABELS[stage]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ProjectFunnelClient projectId={id} currentStatus={project.status} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E5E4E0] p-5 space-y-3">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Dados</p>

            {project.service && (
              <div>
                <p className="text-xs text-[#aaa]">Serviço</p>
                <p className="text-sm text-[#1A1A18]">{SERVICE_LABELS[project.service as ServiceType]}</p>
              </div>
            )}

            {project.value && (
              <div>
                <p className="text-xs text-[#aaa]">Valor</p>
                <p className="text-sm text-[#1A1A18] font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
                </p>
              </div>
            )}

            {project.deadline && (
              <div>
                <p className="text-xs text-[#aaa]">Prazo</p>
                <p className="text-sm text-[#1A1A18]">
                  {format(new Date(project.deadline + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}

            {project.notes && (
              <div>
                <p className="text-xs text-[#aaa]">Observações</p>
                <p className="text-sm text-[#1A1A18] whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-[#aaa]">Criado em</p>
              <p className="text-sm text-[#1A1A18]">
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
