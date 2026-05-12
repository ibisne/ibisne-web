# iBisne CRM — Arquitectura Técnica

> **Versión**: 0.2 (expansión Living Coding · Camino A aprobado)
> **Fecha**: 2026-05
> **Scope**: MVP 1 · CRM Admin + Living Coding workflow · **10-14 semanas**
>
> **v0.2 incluye**: pipeline + clientes + cobros (CRM clásico) **más** capa Living
> Coding completa: roles (founder/kam/arquitecto/senior/junior/cliente/reseller),
> playbooks, project_steps, tech_stacks, drawer de paso detalle. Schema completo
> en `SCHEMA.md §9`.

---

## 1. Visión rápida

```
┌─────────────────────────────────────────────────────────────────┐
│  Cliente final  →  ibisne.com (sitio público v3)                │
│                       │                                          │
│                       │  POST /api/lead  (ya existe v3.15)       │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Supabase Postgres  (single source of truth)           │     │
│  │  - tabla leads · clientes · marcas · proyectos · pagos │     │
│  │  - briefs · contratos · comisiones · suscripciones     │     │
│  │  - RLS policies por rol (admin vs cliente)             │     │
│  └────────────────────────────────────────────────────────┘     │
│           │                            │                         │
│           ▼                            ▼                         │
│   crm.ibisne.com               app.ibisne.com (Fase 3)          │
│   (Next.js · admin)            (Next.js · portal cliente)       │
│   Eduardo + equipo             Clientes finales                 │
└─────────────────────────────────────────────────────────────────┘

Integraciones (servicios externos):
- Resend     →  emails transaccionales + newsletter
- Stripe     →  cobros one-time + subs (Fase 5)
- Slack      →  notificaciones internas de leads (ya wired)
- Sentry     →  error logging
- Plausible  →  analytics
```

---

## 2. Stack confirmado

| Capa | Tecnología | Por qué |
|---|---|---|
| **Frontend** | Next.js 15 + App Router + TypeScript | Server Components + Actions reduce código y red trips. TS estricto evita bugs. |
| **Estilo** | CSS Modules + VAULT v2 tokens importados | Sin Tailwind para no fragmentar el design system. Reutiliza 100% de `tokens.css`. |
| **Componentes UI** | Propios (extensión de VAULT) + Radix Primitives sin estilos | Radix da a11y (Dialog, Tabs, Combobox) sin imponer estética. |
| **State** | Server Components + URL state + Zustand mínimo | No Redux. State del lado del cliente solo donde haga falta (kanban drag). |
| **Backend** | Supabase (Postgres + Auth + Storage + Realtime) | BD madura + auth + storage en una sola plataforma. Realtime para kanban colaborativo. |
| **ORM** | Drizzle | TypeScript-first, queries SQL-like, migrations en git. Más simple que Prisma. |
| **Auth** | Supabase Auth · magic link email | Sin password = menos UX friction · sin password leaks. Google OAuth como upsell. |
| **Hosting** | Vercel (frontend) + Supabase (DB) | Mismo stack que el sitio público · deploys git-push. |
| **Email** | Resend | Ya wired en `/api/lead` del sitio · misma API. |
| **Files** | Supabase Storage | Contratos PDF, briefs adjuntos. RLS policies = seguridad. |
| **Forms** | React Hook Form + Zod | Validación cliente + servidor con el mismo schema TS. |
| **Kanban** | `@dnd-kit/core` | Sin dependencias pesadas, accesible. |
| **Tablas** | `@tanstack/react-table` headless | Sin estilos impuestos · usamos VAULT. |
| **Gráficos** | `recharts` minimal o SVG propios | Dashboard usa pocos charts · evitar bundles enormes. |

---

## 3. Estructura del repo

**Opción A · Monorepo** (recomendado si el sitio v3 va a sumar componentes compartidos):
```
ibisne-web/
├─ apps/
│  ├─ web/           ← sitio público actual (lo que ya hay en root)
│  └─ crm/           ← Next.js CRM nuevo
├─ packages/
│  └─ design-system-v2/  ← tokens + componentes compartibles
└─ supabase/
   └─ migrations/    ← versionado de schema
```

