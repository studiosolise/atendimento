-- Fase 4: Tabela de projetos (funil pós-venda)
-- Rodar no Supabase SQL Editor

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  service text check (service in (
    'identidade_visual','identidade_naming','naming',
    'landing_page','site','site_blog','loja_virtual',
    'material_avulso','apresentacao','outro'
  )),
  status text not null default 'contrato' check (status in (
    'contrato','briefing','alinhamento','desenvolvimento',
    'apresentacao','aprovacao','entregue'
  )),
  value numeric(10,2),
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Authenticated users can manage projects"
  on public.projects for all
  to authenticated
  using (true) with check (true);

create index if not exists projects_contact_id_idx on public.projects(contact_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
