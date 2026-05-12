# iBisne CRM — Schema de datos (Postgres + Drizzle)

> **Versión**: 0.2 (expansión Living Coding)
> **Engine**: Postgres 15+ (Supabase)
> **Convención**: nombres en `snake_case` · IDs como `uuid` con default `gen_random_uuid()`
> **v0.2 cambios**: agrega capa Living Coding (`playbooks`, `playbook_steps`, `project_steps`,
> `tech_stacks`, `step_resources`) + roles ampliados en `users`.

---

## 1. Diagrama ER (texto)

```
┌─────────────┐         ┌──────────────┐        ┌─────────────┐
│   users     │         │   leads      │        │  clientes   │
│  (auth)     │         │              │        │             │
│             │◀────────│ assigned_to  │        │             │
│ id          │         │ id           │───┐    │ id          │
│ email       │         │ nombre       │   │    │ nombre      │
│ role        │         │ email        │   └───▶│ email       │
│ created_at  │         │ telefono     │        │ telefono    │
└─────────────┘         │ empresa      │        │ rfc         │
                        │ vertical     │        │ tipo        │
                        │ stage        │        │ es_referido │
                        │ source       │        │ reseller_id │──┐
                        │ score        │        │ created_at  │  │
                        │ created_at   │        └─────────────┘  │
                        │ converted_to │                ▲        │
                        │  _cliente_id │────────────────┘        │
                        └──────────────┘                         │
                                                                  │
        ┌─────────────┐         ┌──────────────┐                 │
        │   marcas    │         │  proyectos   │                 │
        │             │         │              │                 │
        │ id          │         │ id           │                 │
        │ cliente_id  │◀────┐   │ marca_id     │─────┐           │
        │ nombre      │     │   │ tipo         │     │           │
        │ logo_url    │     │   │ subtipo      │     ▼           │
        │ industria   │     │   │ total_mxn    │   ┌──────┐     │
        │ created_at  │     │   │ status       │   │briefs│     │
        └─────────────┘     │   │ kickoff_date │   └──────┘     │
                            │   │ entrega_date │     ▼           │
                            │   │ folio        │   ┌──────────┐ │
                            │   │ created_at   │   │contratos │ │
                            │   └──────────────┘   └──────────┘ │
                            │           │                        │
                            │           ▼                        │
                            │   ┌──────────────┐                 │
                            │   │    pagos     │                 │
                            │   │              │                 │
                            │   │ proyecto_id  │                 │
                            │   │ monto        │                 │
                            │   │ tipo         │                 │
                            │   │ status       │                 │
                            │   │ due_date     │                 │
                            │   │ paid_at      │                 │
                            │   └──────────────┘                 │
                            │                                    │
                ┌───────────┴──────────┐                         │
                ▼                       ▼                         │
        ┌─────────────┐         ┌──────────────┐                 │
        │ suscripcio- │         │  resellers   │                 │
        │   nes       │         │              │                 │
        │             │         │ id           │◀────────────────┘
        │ id          │         │ nombre       │
        │ cliente_id  │         │ rfc          │
        │ tier        │         │ email        │
        │ status      │         │ link_slug    │
        │ price_mxn   │         │ created_at   │
        │ next_charge │         └──────────────┘
        │ created_at  │                 │
        └─────────────┘                 ▼
                                 ┌──────────────┐
                                 │ comisiones   │
                                 │              │
                                 │ reseller_id  │
                                 │ lead_id      │
                                 │ cliente_id   │
                                 │ monto_mxn    │
                                 │ status       │
                                 │ created_at   │
                                 └──────────────┘
```

---

## 2. Tablas (DDL Postgres)

### 2.1 `users` — auth + roles internos

> Supabase Auth crea `auth.users` automáticamente. Esta tabla es un mirror público
> con metadata adicional (role, nombre, etc.).

