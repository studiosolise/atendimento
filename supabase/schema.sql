-- Tabela de contatos / leads
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  instagram text,
  company text,
  service text check (service in (
    'identidade_visual','identidade_naming','naming',
    'landing_page','site','site_blog','loja_virtual',
    'material_avulso','apresentacao','outro'
  )),
  status text not null default 'novo_lead' check (status in (
    'novo_lead','contato_feito','qualificado',
    'proposta_enviada','negociacao','fechado','perdido','frio'
  )),
  source text check (source in ('instagram_ads','whatsapp_direto','indicacao','outro')),
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de interações (histórico por contato)
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  type text not null default 'mensagem' check (type in (
    'mensagem','nota','proposta','reuniao','email'
  )),
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Tabela de follow-ups programados
create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  scheduled_for timestamptz not null,
  message_template text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: apenas usuários autenticados podem acessar
alter table public.contacts enable row level security;
alter table public.interactions enable row level security;
alter table public.followups enable row level security;

create policy "Authenticated users can manage contacts"
  on public.contacts for all
  to authenticated
  using (true) with check (true);

create policy "Authenticated users can manage interactions"
  on public.interactions for all
  to authenticated
  using (true) with check (true);

create policy "Authenticated users can manage followups"
  on public.followups for all
  to authenticated
  using (true) with check (true);

-- Índices
create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists contacts_created_at_idx on public.contacts(created_at desc);
create index if not exists interactions_contact_id_idx on public.interactions(contact_id);
create index if not exists followups_contact_id_idx on public.followups(contact_id);
create index if not exists followups_scheduled_for_idx on public.followups(scheduled_for);
