-- ============================================================
-- iBisne CRM · Migration 0001 · Init schema completo
-- ============================================================
-- Crea TODAS las tablas + tipos enum + indexes + triggers + RLS
-- Para Supabase / Postgres 15+
--
-- Ejecutar UNA VEZ al crear el proyecto:
--   $ npx supabase db reset            (resetea y aplica todo)
--   o pegar en Supabase SQL Editor
--
-- NOTA: Este archivo combina las 16 migraciones del SCHEMA.md
-- en una sola para arranque rápido. Después se separan si se
-- requieren cambios incrementales.
-- ============================================================

-- ─── Extensiones requeridas ─────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Tipos ENUM ─────────────────────────────────────────────
create type user_role as enum (
  'founder', 'kam', 'arquitecto', 'senior', 'junior', 'cliente', 'reseller'
);

create type lead_stage as enum (
  'prospecto', 'lead_calificado', 'cotizacion_enviada', 'en_discovery',
  'negociacion', 'contrato_firmado', 'cliente_activo', 'lost'
);

create type lead_source as enum ('quiz', 'manual', 'referido', 'inbound');

create type cliente_tipo as enum ('persona', 'empresa');

create type proyecto_status as enum (
  'borrador', 'cotizado', 'firmado', 'kickoff', 'discovery',
  'en_produccion', 'qa', 'entregado', 'mantenimiento', 'pausado', 'cancelado'
);

create type brief_status as enum ('pendiente', 'en_progreso', 'completo', 'aprobado');
create type contrato_status as enum ('borrador', 'enviado', 'firmado', 'cancelado');

create type pago_tipo as enum ('anticipo', 'entrega', 'hito', 'mensualidad', 'unico');
create type pago_status as enum ('programado', 'enviado', 'pagado', 'vencido', 'cancelado');
create type pago_metodo as enum ('paypal', 'stripe', 'transferencia', 'oxxo', 'efectivo', 'crypto', 'mp');

create type suscripcion_tier as enum ('foundation', 'growth', 'scale', 'holding');
create type suscripcion_status as enum ('trial', 'activa', 'pausada', 'cancelada', 'morosa');

create type reseller_status as enum ('pendiente', 'activo', 'pausado', 'cancelado');
create type comision_status as enum ('devengada', 'aprobada', 'pagada', 'cancelada');

create type notif_channel as enum ('email', 'slack', 'in_app');
create type notif_status as enum ('queued', 'sent', 'failed', 'cancelled');

-- ─── Living Coding enums ────────────────────────────────────
create type playbook_tipo as enum (
  'bio-link', 'landing', 'leads-page', 'sitio-completo',
  'single-product', 'shopify', 'headless-commerce', 'marketplace',
  'app-ios-nativa', 'app-android-nativa', 'app-hybrida', 'mvp-nocode',
  'ai-chatbot', 'web3-dapp', 'saas-custom', 'otro-custom'
);

create type step_tipo as enum ('input', 'review', 'build', 'deploy', 'handoff');

create type project_step_status as enum (
  'bloqueado', 'pendiente', 'en_progreso', 'en_revision', 'completo', 'rechazado'
);

create type resource_tipo as enum ('figma', 'video', 'doc', 'link', 'template', 'example');

-- ─── Tabla: users (mirror de auth.users) ────────────────────
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  nombre       text,
  role         user_role not null default 'cliente',
  cliente_id   uuid,
  reseller_id  uuid,
  capacidad_horas_semana smallint default 40,
  especialidades text[],
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_users_role on public.users(role);
create index idx_users_email on public.users(email);