```sql
create type user_role as enum ('admin', 'cliente', 'reseller');

create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  nombre       text,
  role         user_role not null default 'cliente',
  cliente_id   uuid references public.clientes(id),   -- si role='cliente'
  reseller_id  uuid references public.resellers(id),  -- si role='reseller'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_users_role on public.users(role);
```

### 2.2 `leads` — capturados del quiz o manual

```sql
create type lead_stage as enum (
  'prospecto',
  'lead_calificado',
  'cotizacion_enviada',
  'en_discovery',
  'negociacion',
  'contrato_firmado',
  'cliente_activo',
  'lost'
);

create type lead_source as enum ('quiz', 'manual', 'referido', 'inbound');

create table public.leads (
  id                     uuid primary key default gen_random_uuid(),
  nombre                 text,
  email                  text,
  telefono               text,
  empresa                text,
  vertical               text,            -- 'Web', 'Ecommerce', etc.
  subtipo                text,            -- 'Bio-link', 'Landing', etc.
  total_mxn              numeric(12,2),   -- cotización indicativa
  currency               text default 'MXN',
  selecciones            jsonb,           -- snapshot completo del quiz
  stage                  lead_stage not null default 'prospecto',
  source                 lead_source not null default 'quiz',
  reseller_id            uuid references public.resellers(id),
  assigned_to            uuid references public.users(id),    -- hunter responsable
  score                  smallint default 0,                  -- 0-100 fit-score
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
```

### 2.3 `clientes` — entidades contratantes

```sql
create type cliente_tipo as enum ('persona', 'empresa');

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
```

### 2.4 `marcas` — un cliente puede tener varias

```sql
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
```

### 2.5 `proyectos` — cada cotización/contrato es un proyecto

```sql
create type proyecto_status as enum (
  'borrador',
  'cotizado',
  'firmado',
  'kickoff',
  'discovery',
  'en_produccion',
  'qa',
  'entregado',
  'mantenimiento',
  'pausado',
  'cancelado'
);

create table public.proyectos (
  id              uuid primary key default gen_random_uuid(),
  marca_id        uuid not null references public.marcas(id) on delete cascade,
  cliente_id      uuid not null references public.clientes(id), -- denorm para queries
  nombre          text not null,
  vertical        text,                  -- 'Web', 'Ecommerce', etc.
  subtipo         text,
  total_mxn       numeric(12,2) not null default 0,
  total_iva_mxn   numeric(12,2) generated always as (total_mxn * 1.16) stored,
  currency        text default 'MXN',
  selecciones     jsonb,                 -- desglose completo de la cotización
  status          proyecto_status not null default 'borrador',
  folio           integer unique,         -- folio público para la cotización
  kickoff_date    date,
  entrega_date    date,
  fecha_real_entrega date,
  pm_user_id      uuid references public.users(id),   -- project manager
  pdf_cotizacion_url text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create sequence proyectos_folio_seq start 425;       -- continúa donde quedó el v3
create index idx_proyectos_marca on public.proyectos(marca_id);
create index idx_proyectos_cliente on public.proyectos(cliente_id);
create index idx_proyectos_status on public.proyectos(status);
```

### 2.6 `briefs` — formulario que el cliente debe llenar

```sql
create type brief_status as enum ('pendiente', 'en_progreso', 'completo', 'aprobado');

create table public.briefs (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos(id) on delete cascade,
  status          brief_status not null default 'pendiente',
  fill_rate       smallint not null default 0,    -- 0-100 %
  respuestas      jsonb not null default '{}'::jsonb,
  enviado_at      timestamptz,                     -- cuando el cliente recibió el link
  iniciado_at     timestamptz,
  completado_at   timestamptz,
  aprobado_at     timestamptz,
  aprobado_by     uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_briefs_proyecto on public.briefs(proyecto_id);
create index idx_briefs_status on public.briefs(status);
```

### 2.7 `contratos` — PDFs firmables (DocuSign/PandaDoc futuro)