**Opción B · Repo separado** (más simple, recomendado para MVP):
```
ibisne-crm/         ← nuevo repo de Next.js + Drizzle + Supabase
ibisne-web/         ← repo actual queda igual
```

> **Mi voto**: Opción B (repo separado). El sitio web v3 es maduro y vanilla, mezclar
> con Next.js complica el deploy. En Fase 5+ migramos a monorepo si la sinergia lo
> justifica.

---

## 4. Estructura de carpetas (Next.js CRM)

```
ibisne-crm/
├─ app/
│  ├─ (auth)/
│  │  └─ login/
│  ├─ (admin)/          ← layout con sidebar
│  │  ├─ dashboard/
│  │  ├─ pipeline/
│  │  ├─ leads/[id]/
│  │  ├─ clientes/[id]/
│  │  ├─ proyectos/[id]/
│  │  ├─ pagos/
│  │  └─ settings/
│  ├─ (cliente)/        ← Fase 3 · layout distinto
│  │  ├─ mi-cuenta/
│  │  ├─ briefs/
│  │  └─ pagos/
│  └─ api/
│     ├─ lead/          ← migra el /api/lead actual del sitio
│     └─ webhook/       ← Stripe webhooks (Fase 5)
├─ components/
│  ├─ ui/               ← componentes base (Button, Input, Card)
│  ├─ kanban/
│  ├─ dashboard/
│  └─ tables/
├─ lib/
│  ├─ db.ts             ← Drizzle client
│  ├─ schema.ts         ← Drizzle schema
│  ├─ supabase.ts       ← Supabase client (server + browser)
│  └─ resend.ts
├─ styles/
│  ├─ tokens.css        ← copia de VAULT v2
│  └─ globals.css
├─ supabase/
│  └─ migrations/
│     ├─ 0001_init.sql
│     ├─ 0002_pipeline.sql
│     └─ ...
├─ middleware.ts        ← protege rutas /admin/* y /cliente/*
├─ drizzle.config.ts
├─ next.config.js
├─ package.json
└─ tsconfig.json
```

---

## 5. Autenticación y autorización

### Auth flow
1. Usuario va a `crm.ibisne.com/login` → mete su email
2. Supabase manda magic link vía Resend (custom SMTP)
3. Click → callback verifica → session cookie HttpOnly
4. `middleware.ts` valida sesión en cada request a `/(admin)/*` y `/(cliente)/*`

### Roles (RBAC mínimo para MVP1)
| Rol | Acceso | Cómo se asigna |
|---|---|---|
| `admin` | Toda la BD · todas las rutas `/admin/*` | Manual en tabla `users.role` (Eduardo + equipo) |
| `cliente` | Solo SUS registros · solo `/cliente/*` | Auto al primer login con email que matchea un `cliente.email` |
| `reseller` | Solo SUS comisiones (Fase 4) | Manual desde admin |

### Row Level Security (RLS) en Postgres
Cada tabla con `created_by uuid` y policies:
- `admin`: full select/insert/update/delete en todo
- `cliente`: solo registros donde `cliente.id = auth.uid()`'s cliente_id
- `reseller`: solo registros donde `comision.reseller_id = auth.uid()`

> Esto es **lo más importante de seguridad**. Sin RLS, cualquier cliente podría leer
> datos de otros. Lo configuramos desde la migración inicial.

---

## 6. Modelo de datos (entidades core)

> Detalle completo en `SCHEMA.md`. Aquí solo el mapa.

```
lead (capturado del quiz)
  ↓ (al convertirse en oportunidad real)
cliente (persona o empresa contratante)
  ↓ (puede tener N marcas)
marca (Coca-Cola, Pepsi · cada cliente puede tener varias)
  ↓ (cada marca puede tener N proyectos)
proyecto (web, app, etc · uno por cotización)
  ├─ brief (formulario por llenar/llenado)
  ├─ contrato (PDF firmable)
  ├─ pagos[] (anticipo, entrega, hitos)
  └─ suscripcion (si membership activa)

reseller (agencia/partner)
  ├─ comisiones[] (por lead/cliente referido)

settings (org wide)
notifications (queue de emails enviados/programados)
audit_log (quién hizo qué)
```

---

## 7. Pipeline (etapas Kanban)

