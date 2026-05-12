# iBisne CRM · Quickstart Sprint 1

> **Para**: Eduardo y el primer dev que arranca el repo
> **Tiempo total estimado**: ~6h (de cero a "primera pantalla viva")
> **Stack**: Next 15 + Supabase + Drizzle + Vercel

---

## Antes de empezar · checklist de cuentas

Necesitas tener listas estas cuentas (15 min):

- [ ] **GitHub** account con SSH key configurada · `gh auth login`
- [ ] **Vercel** account vinculada a GitHub
- [ ] **Supabase** account · cuenta gratis sirve para empezar (Pro a $25 cuando hay datos reales)
- [ ] **Resend** account · API key listo
- [ ] **Slack** webhook URL del canal donde llegan leads (ya existe)
- [ ] **Dominio** comprado: `crm.ibisne.com` apuntando a Vercel (CNAME)

---

## Paso 1 · Crear el repo (10 min)

```bash
# Crea el repo localmente
mkdir ibisne-crm && cd ibisne-crm
git init
git remote add origin git@github.com:ibisne/ibisne-crm.git

# Inicializa Next.js 15 con TypeScript + App Router
npx create-next-app@latest . \
  --typescript \
  --eslint \
  --app \
  --src-dir=false \
  --no-tailwind \
  --import-alias="@/*"

# Instala dependencias core
npm install \
  drizzle-orm \
  postgres \
  @supabase/supabase-js \
  @supabase/ssr \
  zod \
  react-hook-form \
  @hookform/resolvers \
  @tanstack/react-table \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-tabs \
  lucide-react \
  date-fns \
  resend

# Dev dependencies
npm install -D \
  drizzle-kit \
  @types/node \
  tsx

# Primer commit
git add . && git commit -m "init: Next 15 + TS + dependencies"
git push -u origin main
```

---

## Paso 2 · Crear proyecto Supabase (10 min)

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard) → New project
2. Nombre: `ibisne-crm-prod` (o `dev` si arrancas en staging)
3. Region: `us-east-1` (más cerca de MX)
4. Password: genera uno fuerte (guarda en 1Password)
5. Espera ~2 min a que cree la BD

Copia desde **Settings → API**:
- `Project URL` (https://xxx.supabase.co)
- `anon public` key
- `service_role` key (NUNCA al cliente)

---

## Paso 3 · Aplicar el SQL (5 min)

Tienes 2 opciones:

### Opción A · Supabase SQL Editor (más rápido)
1. Ve a tu proyecto → **SQL Editor** → New query
2. Copia el contenido de `docs/crm/setup/sql/0001_init_schema.sql`
3. Pega y ejecuta · debe decir "Success. No rows returned."
4. Repite con `docs/crm/setup/sql/0002_playbooks_seed.sql`

### Opción B · Supabase CLI (recomendado para CI/CD)
```bash
# Instala CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref tu-project-ref

# Copia los SQL a supabase/migrations/
mkdir -p supabase/migrations
cp ../docs/crm/setup/sql/*.sql supabase/migrations/

# Push migrations
supabase db push
```

### Verifica
```sql
SELECT nombre, tipo_proyecto, total_steps, tiempo_total_h
  FROM playbooks
  ORDER BY tiempo_total_h;
```

Debe devolver **10 filas** (Bio-link, Landing, ..., AI chatbot).

---

## Paso 4 · Variables de entorno (5 min)

Crea `.env.local` en la raíz del repo:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.tu-proyecto.supabase.co:5432/postgres

# Resend
RESEND_API_KEY=re_...
LEAD_NOTIFY_EMAIL=proyectos@ibisne.com

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Sentry (opcional · Fase 4)
# SENTRY_DSN=...
```

Agrega a `.gitignore`:
```
.env.local
.env*.local
```

---

## Paso 5 · Copiar archivos boilerplate (10 min)

```bash
# Drizzle schema
mkdir -p lib
cp ../docs/crm/setup/lib/schema.ts lib/schema.ts

# Crea lib/db.ts (cliente Drizzle)
cat > lib/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
EOF

# Crea lib/supabase.ts (cliente Supabase server)
cat > lib/supabase.ts << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch { /* server component */ }
        },
      },
    }
  );
}
EOF