```sql
create type contrato_status as enum ('borrador', 'enviado', 'firmado', 'cancelado');

create table public.contratos (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos(id) on delete cascade,
  status          contrato_status not null default 'borrador',
  pdf_url         text,                            -- Supabase Storage
  signed_pdf_url  text,
  signed_at       timestamptz,
  signed_by_email text,
  monto_mxn       numeric(12,2),
  external_id     text,                            -- id de DocuSign/PandaDoc si aplica
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_contratos_proyecto on public.contratos(proyecto_id);
```

### 2.8 `pagos` — calendario y registro de cobros

```sql
create type pago_tipo as enum ('anticipo', 'entrega', 'hito', 'mensualidad', 'unico');
create type pago_status as enum ('programado', 'enviado', 'pagado', 'vencido', 'cancelado');
create type pago_metodo as enum ('paypal', 'stripe', 'transferencia', 'oxxo', 'efectivo', 'crypto', 'mp');

create table public.pagos (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid references public.proyectos(id) on delete cascade,
  suscripcion_id  uuid references public.suscripciones(id) on delete cascade,
  cliente_id      uuid not null references public.clientes(id),    -- denorm
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
create index idx_pagos_suscripcion on public.pagos(suscripcion_id);
create index idx_pagos_cliente on public.pagos(cliente_id);
create index idx_pagos_due on public.pagos(due_date);
create index idx_pagos_status on public.pagos(status);
```

### 2.9 `suscripciones` — memberships activas

```sql
create type suscripcion_tier as enum ('foundation', 'growth', 'scale', 'holding');
create type suscripcion_status as enum ('trial', 'activa', 'pausada', 'cancelada', 'morosa');

create table public.suscripciones (
  id                   uuid primary key default gen_random_uuid(),
  cliente_id           uuid not null references public.clientes(id) on delete cascade,
  tier                 suscripcion_tier not null,
  status               suscripcion_status not null default 'activa',
  price_mxn            numeric(12,2) not null,
  currency             text default 'MXN',
  start_date           date not null,
  end_date             date,                    -- null = activa
  next_charge_date     date,
  stripe_subscription_id text,
  beneficio_consumido_horas numeric(8,2) default 0,
  notas                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_suscripciones_cliente on public.suscripciones(cliente_id);
create index idx_suscripciones_status on public.suscripciones(status);
create index idx_suscripciones_next_charge on public.suscripciones(next_charge_date);
```

### 2.10 `resellers` — agencias/partners referidores

```sql
create type reseller_status as enum ('pendiente', 'activo', 'pausado', 'cancelado');

create table public.resellers (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  email           text not null unique,
  telefono        text,
  rfc             text,
  empresa         text,
  link_slug       text not null unique,           -- crm.ibisne.com/r/{slug}
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
```

### 2.11 `comisiones` — registro por lead/cliente convertido

```sql
create type comision_status as enum ('devengada', 'aprobada', 'pagada', 'cancelada');

create table public.comisiones (
  id              uuid primary key default gen_random_uuid(),
  reseller_id     uuid not null references public.resellers(id),
  lead_id         uuid references public.leads(id),
  cliente_id      uuid references public.clientes(id),
  proyecto_id     uuid references public.proyectos(id),
  pago_id         uuid references public.pagos(id),     -- comisión vinculada al pago
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
```

### 2.12 `notifications` — queue de emails/eventos

```sql
create type notif_channel as enum ('email', 'slack', 'in_app');
create type notif_status as enum ('queued', 'sent', 'failed', 'cancelled');

create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  channel         notif_channel not null,
  template        text not null,                   -- 'lead_received', 'pago_proximo', etc.
  recipient       text not null,                   -- email o user_id o slack_channel
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
```

### 2.13 `audit_log` — quién hizo qué (mandatory para reseller/cliente disputes)

```sql
create table public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id),
  action          text not null,                  -- 'lead.created', 'lead.stage_changed'
  entity_type     text not null,                  -- 'lead', 'cliente', etc.
  entity_id       uuid not null,
  diff            jsonb,                          -- before/after
  ip              text,
  ua              text,
  created_at      timestamptz not null default now()
);

create index idx_audit_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_user on public.audit_log(user_id);
create index idx_audit_created on public.audit_log(created_at desc);
```