-- ─── Tabla: resellers ───────────────────────────────────────
create table public.resellers (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  email           text not null unique,
  telefono        text,
  rfc             text,
  empresa         text,
  link_slug       text not null unique,
  comision_pct    numeric(5,2) not null default 10.00,
  status          reseller_status not null default 'pendiente',
  banco           text,
  cuenta_clabe    text,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_resellers_slug on public.resellers(link_slug);
create index idx_resellers_status on public.resellers(status);

-- ─── Tabla: clientes ────────────────────────────────────────
create table public.clientes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  email         text unique,
  telefono      text,
  rfc           text,
  tipo          cliente_tipo not null default 'empresa',
  direccion_fiscal text,
  es_referido   boolean not null default false,
  reseller_id   uuid references public.resellers(id),
  notas         text,
  created_by    uuid references public.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_clientes_email on public.clientes(email);
create index idx_clientes_reseller on public.clientes(reseller_id);

-- FK circular: users.cliente_id y users.reseller_id
alter table public.users
  add constraint users_cliente_fk foreign key (cliente_id) references public.clientes(id),
  add constraint users_reseller_fk foreign key (reseller_id) references public.resellers(id);

-- ─── Tabla: marcas ──────────────────────────────────────────
create table public.marcas (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references public.clientes(id) on delete cascade,
  nombre       text not null,
  logo_url     text,
  industria    text,
  notas        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_marcas_cliente on public.marcas(cliente_id);

-- ─── Tabla: pipeline_stages (configurable) ──────────────────
create table public.pipeline_stages (
  id              uuid primary key default gen_random_uuid(),
  key             text not null unique,
  label           text not null,
  label_en        text,
  color           text,
  orden           smallint not null,
  is_terminal     boolean default false,
  created_at      timestamptz not null default now()
);

insert into public.pipeline_stages (key, label, label_en, color, orden) values
  ('prospecto', 'Prospecto', 'Prospect', '#8B9099', 1),
  ('lead_calificado', 'Lead calificado', 'Qualified', '#AEFFC8', 2),
  ('cotizacion_enviada', 'Cotización enviada', 'Quote sent', '#3DFF7F', 3),
  ('en_discovery', 'En discovery', 'In discovery', '#2DC066', 4),
  ('negociacion', 'Negociación', 'Negotiation', '#00A346', 5),
  ('contrato_firmado', 'Contrato firmado', 'Contract signed', '#3DFF7F', 6),
  ('cliente_activo', 'Cliente activo', 'Active client', '#AEFFC8', 7),
  ('lost', 'Lost', 'Lost', '#8B9099', 8);

-- ─── Tabla: leads ───────────────────────────────────────────
create table public.leads (
  id                     uuid primary key default gen_random_uuid(),
  nombre                 text,
  email                  text,
  telefono               text,
  empresa                text,
  vertical               text,
  subtipo                text,
  total_mxn              numeric(12,2),
  currency               text default 'MXN',
  selecciones            jsonb,
  stage                  lead_stage not null default 'prospecto',
  source                 lead_source not null default 'quiz',
  reseller_id            uuid references public.resellers(id),
  assigned_to            uuid references public.users(id),
  score                  smallint default 0,
  notas                  text,
  converted_to_cliente_id uuid references public.clientes(id),
  locale                 text default 'es',
  ua                     text,
  referrer               text,
  utm_source             text,
  utm_medium             text,
  utm_campaign           text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index idx_leads_stage on public.leads(stage);
create index idx_leads_assigned on public.leads(assigned_to);
create index idx_leads_reseller on public.leads(reseller_id);
create index idx_leads_created on public.leads(created_at desc);
create index idx_leads_email on public.leads(email);

-- ─── Tabla: playbooks ───────────────────────────────────────
create table public.playbooks (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  tipo_proyecto   playbook_tipo not null,
  descripcion     text,
  tech_stack_default jsonb not null,
  total_steps     smallint not null default 0,
  tiempo_total_h  numeric(5,1),
  is_active       boolean default true,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Tabla: playbook_steps ──────────────────────────────────
create table public.playbook_steps (
  id                  uuid primary key default gen_random_uuid(),
  playbook_id         uuid not null references public.playbooks(id) on delete cascade,
  orden               smallint not null,
  nombre              text not null,
  descripcion         text,
  tipo                step_tipo not null,
  rol_minimo          user_role not null default 'junior',
  aprobador_rol       user_role,
  tiempo_estimado_h   numeric(4,1) default 4,
  inputs_requeridos   jsonb,
  outputs_esperados   jsonb,
  checklist           jsonb,
  unlocks_next        boolean default true,
  created_at          timestamptz not null default now(),
  unique (playbook_id, orden)
);
create index idx_playbook_steps_playbook on public.playbook_steps(playbook_id);

-- ─── Tabla: step_resources ──────────────────────────────────
create table public.step_resources (
  id                uuid primary key default gen_random_uuid(),
  playbook_step_id  uuid not null references public.playbook_steps(id) on delete cascade,
  nombre            text not null,
  tipo              resource_tipo not null,
  url               text not null,
  descripcion       text,
  orden             smallint default 0,
  created_at        timestamptz not null default now()
);
create index idx_step_resources_step on public.step_resources(playbook_step_id);

-- ─── Tabla: proyectos ───────────────────────────────────────
create sequence proyectos_folio_seq start 425;

create table public.proyectos (
  id              uuid primary key default gen_random_uuid(),
  marca_id        uuid not null references public.marcas(id) on delete cascade,
  cliente_id      uuid not null references public.clientes(id),
  playbook_id     uuid references public.playbooks(id),
  nombre          text not null,
  vertical        text,
  subtipo         text,
  total_mxn       numeric(12,2) not null default 0,
  total_iva_mxn   numeric(12,2) generated always as (total_mxn * 1.16) stored,
  currency        text default 'MXN',
  selecciones     jsonb,
  status          proyecto_status not null default 'borrador',
  folio           integer unique,
  kickoff_date    date,
  entrega_date    date,
  fecha_real_entrega date,
  pm_user_id      uuid references public.users(id),
  pdf_cotizacion_url text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_proyectos_marca on public.proyectos(marca_id);
create index idx_proyectos_cliente on public.proyectos(cliente_id);
create index idx_proyectos_status on public.proyectos(status);

-- ─── Tabla: tech_stacks (declarado por arquitecto) ──────────
create table public.tech_stacks (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid unique not null references public.proyectos(id) on delete cascade,
  plataforma      text,
  framework       text,
  cms             text,
  db              text,
  pagos           text,
  servicios       jsonb,
  justificacion   text,
  declarado_por   uuid references public.users(id),
  aprobado_por    uuid references public.users(id),
  declarado_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_tech_stacks_proyecto on public.tech_stacks(proyecto_id);

-- ─── Tabla: project_steps (instancias por proyecto) ─────────
create table public.project_steps (
  id                  uuid primary key default gen_random_uuid(),
  proyecto_id         uuid not null references public.proyectos(id) on delete cascade,
  playbook_step_id    uuid not null references public.playbook_steps(id),
  orden               smallint not null,
  nombre              text not null,
  status              project_step_status not null default 'bloqueado',
  assigned_to         uuid references public.users(id),
  approver_id         uuid references public.users(id),
  started_at          timestamptz,
  completed_at        timestamptz,
  tiempo_real_h       numeric(5,2),
  outputs             jsonb,
  checklist_state     jsonb default '{}'::jsonb,
  notas               text,
  bloqueador          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_project_steps_proyecto on public.project_steps(proyecto_id);
create index idx_project_steps_assigned on public.project_steps(assigned_to);
create index idx_project_steps_status on public.project_steps(status);

-- ─── Tabla: project_step_outputs (versionado) ───────────────
create table public.project_step_outputs (
  id                uuid primary key default gen_random_uuid(),
  project_step_id   uuid not null references public.project_steps(id) on delete cascade,
  version           smallint not null,
  tipo              text not null,         -- 'figma_link', 'pdf_upload', 'github_pr', 'video'
  url               text not null,
  notas             text,
  uploaded_by       uuid references public.users(id),
  uploaded_at       timestamptz not null default now(),
  status            text not null default 'submitted',  -- 'submitted', 'approved', 'rejected'
  review_notes      text,
  reviewed_by       uuid references public.users(id),
  reviewed_at       timestamptz,
  unique (project_step_id, version)
);
create index idx_outputs_step on public.project_step_outputs(project_step_id);

-- ─── Tabla: briefs ──────────────────────────────────────────
create table public.briefs (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos(id) on delete cascade,
  status          brief_status not null default 'pendiente',
  fill_rate       smallint not null default 0,
  respuestas      jsonb not null default '{}'::jsonb,
  enviado_at      timestamptz,
  iniciado_at     timestamptz,
  completado_at   timestamptz,
  aprobado_at     timestamptz,
  aprobado_by     uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_briefs_proyecto on public.briefs(proyecto_id);
create index idx_briefs_status on public.briefs(status);

-- ─── Tabla: contratos ───────────────────────────────────────
create table public.contratos (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos(id) on delete cascade,
  status          contrato_status not null default 'borrador',
  pdf_url         text,
  signed_pdf_url  text,
  signed_at       timestamptz,
  signed_by_email text,
  monto_mxn       numeric(12,2),
  external_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_contratos_proyecto on public.contratos(proyecto_id);

-- ─── Tabla: suscripciones ───────────────────────────────────
create table public.suscripciones (
  id                   uuid primary key default gen_random_uuid(),
  cliente_id           uuid not null references public.clientes(id) on delete cascade,
  tier                 suscripcion_tier not null,
  status               suscripcion_status not null default 'activa',
  price_mxn            numeric(12,2) not null,
  currency             text default 'MXN',
  start_date           date not null,
  end_date             date,
  next_charge_date     date,
  stripe_subscription_id text,
  beneficio_consumido_horas numeric(8,2) default 0,
  notas                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index idx_suscripciones_cliente on public.suscripciones(cliente_id);
create index idx_suscripciones_status on public.suscripciones(status);

-- ─── Tabla: pagos ───────────────────────────────────────────
create table public.pagos (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid references public.proyectos(id) on delete cascade,
  suscripcion_id  uuid references public.suscripciones(id) on delete cascade,
  cliente_id      uuid not null references public.clientes(id),
  monto_mxn       numeric(12,2) not null,
  currency        text default 'MXN',
  tipo            pago_tipo not null,
  status          pago_status not null default 'programado',
  metodo          pago_metodo,
  due_date        date not null,
  paid_at         timestamptz,
  stripe_session_id text,
  recibo_url      text,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_pagos_proyecto on public.pagos(proyecto_id);
create index idx_pagos_cliente on public.pagos(cliente_id);
create index idx_pagos_due on public.pagos(due_date);
create index idx_pagos_status on public.pagos(status);

-- ─── Tabla: comisiones ──────────────────────────────────────
create table public.comisiones (
  id              uuid primary key default gen_random_uuid(),
  reseller_id     uuid not null references public.resellers(id),
  lead_id         uuid references public.leads(id),
  cliente_id      uuid references public.clientes(id),
  proyecto_id     uuid references public.proyectos(id),
  pago_id         uuid references public.pagos(id),
  monto_mxn       numeric(12,2) not null,
  porcentaje      numeric(5,2) not null,
  status          comision_status not null default 'devengada',
  paid_at         timestamptz,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_comisiones_reseller on public.comisiones(reseller_id);
create index idx_comisiones_status on public.comisiones(status);

-- ─── Tabla: notifications ───────────────────────────────────
create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  channel         notif_channel not null,
  template        text not null,
  recipient       text not null,
  payload         jsonb,
  status          notif_status not null default 'queued',
  scheduled_for   timestamptz default now(),
  sent_at         timestamptz,
  error           text,
  related_lead_id      uuid references public.leads(id),
  related_cliente_id   uuid references public.clientes(id),
  related_proyecto_id  uuid references public.proyectos(id),
  related_pago_id      uuid references public.pagos(id),
  created_at      timestamptz not null default now()
);
create index idx_notifs_scheduled on public.notifications(scheduled_for, status);
create index idx_notifs_status on public.notifications(status);

-- ─── Tabla: audit_log ───────────────────────────────────────
create table public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id),
  action          text not null,
  entity_type     text not null,
  entity_id       uuid not null,
  diff            jsonb,
  ip              text,
  ua              text,
  created_at      timestamptz not null default now()
);
create index idx_audit_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_user on public.audit_log(user_id);
create index idx_audit_created on public.audit_log(created_at desc);

-- ─── Tabla: settings ────────────────────────────────────────
create table public.settings (
  key             text primary key,
  value           jsonb not null,
  updated_by      uuid references public.users(id),
  updated_at      timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('org.name', '"iBisne"'::jsonb),
  ('org.email', '"proyectos@ibisne.com"'::jsonb),
  ('org.wa_number', '"+523329575274"'::jsonb),
  ('pipeline.default_stage', '"prospecto"'::jsonb);

-- ─── Helper functions para RLS ──────────────────────────────
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('founder', 'kam', 'arquitecto', 'senior')
  );
$$ language sql security definer set search_path = public;

create or replace function is_founder() returns boolean as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'founder');
$$ language sql security definer set search_path = public;

create or replace function my_role() returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer set search_path = public;

create or replace function my_cliente_id() returns uuid as $$
  select cliente_id from public.users where id = auth.uid();
$$ language sql security definer set search_path = public;

create or replace function my_reseller_id() returns uuid as $$
  select reseller_id from public.users where id = auth.uid();
$$ language sql security definer set search_path = public;

-- ─── Triggers utilitarios ──────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar updated_at trigger a TODAS las tablas con esa columna
do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format('
      create trigger trg_%I_updated_at
      before update on public.%I
      for each row execute function set_updated_at();
    ', t, t);
  end loop;
end $$;

-- Trigger: asignar folio automático a proyectos
create or replace function assign_folio() returns trigger as $$
begin
  if new.folio is null then
    new.folio = nextval('proyectos_folio_seq');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_proyectos_folio before insert on public.proyectos
  for each row execute function assign_folio();

-- Trigger: log de cambios de stage en leads
create or replace function log_lead_stage_change() returns trigger as $$
begin
  if new.stage != old.stage then
    insert into public.audit_log (user_id, action, entity_type, entity_id, diff)
    values (
      auth.uid(),
      'lead.stage_changed',
      'lead',
      new.id,
      jsonb_build_object('from', old.stage, 'to', new.stage)
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_stage_log after update on public.leads
  for each row execute function log_lead_stage_change();

-- Trigger: desbloquear siguiente paso al completar uno
create or replace function unlock_next_step() returns trigger as $$
begin
  if new.status = 'completo' and old.status <> 'completo' then
    update public.project_steps
       set status = 'pendiente'
     where proyecto_id = new.proyecto_id
       and orden = new.orden + 1
       and status = 'bloqueado';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_project_steps_unlock after update on public.project_steps
  for each row execute function unlock_next_step();

-- ─── Habilitar RLS en todas las tablas ─────────────────────
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.clientes enable row level security;
alter table public.marcas enable row level security;
alter table public.proyectos enable row level security;
alter table public.project_steps enable row level security;
alter table public.project_step_outputs enable row level security;
alter table public.briefs enable row level security;
alter table public.contratos enable row level security;
alter table public.tech_stacks enable row level security;
alter table public.pagos enable row level security;
alter table public.suscripciones enable row level security;
alter table public.resellers enable row level security;
alter table public.comisiones enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.playbooks enable row level security;
alter table public.playbook_steps enable row level security;
alter table public.step_resources enable row level security;
alter table public.settings enable row level security;
alter table public.pipeline_stages enable row level security;

-- ─── Policies básicas (admin full, cliente/reseller restringido) ──

-- USERS: cada usuario ve su propio registro · admin ve todos
create policy "users self" on public.users
  for select using (id = auth.uid());
create policy "users admin all" on public.users
  for all using (is_admin());

-- LEADS: admin (founder/kam/arq/sr) ve todo · reseller ve los suyos
create policy "leads admin all" on public.leads
  for all using (is_admin());
create policy "leads reseller own" on public.leads
  for select using (reseller_id = my_reseller_id());

-- CLIENTES: admin todo · cliente solo el suyo · reseller los referidos
create policy "clientes admin all" on public.clientes
  for all using (is_admin());
create policy "clientes cliente self" on public.clientes
  for select using (id = my_cliente_id());
create policy "clientes reseller referrals" on public.clientes
  for select using (reseller_id = my_reseller_id());

-- MARCAS: heredan permisos de cliente
create policy "marcas admin all" on public.marcas
  for all using (is_admin());
create policy "marcas cliente own" on public.marcas
  for select using (cliente_id = my_cliente_id());

-- PROYECTOS: admin todo · cliente solo los suyos
create policy "proyectos admin all" on public.proyectos
  for all using (is_admin());
create policy "proyectos cliente own" on public.proyectos
  for select using (cliente_id = my_cliente_id());

-- PROJECT_STEPS: junior solo asignados · sr/arq/founder todo
create policy "project_steps admin all" on public.project_steps
  for all using (is_admin());
create policy "project_steps cliente own" on public.project_steps
  for select using (proyecto_id in (select id from public.proyectos where cliente_id = my_cliente_id()));

-- BRIEFS: admin + cliente lee y actualiza el suyo
create policy "briefs admin all" on public.briefs
  for all using (is_admin());
create policy "briefs cliente own" on public.briefs
  for all using (proyecto_id in (select id from public.proyectos where cliente_id = my_cliente_id()));

-- CONTRATOS: admin + cliente solo lee
create policy "contratos admin all" on public.contratos
  for all using (is_admin());
create policy "contratos cliente own" on public.contratos
  for select using (proyecto_id in (select id from public.proyectos where cliente_id = my_cliente_id()));

-- PAGOS: admin + cliente solo los suyos
create policy "pagos admin all" on public.pagos
  for all using (is_admin());
create policy "pagos cliente own" on public.pagos
  for select using (cliente_id = my_cliente_id());

-- COMISIONES: admin + reseller solo las suyas
create policy "comisiones admin all" on public.comisiones
  for all using (is_admin());
create policy "comisiones reseller own" on public.comisiones
  for select using (reseller_id = my_reseller_id());

-- PLAYBOOKS, STEPS, RESOURCES: admin gestiona · todos pueden leer
create policy "playbooks read all" on public.playbooks for select using (true);
create policy "playbooks admin write" on public.playbooks for insert with check (is_admin());
create policy "playbooks admin update" on public.playbooks for update using (is_admin());
create policy "playbooks admin delete" on public.playbooks for delete using (is_admin());

create policy "playbook_steps read all" on public.playbook_steps for select using (true);
create policy "playbook_steps admin write" on public.playbook_steps for all using (is_admin());

create policy "step_resources read all" on public.step_resources for select using (true);
create policy "step_resources admin write" on public.step_resources for all using (is_admin());

-- PIPELINE_STAGES, SETTINGS: lectura abierta · escritura solo founder
create policy "pipeline_stages read all" on public.pipeline_stages for select using (true);
create policy "pipeline_stages founder write" on public.pipeline_stages for all using (is_founder());

create policy "settings read all" on public.settings for select using (true);
create policy "settings founder write" on public.settings for all using (is_founder());

-- AUDIT_LOG: admin lee · system escribe (via trigger)
create policy "audit_log admin read" on public.audit_log for select using (is_admin());

-- ============================================================
-- FIN migration 0001
-- ============================================================