# Copia los tokens VAULT v2 a tu CSS
mkdir -p styles
cp ../docs/crm/wireframes/_shared.css styles/tokens.css
# NOTA: limpia los wireframe-only styles (banner) cuando arranques
```

---

## Paso 6 · Crear estructura de carpetas (5 min)

```bash
# App router · grupos por rol
mkdir -p app/\(auth\)/login
mkdir -p app/\(admin\)/{dashboard,pipeline,leads,clientes,proyectos,cobros,playbooks,settings}
mkdir -p app/\(coder\)/{mi-dia,mi-proyecto,revisiones}
mkdir -p app/\(cliente\)/{mi-cuenta,briefs,pagos,approvals}
mkdir -p app/\(reseller\)/{dashboard,leads,comisiones}
mkdir -p app/api/{lead,webhook}
mkdir -p components/{ui,kanban,timeline,drawer}
```

---

## Paso 7 · Primera pantalla · Login (45 min)

Crea `app/(auth)/login/page.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (!error) setSent(true);
  }

  return (
    <div className="login-shell">
      {/* TODO: copiar markup desde docs/crm/wireframes/01-login.html */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ibisne.com"
          required
        />
        <button type="submit">Enviar link mágico</button>
      </form>
      {sent && <div>Revisa tu correo</div>}
    </div>
  );
}
```

Y `app/auth/callback/route.ts`:
```ts
import { getSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL('/mi-dia', req.url));
}
```

---

## Paso 8 · Middleware · proteger rutas por rol (30 min)

Crea `middleware.ts` en la raíz:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rutas públicas
  const publicPaths = ['/login', '/auth/callback', '/'];
  const isPublic = publicPaths.some((p) => req.nextUrl.pathname.startsWith(p));

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // TODO: leer user.role desde public.users y redirigir según rol
  // - founder/kam/arq/sr → /mi-dia (admin)
  // - junior → /mi-proyecto (coder workspace)
  // - cliente → /mi-cuenta (portal cliente)
  // - reseller → /partners (portal reseller)

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Paso 9 · Deploy a Vercel (15 min)

```bash
# Login Vercel
npm i -g vercel
vercel login

# Deploy
vercel

# Configura env vars en Vercel dashboard
# Settings → Environment Variables → pega lo de .env.local
```

Apunta `crm.ibisne.com` (CNAME en tu DNS) → `cname.vercel-dns.com`.

---

## Paso 10 · Plan de Sprint 1 día a día

| Día | Tareas | Output |
|---|---|---|
| 1 | Pasos 1-4 (setup + SQL aplicado) | BD lista · proyecto vacío |
| 2 | Pasos 5-7 (Drizzle + login funcional) | Magic link envía email |
| 3 | Pasos 8-9 (middleware + deploy) | crm.ibisne.com vivo con login |
| 4-5 | Sidebar v2 + topbar v2 + ⌘K · usar markup de wireframe 00 | Mi día skeleton con sidebar |
| 6-7 | Conectar Mi día con datos reales · leads pendientes | Mi día con datos vivos de BD |
| 8-10 | Pipeline kanban + tabla Leads (CRUD) | Operación básica de pipeline |
| 11-14 | Mi proyecto + Paso detalle (Living Coding) | Jr puede ejecutar pasos |

---

## Cuando tengas dudas

- **Schema cambia** → edita `lib/schema.ts` + crea nueva migration SQL en `supabase/migrations/`
- **Tokens visuales** → ya están en `styles/tokens.css` desde `_shared.css`
- **Componentes UI** → copia el markup de `docs/crm/wireframes/*.html` y conviértelos a React
- **Logic de roles** → tabla `users.role` enum tiene 7 valores

---

## Lo que NO está en este quickstart (Fase 2+)

- Stripe Checkout + Billing
- Resend templates de email
- Slack webhook real
- Tests (vitest + Playwright)
- Sentry + analytics
- Empty states / error states
- Mobile optimization

Esto se agrega en Sprints 2-6 según el roadmap de `ARCHITECTURE.md §14`.

---

## Si todo va bien

A las **6 horas tienes**:
- crm.ibisne.com con login funcional
- Magic link te llega al correo
- Después de click, te lleva a `/mi-dia`
- BD con 10 playbooks ya sembrados
- Sidebar con la nav del wireframe 00
- Vercel deploy automático en cada push a `main`

A los **5 días**:
- Pipeline kanban funcional con drag&drop
- CRUD de leads
- Webhook `/api/lead` recibiendo del sitio público v3.15

A las **2 semanas**:
- Sprint 1 completo · listo para Sprint 2 (CRUDs de Cliente/Proyecto/Cobros)

---

*Si algo se rompe, los wireframes y SCHEMA.md son fuente de verdad. Esta guía solo te lleva a producción mínima viable.*