### 2.14 `pipeline_stages` — configurable desde admin

```sql
create table public.pipeline_stages (
  id              uuid primary key default gen_random_uuid(),
  key             text not null unique,           -- 'prospecto', 'lead_calificado'
  label           text not null,                  -- 'Prospecto'
  label_en        text,                           -- 'Prospect'
  color           text,                           -- '#3DFF7F'
  orden           smallint not null,
  is_terminal     boolean default false,          -- true para 'lost' o 'cliente_activo'
  created_at      timestamptz not null default now()
);

-- Seed inicial
insert into public.pipeline_stages (key, label, label_en, color, orden) values
  ('prospecto', 'Prospecto', 'Prospect', '#8B9099', 1),
  ('lead_calificado', 'Lead calificado', 'Qualified', '#AEFFC8', 2),
  ('cotizacion_enviada', 'Cotización enviada', 'Quote sent', '#3DFF7F', 3),
  ('en_discovery', 'En discovery', 'In discovery', '#2DC066', 4),
  ('negociacion', 'Negociación', 'Negotiation', '#00A346', 5),
  ('contrato_firmado', 'Contrato firmado', 'Contract signed', '#3DFF7F', 6),
  ('cliente_activo', 'Cliente activo', 'Active client', '#AEFFC8', 7),
  ('lost', 'Lost', 'Lost', '#8B9099', 8);
```

### 2.15 `settings` — configuración global (org-wide)

```sql
create table public.settings (
  key             text primary key,
  value           jsonb not null,
  updated_by      uuid references public.users(id),
  updated_at      timestamptz not null default now()
);

-- Ejemplos
insert into public.settings (key, value) values
  ('org.name', '"iBisne"'),
  ('org.email', '"proyectos@ibisne.com"'),
  ('memberships.tiers', '[{"id":"foundation","price":3000},...]'),
  ('pipeline.default_stage', '"prospecto"');
```

---

## 3. RLS Policies (resumen)

```sql
-- Habilitar RLS en todas las tablas
alter table public.leads        enable row level security;
alter table public.clientes     enable row level security;
alter table public.marcas       enable row level security;
alter table public.proyectos    enable row level security;
alter table public.briefs       enable row level security;
alter table public.contratos    enable row level security;
alter table public.pagos        enable row level security;
alter table public.suscripciones enable row level security;
alter table public.resellers    enable row level security;
alter table public.comisiones   enable row level security;

-- Helper: is_admin()
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper: my_cliente_id()
create or replace function my_cliente_id() returns uuid as $$
  select cliente_id from public.users where id = auth.uid();
$$ language sql security definer;

-- Helper: my_reseller_id()
create or replace function my_reseller_id() returns uuid as $$
  select reseller_id from public.users where id = auth.uid();
$$ language sql security definer;

-- Policy template (repetir para cada tabla)
create policy "admin full access" on public.clientes
  for all using (is_admin());

create policy "cliente sees own" on public.clientes
  for select using (id = my_cliente_id());

create policy "reseller sees referred" on public.clientes
  for select using (reseller_id = my_reseller_id());

-- ... y así para cada tabla
```

> **CRÍTICO**: probar RLS con seed multi-tenant antes de habilitar portal cliente.
> Un cliente NUNCA debe ver datos de otro.

---

## 4. Triggers útiles

### 4.1 `updated_at` automático

```sql
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar a todas las tablas con updated_at
create trigger trg_users_updated before update on public.users
  for each row execute function set_updated_at();
-- ... repetir
```

### 4.2 Auto-asignar folio a proyectos

```sql
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
```

### 4.3 Log de cambios de stage en leads