Default · ajustable desde admin:

```
[Prospecto]  →  [Lead calificado]  →  [Cotización enviada]  →  [En discovery]
                                                                    ↓
                                              [Contrato firmado]  ← [Negociación]
                                                    ↓
                                              [Cliente activo]  →  [Renovación]
                                                                    ↓
                                                                  [Lost]
```

Cada lead tiene un `stage` (FK a tabla `pipeline_stages`). Drag&drop en kanban = update
del campo + log de cambio en `audit_log`.

---

## 8. Notificaciones

### Email transaccional (Resend)
Disparado en eventos:
- Nuevo lead llega → notif a `proyectos@ibisne.com` (ya wired en `/api/lead`)
- Cliente firma contrato → notif a admin + bienvenida a cliente
- Pago confirmado → recibo al cliente + notif admin
- Brief 3 días sin llenar → recordatorio cliente
- Próximo pago a 7 días → recordatorio cliente
- Membership renueva en 14 días → notif cliente

### Newsletter (Resend Audiences o Brevo)
- Lista mensual a leads no convertidos
- Lista para clientes activos
- Templates con tokens VAULT

### Slack
Mismo webhook que `/api/lead` actual del sitio web v3.

---

## 9. Infra y deployment

### Servicios
| Servicio | Plan | Mensual | Para qué |
|---|---|---|---|
| Vercel | Hobby (escala a Pro a >100GB-h/mes) | $0-20 | Frontend Next.js |
| Supabase | Pro | $25 | DB 8GB + auth ilimitada + 100GB transferencia |
| Resend | Starter | $20 | 50k emails/mes + custom domain |
| Sentry | Developer | $0 | 5k events/mes (gratis) |
| Plausible | Hobby | $9 | Analytics privacy-first |
| Cloudflare | Free | $0 | DNS + DDoS |
| **Total estimado** | | **$54-74/mes** | Cabe en budget $50-150 |

### Dominios
- `crm.ibisne.com` → CRM admin (CNAME a Vercel)
- `app.ibisne.com` → portal cliente (CNAME a Vercel) [Fase 3]
- `partners.ibisne.com` → portal revendedores [Fase 4]
- `api.ibisne.com` → opcional, si se separan endpoints más adelante

### CI/CD
- GitHub push a `main` → Vercel preview
- Merge a `production` → deploy a producción
- Migraciones SQL aplican via GitHub Action manual (no auto)