```sql
create or replace function log_lead_stage_change() returns trigger as $$
begin
  if new.stage != old.stage then
    insert into public.audit_log (user_id, action, entity_type, entity_id, diff)
    values (auth.uid(), 'lead.stage_changed', 'lead', new.id,
            jsonb_build_object('from', old.stage, 'to', new.stage));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_stage_log after update on public.leads
  for each row execute function log_lead_stage_change();
```

---

## 5. Drizzle starter (`lib/schema.ts`)

```ts
import { pgTable, uuid, text, timestamp, integer, numeric, boolean, pgEnum, jsonb, date, smallint } from 'drizzle-orm/pg-core';

export const leadStage = pgEnum('lead_stage', [
  'prospecto', 'lead_calificado', 'cotizacion_enviada', 'en_discovery',
  'negociacion', 'contrato_firmado', 'cliente_activo', 'lost'
]);

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre'),
  email: text('email'),
  telefono: text('telefono'),
  empresa: text('empresa'),
  vertical: text('vertical'),
  subtipo: text('subtipo'),
  totalMxn: numeric('total_mxn', { precision: 12, scale: 2 }),
  selecciones: jsonb('selecciones'),
  stage: leadStage('stage').notNull().default('prospecto'),
  score: smallint('score').default(0),
  assignedTo: uuid('assigned_to'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ... resto de tablas con el mismo patrón
```

---

## 6. Migraciones recomendadas (orden de aplicación)

```
0001_init_extensions.sql       -- gen_random_uuid extension
0002_users_auth_mirror.sql     -- public.users + trigger sync con auth.users
0003_pipeline_stages.sql       -- tabla configurable + seed
0004_clientes_marcas.sql       -- clientes + marcas
0005_resellers.sql             -- antes de leads (FK)
0006_leads.sql                 -- leads + indexes
0007_proyectos.sql             -- proyectos + folio sequence
0008_briefs_contratos.sql      -- nested al proyecto
0009_pagos_suscripciones.sql
0010_comisiones.sql
0011_notifications.sql
0012_audit_log.sql
0013_settings.sql
0014_rls_helpers.sql           -- functions is_admin, my_cliente_id, my_reseller_id
0015_rls_policies.sql          -- enable RLS + policies (CRÍTICO)
0016_triggers.sql              -- updated_at, folio, stage_log
0017_seed_dev.sql              -- solo en dev: usuarios + leads de prueba
```

---

## 7. Queries clave para el dashboard

### KPIs principales
```sql
-- Leads MTD
select count(*) from leads
where created_at >= date_trunc('month', now());

-- Conversion rate (lead → cliente)
select
  count(*) filter (where stage = 'cliente_activo')::float /
  count(*)::float as conversion_rate
from leads
where created_at >= date_trunc('month', now() - interval '3 months');

-- MRR
select sum(price_mxn) from suscripciones where status = 'activa';

-- Pipeline value (leads no cerrados)
select sum(total_mxn) from leads
where stage not in ('lost', 'cliente_activo');

-- Próximos pagos 30 días
select sum(monto_mxn) from pagos
where status = 'programado' and due_date between now() and now() + interval '30 days';
```

### Pipeline para Kanban
```sql
-- Leads agrupados por stage
select stage, json_agg(json_build_object(
  'id', id, 'nombre', nombre, 'empresa', empresa,
  'total_mxn', total_mxn, 'score', score, 'created_at', created_at
) order by created_at desc) as cards
from leads
where stage != 'lost'
group by stage;
```

---

## 8. Decisiones de diseño justificadas

| Decisión | Justificación |
|---|---|
| `uuid` en vez de `serial` | Permite generar IDs cliente-side (offline-first) · sin colisiones · no expone count. |
| `jsonb` para `selecciones` | El quiz tiene shape variable según vertical · queries con `->>` siguen siendo rápidos. |
| Denormalizar `cliente_id` en `proyectos` y `pagos` | Queries del dashboard mucho más rápidas (sin joins). Pequeña duplicación, gran win. |
| ENUMs vs lookup tables | ENUMs para valores fijos (lead_stage). Lookup tables para configurables (`pipeline_stages`). |
| `generated always as ... stored` para IVA | El cliente ve el total con IVA sin que el código lo recalcule cada vez. |
| Trigger en `stage_changed` → `audit_log` | Cualquier cambio queda registrado · útil para disputes con resellers. |
| RLS por defecto activo | Imposible hacer "leak" accidental con queries directas · única forma 100% segura para multi-tenant. |

---

## 9. Living Coding · capa de workflow (v0.2)

iBisne opera con metodología propia "Living Coding": cada proyecto se ejecuta
como una secuencia de pasos bloqueados (un Jr Coder no avanza al paso N+1 sin
completar el paso N). KAM + Arquitecto declaran el tech stack al inicio. El
sistema asigna automáticamente el playbook adecuado.

### 9.1 Roles ampliados en `users`

```sql
-- Reemplazar el enum user_role
drop type user_role cascade;
create type user_role as enum (
  'founder',     -- Eduardo y socios
  'kam',         -- gestiona clientes
  'arquitecto',  -- declara tech stack
  'senior',      -- ejecuta cualquier paso, aprueba a juniors
  'junior',      -- ejecuta paso a paso, no salta
  'cliente',     -- portal limitado
  'reseller'     -- portal de comisiones
);

-- Agregar columnas a users
alter table public.users
  add column capacidad_horas_semana smallint default 40,
  add column especialidades text[];   -- ['web', 'app', 'web3']
```

### 9.2 `playbooks` — templates por tipo de proyecto

```sql
create type playbook_tipo as enum (
  'bio-link', 'landing', 'leads-page', 'sitio-completo',
  'single-product', 'shopify', 'headless-commerce', 'marketplace',
  'app-ios-nativa', 'app-android-nativa', 'app-hybrida', 'mvp-nocode',
  'ai-chatbot', 'web3-dapp', 'saas-custom', 'otro-custom'
);

create table public.playbooks (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,                 -- "Sitio completo · Next + Sanity"
  tipo_proyecto   playbook_tipo not null,
  descripcion     text,
  tech_stack_default jsonb not null,             -- { "plataforma": "Vercel", "framework": "Next 15", ... }
  total_steps     smallint not null default 0,   -- denorm de count(playbook_steps)
  tiempo_total_h  smallint,                       -- suma de tiempo_estimado_h
  is_active       boolean default true,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Seeds iniciales (uno por tipo)
insert into public.playbooks (nombre, tipo_proyecto, tech_stack_default) values
  ('Bio-link simple',     'bio-link',          '{"plataforma":"Hostinger","framework":"HTML+CSS","cms":null,"animaciones":null}'),
  ('Landing animada',     'landing',           '{"plataforma":"Vercel","framework":"Astro","cms":null,"animaciones":"GSAP"}'),
  ('Sitio completo',      'sitio-completo',    '{"plataforma":"Vercel","framework":"Next 15","cms":"Sanity","animaciones":"GSAP"}'),
  ('Ecommerce Shopify',   'shopify',           '{"plataforma":"Shopify","framework":"Liquid","cms":null,"pagos":"Shopify Payments"}'),
  ('Ecom headless',       'headless-commerce', '{"plataforma":"Vercel","framework":"Next","ecom":"Medusa","pagos":"Stripe"}'),
  ('App iOS nativa',      'app-ios-nativa',    '{"plataforma":"AppStore","framework":"Swift","tooling":"Xcode"}'),
  ('App híbrida',         'app-hybrida',       '{"plataforma":"AppStore+PlayStore","framework":"React Native","tooling":"Expo + EAS"}'),
  ('SaaS custom',         'saas-custom',       '{"plataforma":"Vercel","framework":"Next","db":"Supabase","pagos":"Stripe Billing","auth":"Supabase Auth"}'),
  ('AI chatbot',          'ai-chatbot',        '{"plataforma":"Vercel","framework":"Next","llm":"OpenAI","vectordb":"Pinecone"}'),
  ('Web3 DApp',           'web3-dapp',         '{"plataforma":"Vercel","framework":"Next","smartcontracts":"Solidity","tooling":"Hardhat","wallet":"Wagmi"}');
```