### Secrets (env vars Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     ← solo server-side
RESEND_API_KEY
SLACK_WEBHOOK_URL
LEAD_NOTIFY_EMAIL
SENTRY_DSN
STRIPE_SECRET_KEY              ← Fase 5
STRIPE_WEBHOOK_SECRET          ← Fase 5
```

---

## 10. Performance + scalability targets

- **First load JS** < 200 KB (sin charts en dashboard inicial)
- **Database queries** < 100ms p95 (índices en `cliente_id`, `stage`, `created_at`)
- **Lighthouse score** > 90 en mobile (admin no es prioritario móvil pero igual)
- **Concurrent users** target: 10 admins + 50 clientes simultáneos en MVP1 → Supabase Pro maneja sin problema

---

## 11. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Curva Next.js 15 + Drizzle si no se ha usado antes | Media | Bajo | Hay 30+ tutoriales · Server Actions simplifica vs API REST |
| Diseñar schema mal y migrarlo después | Media | Alto | Validar `SCHEMA.md` con Eduardo antes de codear. Migraciones versionadas. |
| Costos de Supabase escalan si datos crecen mucho | Baja (MVP1) | Medio | Pro plan da 8GB · suficiente para 10k leads + 1k clientes. Después de eso, Team plan. |
| RLS mal configurada = leak entre clientes | Media | Crítico | Tests automáticos con seed data multi-cliente antes de habilitar portal cliente. |
| Vendor lock-in con Supabase | Baja | Bajo | Es Postgres puro. Exportable a cualquier provider en horas. |

---

## 12. Roadmap MVP1 (4 semanas detalle)

### Semana 1 — Setup + Dashboard
- Día 1-2: repo, Next.js, Supabase project, Vercel deploy, env vars
- Día 3-4: schema base (leads, clientes, marcas, proyectos, pagos) + migraciones
- Día 5: layout admin con sidebar nav · dashboard skeleton con KPIs hardcodeados

### Semana 2 — Pipeline + CRUDs
- Día 1-2: pipeline Kanban con drag&drop
- Día 3: CRUD Leads (lista + detalle + create + edit)
- Día 4: CRUD Clientes (lista + detalle con tabs: marcas, proyectos, pagos)
- Día 5: CRUD Proyectos (lista + detalle con tabs: brief, contrato, pagos)

### Semana 3 — Datos vivos + Migración
- Día 1-2: conectar dashboard con KPIs reales (queries Postgres)
- Día 3: migrar `/api/lead` del sitio v3 a Supabase (compatible con webhook actual)
- Día 4: notificaciones email (4 templates iniciales)
- Día 5: auth + middleware + RLS · primer test de seguridad

### Semana 4 — Polish + Validación
- Día 1-2: edge cases · responsive · empty states
- Día 3: import inicial de leads existentes desde `localStorage` (si hay)
- Día 4: validación con Eduardo · ajustes
- Día 5: deploy producción · onboarding equipo iBisne

### Semana 5-6 — Buffer / Portal Cliente arranca

---

## 13. Decisiones abiertas para validar

| # | Pregunta | Recomendación |
|---|---|---|
| 1 | ¿Repo separado o monorepo? | Repo separado (`ibisne-crm`) para MVP, monorepo en Fase 5+ |
| 2 | ¿Magic link o password tradicional? | Magic link (menos friction · más seguro) |
| 3 | ¿shadcn/ui o componentes 100% propios? | Componentes propios sobre Radix Primitives sin estilos |
| 4 | ¿Drizzle o Prisma? | Drizzle (más rápido, SQL-like, mejor TS) |
| 5 | ¿Subdomains o paths? | Subdomains (`crm.ibisne.com`, `app.ibisne.com`) |
| 6 | ¿Inglés o español en código? | Español en UI · inglés en código (variables, comentarios) |
| 7 | ¿Importar leads del v3 actual? | Sí · hay un sync inicial de `localStorage` → Supabase |
| 8 | ¿Membership economics rediseño antes del CRM? | Paralelo · el plan del sitio público sigue activo |

---

## 14. Roadmap actualizado · Camino A (10-14 semanas)

### Sprint 1 · Setup + foundation (semanas 1-2)
- Repo `ibisne-crm`, Next 15, Supabase, Vercel
- Schema base + Living Coding tables + RLS por rol
- Auth magic link + roles (founder/kam/arquitecto/sr/jr/cliente/reseller)
- Sidebar + topbar v2 + breadcrumbs + ⌘K palette
- Login + Mi día skeleton

### Sprint 2 · CRM core (semanas 3-4)
- Pipeline kanban + Leads tabla + filtros
- CRUD Clientes + marcas
- Migración del webhook actual `/api/lead` del sitio público

### Sprint 3 · Proyectos + Living Coding base (semanas 5-7)
- CRUD proyectos
- Playbook library (admin) · seed con los 10 playbooks
- Mi proyecto (Jr workspace) · timeline de pasos
- Paso detalle (drawer) · checklist + recursos + comentarios
- Tech stack declaration form

### Sprint 4 · Cobros + Suscripciones (semanas 8-9)
- Calendario de cobros + alertas
- Stripe Checkout (one-time)
- Stripe Billing (subs)

### Sprint 5 · Portal cliente (semanas 10-11)
- Login del cliente
- Ver sus briefs, contratos, pagos
- Aprobaciones de wireframes/sitemap desde portal cliente

### Sprint 6 · Portal revendedores + polish (semanas 12-14)
- Alta de reseller + link de referido con UTM
- Comisiones dashboard
- Notificaciones email + Slack
- QA · seeders · documentación

---

## 15. Próximos pasos

1. **Eduardo valida este doc** + `SCHEMA.md` + 9 wireframes
2. Ajustes basados en feedback
3. Crear repo `ibisne-crm` + setup inicial (Sprint 1 día 1)
4. Sprint Semana 1 arranca

---

*Generado por Claude Code · revisar antes de codear · iterativo*