### 9.3 `playbook_steps` — pasos del template

```sql
create type step_tipo as enum (
  'input',       -- recibir info (brief, master doc, discovery call)
  'review',      -- revisión por senior/arquitecto/cliente
  'build',       -- ejecución (wireframe, design, código)
  'deploy',      -- publicación
  'handoff'      -- entrega final / docs
);

create table public.playbook_steps (
  id                  uuid primary key default gen_random_uuid(),
  playbook_id         uuid not null references public.playbooks(id) on delete cascade,
  orden               smallint not null,
  nombre              text not null,                -- "Wireframing aprobado"
  descripcion         text,
  tipo                step_tipo not null,
  rol_minimo          user_role not null default 'junior',  -- quién puede ejecutar
  aprobador_rol       user_role,                            -- quién aprueba (null = auto-aprueba)
  tiempo_estimado_h   numeric(4,1) default 4,               -- estimación en horas
  inputs_requeridos   jsonb,    -- [{ key: "brief", label: "Brief aprobado por cliente" }, ...]
  outputs_esperados   jsonb,    -- [{ key: "figma_link", label: "Link Figma con 8 wireframes" }, ...]
  checklist           jsonb,    -- array de sub-items marcables { "txt": "Wireframe Home", "minutes": 45, "required": true }
  unlocks_next        boolean default true,                  -- si false, este paso es opcional
  created_at          timestamptz not null default now(),
  unique (playbook_id, orden)
);

-- Seed ejemplo: playbook "Sitio completo" (12 pasos)
-- (ejecutar después de crear el playbook con id $$PLAYBOOK_ID$$)
insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
  ($$PLAYBOOK_ID$$, 1, 'Master doc del cliente',      'input',  'junior', 'senior', 2),
  ($$PLAYBOOK_ID$$, 2, 'Brief aprobado',              'input',  'kam',    'cliente', 4),
  ($$PLAYBOOK_ID$$, 3, 'Discovery call · resumen',    'input',  'kam',    'senior', 1.5),
  ($$PLAYBOOK_ID$$, 4, 'Tech stack declarado',        'review', 'arquitecto', 'founder', 2),
  ($$PLAYBOOK_ID$$, 5, 'Sitemap aprobado',            'build',  'junior', 'cliente', 4),
  ($$PLAYBOOK_ID$$, 6, 'Wireframing aprobado',        'build',  'junior', 'senior', 8),
  ($$PLAYBOOK_ID$$, 7, 'Design system / moodboard',   'build',  'junior', 'senior', 8),
  ($$PLAYBOOK_ID$$, 8, 'MVP / prototipo navegable',   'build',  'junior', 'senior', 16),
  ($$PLAYBOOK_ID$$, 9, 'Desarrollo final',            'build',  'junior', 'senior', 32),
  ($$PLAYBOOK_ID$$,10, 'QA cross-browser',            'review', 'junior', 'senior', 6),
  ($$PLAYBOOK_ID$$,11, 'Deploy producción',           'deploy', 'senior', 'arquitecto', 3),
  ($$PLAYBOOK_ID$$,12, 'Capacitación + handoff',      'handoff','kam',    'founder', 4);
```

### 9.4 `project_steps` — instancia por proyecto

```sql
create type project_step_status as enum (
  'bloqueado',     -- depende de un paso anterior
  'pendiente',     -- listo para empezar
  'en_progreso',   -- el coder está trabajando
  'en_revision',   -- enviado al aprobador
  'completo',      -- aprobado
  'rechazado'      -- aprobador devolvió con notas
);

create table public.project_steps (
  id                  uuid primary key default gen_random_uuid(),
  proyecto_id         uuid not null references public.proyectos(id) on delete cascade,
  playbook_step_id    uuid not null references public.playbook_steps(id),
  orden               smallint not null,
  nombre              text not null,                       -- denorm para queries
  status              project_step_status not null default 'bloqueado',
  assigned_to         uuid references public.users(id),
  approver_id         uuid references public.users(id),
  started_at          timestamptz,
  completed_at        timestamptz,
  tiempo_real_h       numeric(5,2),                        -- llevado por activity tracking
  outputs             jsonb,                                -- { "figma_link": "...", "notes": "..." }
  checklist_state     jsonb default '{}'::jsonb,            -- { "step_idx_0": true, "step_idx_1": false, ... }
  notas               text,
  bloqueador          text,                                 -- si status = bloqueado · razón humana
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_project_steps_proyecto on public.project_steps(proyecto_id);
create index idx_project_steps_assigned on public.project_steps(assigned_to);
create index idx_project_steps_status on public.project_steps(status);

-- Trigger: cuando un step se marca completo, desbloquear el siguiente
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
```

### 9.5 `tech_stacks` — stack declarado por proyecto

```sql
create table public.tech_stacks (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid unique not null references public.proyectos(id) on delete cascade,
  plataforma      text,           -- "Vercel", "Hostinger", "AppStore"
  framework       text,           -- "Next 15", "Astro", "React Native", "HTML+CSS"
  cms             text,           -- "Sanity", "Strapi", null
  db              text,           -- "Supabase", "PlanetScale", null
  pagos           text,           -- "Stripe", "Shopify Payments", "Mercado Pago"
  servicios       jsonb,          -- {"analytics":"Plausible","emails":"Resend","auth":"Supabase Auth"}
  justificacion   text,           -- por qué este stack y no otro (escrito por arquitecto)
  declarado_por   uuid references public.users(id),
  aprobado_por    uuid references public.users(id),
  declarado_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_tech_stacks_proyecto on public.tech_stacks(proyecto_id);
```

### 9.6 `step_resources` — recursos asociados a cada playbook_step

```sql
create type resource_tipo as enum ('figma', 'video', 'doc', 'link', 'template', 'example');

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
```

### 9.7 Flujo end-to-end

1. **KAM crea proyecto** desde un lead cerrado.
2. **KAM elige playbook** (de la lista de 10+ templates) según el tipo.
3. **Sistema instancia `project_steps`** copiando todos los `playbook_steps` del playbook elegido.
4. **Arquitecto entra al paso 4** ("Tech stack declarado"), llena el form, marca completo.
5. **Trigger desbloquea paso 5** ("Sitemap aprobado").
6. **KAM asigna paso 5 al Jr Coder Mateo**.
7. **Mateo entra a "Mi proyecto"** → ve la card del paso 5 destacada con recursos + checklist.
8. **Mateo termina checklist** → marca como "Listo para revisión" → status `en_revision`.
9. **Senior (Laura)** entra al paso 5, revisa outputs, aprueba → status `completo`.
10. **Trigger desbloquea paso 6**. Mateo recibe notif: "Paso 6 listo para empezar".

### 9.8 Política de RLS para Living Coding

- **`junior`** solo puede `select`/`update` `project_steps` donde `assigned_to = auth.uid()`.
- **`senior`** ve todos los steps de proyectos donde es asignado o aprobador.
- **`arquitecto`** ve todos los proyectos (necesario para auditar stack).
- **`kam`** ve sus clientes y sus proyectos.
- **`cliente`** solo ve steps de tipo `review` donde es aprobador (briefs, sitemap, wireframes).

---

## 10. Siguientes pasos

1. Eduardo valida este schema · ajustes (especial atención a `playbooks` seeds)
2. Crear archivos SQL en `supabase/migrations/`
3. `npx supabase db reset` para correr todo desde cero
4. Validar RLS con seed multi-tenant (jr no puede ver proyectos de otros jr)
5. Sembrar los 10 playbooks base con sus 6-18 steps cada uno
6. Empezar Fase 1 con esta BD ya viva

---

*Generado por Claude Code · iteramos antes de programar*
