-- ============================================================
-- iBisne CRM · Migration 0002 · Seed de 10 playbooks
-- ============================================================
-- Inserta los 10 templates de Living Coding con todos sus pasos.
-- Basado en docs/crm/PLAYBOOKS.md
--
-- Asunciones tomadas (revisar y ajustar después con Eduardo):
-- - Tiempos son estimados iniciales (Eduardo ajusta con data real)
-- - Brief lo cierra cliente (aprobador = 'cliente')
-- - Master doc lo llena KAM (aprobador = 'senior')
-- - Tech stack siempre aprueba Founder
-- - Bio-link SIN sitemap ni wireframe (es 1 página)
-- - App iOS y Android nativas se agrupan en "App híbrida"
-- ============================================================

-- ─── Playbook 1 · BIO-LINK SIMPLE ──────────────────────────
do $$
declare
  pb_id uuid;
  s_id  uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Bio-link simple',
    'bio-link',
    'Bio-link tipo Linktree para creators / negocios pequeños. Página única vertical con foto, descripción, links a redes y CTA principal.',
    '{"plataforma":"Hostinger","framework":"HTML+CSS","cms":null,"animaciones":null,"servicios":{"analytics":null}}'::jsonb,
    9, 14.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1, 'Master doc del cliente',           'input',   'kam',    'senior',  1.0),
    (pb_id, 2, 'Brief simple (5 preguntas)',       'input',   'kam',    'cliente', 1.0),
    (pb_id, 3, 'Discovery quick · 15 min',         'input',   'kam',    'senior',  0.5),
    (pb_id, 4, 'Tech stack default',               'review',  'arquitecto', 'founder', 0.5),
    (pb_id, 5, 'Recolectar assets (foto, links)',  'input',   'junior', 'kam',     1.0),
    (pb_id, 6, 'Diseñar página HTML + CSS',        'build',   'junior', 'senior',  4.0),
    (pb_id, 7, 'QA mobile-first',                  'review',  'junior', 'senior',  1.0),
    (pb_id, 8, 'Deploy Hostinger + dominio',       'deploy',  'senior', 'arquitecto', 2.0),
    (pb_id, 9, 'Capacitación 15 min + handoff',    'handoff', 'kam',    'founder', 1.0);
end $$;

-- ─── Playbook 2 · LANDING ANIMADA ──────────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Landing animada',
    'landing',
    'Landing de 1 página con animaciones cinemáticas, captura de email, secciones storytelling. Lanzamiento de producto, evento, campaña.',
    '{"plataforma":"Vercel","framework":"Astro","cms":null,"animaciones":"GSAP","servicios":{"analytics":"Plausible","emails":"Resend"}}'::jsonb,
    13, 40.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',                  'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief landing (objetivo conversión)',     'input',   'kam',    'cliente', 3.0),
    (pb_id, 3,  'Discovery call · 30 min',                 'input',   'kam',    'senior',  1.0),
    (pb_id, 4,  'Tech stack default (Astro + GSAP)',       'review',  'arquitecto', 'founder', 1.0),
    (pb_id, 5,  'Wireframe single-page',                   'build',   'junior', 'senior',  3.0),
    (pb_id, 6,  'Storyboard de animaciones',               'build',   'junior', 'senior',  4.0),
    (pb_id, 7,  'Moodboard + tokens visuales',             'build',   'junior', 'senior',  4.0),
    (pb_id, 8,  'Maquetado responsive',                    'build',   'junior', 'senior',  8.0),
    (pb_id, 9,  'Implementación animaciones GSAP',         'build',   'junior', 'senior',  6.0),
    (pb_id, 10, 'Captura email + Resend integration',      'build',   'junior', 'senior',  2.0),
    (pb_id, 11, 'QA mobile + Lighthouse > 90',             'review',  'junior', 'senior',  3.0),
    (pb_id, 12, 'Deploy Vercel + dominio + Plausible',     'deploy',  'senior', 'arquitecto', 2.0),
    (pb_id, 13, 'Handoff (cómo editar copy)',              'handoff', 'kam',    'founder', 1.0);
end $$;

-- ─── Playbook 3 · PÁGINA DE LEADS (QUIZ) ───────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Página de leads (quiz)',
    'leads-page',
    'Quiz tipo "encuestar para cualificar" antes de que el lead llegue al equipo. Mismo concepto que el quiz de ibisne.com.',
    '{"plataforma":"Vercel","framework":"Next 14","cms":"MDX","servicios":{"analytics":"Plausible","crm_webhook":true}}'::jsonb,
    11, 35.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',              'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief · scoring lógico',              'input',   'kam',    'cliente', 4.0),
    (pb_id, 3,  'Discovery call + scoring sesión',     'input',   'kam',    'senior',  2.0),
    (pb_id, 4,  'Tech stack (Next + scoring)',         'review',  'arquitecto', 'founder', 1.0),
    (pb_id, 5,  'Árbol de preguntas (sitemap quiz)',   'build',   'junior', 'senior',  4.0),
    (pb_id, 6,  'Lógica scoring + ramas',              'build',   'senior', 'arquitecto', 4.0),
    (pb_id, 7,  'UI mobile-first + transiciones',      'build',   'junior', 'senior',  6.0),
    (pb_id, 8,  'Webhook a CRM cliente',               'build',   'senior', 'arquitecto', 4.0),
    (pb_id, 9,  'QA + A/B inicial',                    'review',  'junior', 'senior',  3.0),
    (pb_id, 10, 'Deploy + funnels Plausible',          'deploy',  'senior', 'arquitecto', 3.0),
    (pb_id, 11, 'Capacitación (leer leads)',           'handoff', 'kam',    'founder', 2.0);
end $$;

-- ─── Playbook 4 · SITIO COMPLETO ───────────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Sitio web completo',
    'sitio-completo',
    'Hub de marca multi-página con CMS editable, blog, contacto, animaciones cinemáticas, SEO crítico.',
    '{"plataforma":"Vercel","framework":"Next 15","cms":"Sanity","animaciones":"GSAP","servicios":{"analytics":"Plausible","emails":"Resend"}}'::jsonb,
    12, 85.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',          'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief aprobado',                  'input',   'kam',    'cliente', 4.0),
    (pb_id, 3,  'Discovery call · resumen',        'input',   'kam',    'senior',  1.5),
    (pb_id, 4,  'Tech stack declarado',            'review',  'arquitecto', 'founder', 2.0),
    (pb_id, 5,  'Sitemap aprobado',                'build',   'junior', 'cliente', 4.0),
    (pb_id, 6,  'Wireframing aprobado',            'build',   'junior', 'senior',  8.0),
    (pb_id, 7,  'Design system / moodboard',       'build',   'junior', 'senior',  8.0),
    (pb_id, 8,  'MVP / prototipo navegable',       'build',   'junior', 'senior',  16.0),
    (pb_id, 9,  'Desarrollo final',                'build',   'junior', 'senior',  32.0),
    (pb_id, 10, 'QA cross-browser',                'review',  'junior', 'senior',  6.0),
    (pb_id, 11, 'Deploy producción',               'deploy',  'senior', 'arquitecto', 3.0),
    (pb_id, 12, 'Capacitación + handoff',          'handoff', 'kam',    'founder', 4.0);
end $$;

-- ─── Playbook 5 · SINGLE PRODUCT (ECOM 1) ──────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Single product (ecommerce 1 producto)',
    'single-product',
    'Landing optimizada para vender UN producto · pago directo Stripe · sin catálogo.',
    '{"plataforma":"Vercel","framework":"Next 15","cms":null,"pagos":"Stripe","servicios":{"emails":"Resend","analytics":"Plausible"}}'::jsonb,
    12, 50.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',          'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief producto + pricing',        'input',   'kam',    'cliente', 3.0),
    (pb_id, 3,  'Discovery + Stripe setup',        'input',   'kam',    'senior',  1.0),
    (pb_id, 4,  'Tech stack (Next + Stripe)',      'review',  'arquitecto', 'founder', 1.0),
    (pb_id, 5,  'Setup Stripe + productos',        'build',   'senior', 'arquitecto', 3.0),
    (pb_id, 6,  'Wireframe page',                  'build',   'junior', 'senior',  4.0),
    (pb_id, 7,  'Design + tokens producto',        'build',   'junior', 'senior',  6.0),
    (pb_id, 8,  'Desarrollo + Stripe integration', 'build',   'junior', 'senior',  16.0),
    (pb_id, 9,  'Email confirmación (Resend)',     'build',   'junior', 'senior',  3.0),
    (pb_id, 10, 'QA flujo compra completo',        'review',  'junior', 'senior',  4.0),
    (pb_id, 11, 'Deploy + analytics conversión',   'deploy',  'senior', 'arquitecto', 3.0),
    (pb_id, 12, 'Capacitación cobros',             'handoff', 'kam',    'founder', 4.0);
end $$;

-- ─── Playbook 6 · ECOMMERCE SHOPIFY ────────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Ecommerce Shopify',
    'shopify',
    'Tienda Shopify con tema custom personalizado, catálogo gestionado por el cliente.',
    '{"plataforma":"Shopify","framework":"Liquid","cms":"Shopify Admin","pagos":"Shopify Payments","servicios":{"apps":["Klaviyo","Reviews"]}}'::jsonb,
    12, 70.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',                'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief Shopify (envíos, fiscal)',        'input',   'kam',    'cliente', 5.0),
    (pb_id, 3,  'Discovery + setup Shopify Plan',        'input',   'kam',    'senior',  2.0),
    (pb_id, 4,  'Tech stack (Shopify + apps)',           'review',  'arquitecto', 'founder', 1.0),
    (pb_id, 5,  'Setup tienda + envíos + fiscal MX',     'build',   'senior', 'arquitecto', 6.0),
    (pb_id, 6,  'Carga catálogo inicial (cliente CSV)',  'input',   'cliente','kam',     4.0),
    (pb_id, 7,  'Diseño tema custom (Figma)',            'build',   'junior', 'senior',  8.0),
    (pb_id, 8,  'Desarrollo tema Liquid',                'build',   'senior', 'arquitecto', 20.0),
    (pb_id, 9,  'Configurar apps (Klaviyo, reviews)',    'build',   'junior', 'senior',  6.0),
    (pb_id, 10, 'QA flujo compra + envío MX',            'review',  'junior', 'senior',  5.0),
    (pb_id, 11, 'Deploy tienda live + dominio',          'deploy',  'senior', 'arquitecto', 4.0),
    (pb_id, 12, 'Capacitación admin Shopify',            'handoff', 'kam',    'founder', 7.0);
end $$;

-- ─── Playbook 7 · ECOMMERCE HEADLESS ───────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'Ecommerce headless',
    'headless-commerce',
    'Frontend custom + backend headless · máximo control, velocidad y SEO.',
    '{"plataforma":"Vercel","framework":"Next 15","ecom":"Medusa","pagos":"Stripe","servicios":{"cdn":"Cloudflare","emails":"Resend"}}'::jsonb,
    13, 120.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',              'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief headless · integraciones',      'input',   'kam',    'cliente', 6.0),
    (pb_id, 3,  'Discovery profundo + planning',       'input',   'kam',    'senior',  3.0),
    (pb_id, 4,  'Tech stack headless',                 'review',  'arquitecto', 'founder', 2.0),
    (pb_id, 5,  'Setup Medusa backend + admin',        'build',   'senior', 'arquitecto', 12.0),
    (pb_id, 6,  'Carga inicial productos',             'build',   'junior', 'senior',  8.0),
    (pb_id, 7,  'Sitemap + wireframe frontend',        'build',   'junior', 'senior',  6.0),
    (pb_id, 8,  'Design system ecom',                  'build',   'junior', 'senior',  12.0),
    (pb_id, 9,  'Desarrollo frontend Next',            'build',   'senior', 'arquitecto', 36.0),
    (pb_id, 10, 'Stripe + envíos integration',         'build',   'senior', 'arquitecto', 12.0),
    (pb_id, 11, 'QA · stress test 1000 productos',     'review',  'junior', 'senior',  10.0),
    (pb_id, 12, 'Deploy · CDN · monitoring',           'deploy',  'arquitecto', 'founder', 6.0),
    (pb_id, 13, 'Capacitación admin Medusa',           'handoff', 'kam',    'founder', 5.0);
end $$;

-- ─── Playbook 8 · APP HÍBRIDA (RN/Expo) ────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'App híbrida (React Native + Expo)',
    'app-hybrida',
    'App móvil iOS + Android compartiendo código · publicada en App Store + Play Store.',
    '{"plataforma":"AppStore+PlayStore","framework":"React Native","tooling":"Expo + EAS","backend":"Supabase","servicios":{"push":"Expo Notifications","analytics":"PostHog"}}'::jsonb,
    15, 150.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',                'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief app (features, plataformas)',    'input',   'kam',    'cliente', 6.0),
    (pb_id, 3,  'Discovery + roadmap feature',          'input',   'kam',    'senior',  4.0),
    (pb_id, 4,  'Tech stack (RN + Expo)',                'review',  'arquitecto', 'founder', 3.0),
    (pb_id, 5,  'Crear cuenta Apple Dev + Google Play', 'input',   'cliente','kam',     4.0),
    (pb_id, 6,  'Wireframe + flow pantallas',           'build',   'junior', 'senior',  12.0),
    (pb_id, 7,  'Design system mobile',                 'build',   'junior', 'senior',  16.0),
    (pb_id, 8,  'Setup Expo + Supabase',                'build',   'senior', 'arquitecto', 8.0),
    (pb_id, 9,  'Desarrollo auth + pantallas core',     'build',   'junior', 'senior',  50.0),
    (pb_id, 10, 'Push notifications + analytics',       'build',   'senior', 'arquitecto', 8.0),
    (pb_id, 11, 'QA devices reales (5 modelos)',        'review',  'junior', 'senior',  12.0),
    (pb_id, 12, 'Screenshots stores + ASO',              'build',   'kam',    'cliente', 6.0),
    (pb_id, 13, 'Build & submit · App Store',           'deploy',  'senior', 'arquitecto', 8.0),
    (pb_id, 14, 'Build & submit · Play Store',          'deploy',  'senior', 'arquitecto', 5.0),
    (pb_id, 15, 'Capacitación + analytics dashboard',   'handoff', 'kam',    'founder', 6.0);
end $$;

-- ─── Playbook 9 · SAAS CUSTOM ──────────────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'SaaS custom',
    'saas-custom',
    'Producto digital con subscripción mensual · auth multi-tenant · dashboard admin.',
    '{"plataforma":"Vercel","framework":"Next 15","db":"Supabase","pagos":"Stripe Billing","auth":"Supabase Auth","servicios":{"emails":"Resend","errors":"Sentry","analytics":"PostHog"}}'::jsonb,
    15, 200.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',              'input',   'kam',    'senior',  3.0),
    (pb_id, 2,  'Brief SaaS · features + pricing',     'input',   'kam',    'cliente', 8.0),
    (pb_id, 3,  'Discovery + roadmap (3 meses)',       'input',   'kam',    'senior',  4.0),
    (pb_id, 4,  'Tech stack SaaS',                     'review',  'arquitecto', 'founder', 3.0),
    (pb_id, 5,  'Schema BD (multi-tenant + roles)',    'build',   'senior', 'arquitecto', 8.0),
    (pb_id, 6,  'Sitemap + wireframe (15+ pantallas)', 'build',   'junior', 'senior',  14.0),
    (pb_id, 7,  'Design system extensivo',             'build',   'junior', 'senior',  20.0),
    (pb_id, 8,  'Setup auth + roles + RLS',            'build',   'senior', 'arquitecto', 12.0),
    (pb_id, 9,  'Stripe Billing (3-4 tiers)',          'build',   'senior', 'arquitecto', 12.0),
    (pb_id, 10, 'MVP feature 1',                       'build',   'senior', 'arquitecto', 24.0),
    (pb_id, 11, 'Features 2-N (iteración)',            'build',   'senior', 'arquitecto', 60.0),
    (pb_id, 12, 'Admin dashboard interno',             'build',   'junior', 'senior',  16.0),
    (pb_id, 13, 'QA + load testing',                   'review',  'senior', 'arquitecto', 10.0),
    (pb_id, 14, 'Deploy producción + monitoring',      'deploy',  'arquitecto', 'founder', 4.0),
    (pb_id, 15, 'Handoff + docs admin',                'handoff', 'kam',    'founder', 4.0);
end $$;

-- ─── Playbook 10 · AI CHATBOT ──────────────────────────────
do $$
declare pb_id uuid;
begin
  insert into public.playbooks (nombre, tipo_proyecto, descripcion, tech_stack_default, total_steps, tiempo_total_h)
  values (
    'AI chatbot (RAG)',
    'ai-chatbot',
    'Chatbot inteligente con RAG sobre docs del cliente · embebible en sitios web.',
    '{"plataforma":"Vercel","framework":"Next 15","llm":"OpenAI","vectordb":"Pinecone","servicios":{"feedback":"Built-in","analytics":"Custom"}}'::jsonb,
    15, 80.0
  ) returning id into pb_id;

  insert into public.playbook_steps (playbook_id, orden, nombre, tipo, rol_minimo, aprobador_rol, tiempo_estimado_h) values
    (pb_id, 1,  'Master doc del cliente',              'input',   'kam',    'senior',  2.0),
    (pb_id, 2,  'Brief chatbot · use case + docs',     'input',   'kam',    'cliente', 4.0),
    (pb_id, 3,  'Discovery + sesión "qué responde"',   'input',   'kam',    'senior',  3.0),
    (pb_id, 4,  'Tech stack AI',                        'review',  'arquitecto', 'founder', 2.0),
    (pb_id, 5,  'Recolectar y limpiar docs cliente',   'input',   'junior', 'senior',  6.0),
    (pb_id, 6,  'Setup OpenAI + Pinecone',             'build',   'senior', 'arquitecto', 3.0),
    (pb_id, 7,  'Pipeline embeddings · ingesta',       'build',   'senior', 'arquitecto', 8.0),
    (pb_id, 8,  'Prompt engineering + system prompts', 'build',   'senior', 'arquitecto', 8.0),
    (pb_id, 9,  'UI chat (mobile-first)',              'build',   'junior', 'senior',  8.0),
    (pb_id, 10, 'Backend retrieval + streaming',       'build',   'senior', 'arquitecto', 10.0),
    (pb_id, 11, 'Feedback system (👍👎)',              'build',   'junior', 'senior',  4.0),
    (pb_id, 12, 'Embed widget en sitio cliente',       'build',   'junior', 'senior',  4.0),
    (pb_id, 13, 'QA · 50 conversaciones reales',       'review',  'senior', 'arquitecto', 6.0),
    (pb_id, 14, 'Deploy + dashboard analytics',        'deploy',  'senior', 'arquitecto', 4.0),
    (pb_id, 15, 'Handoff + iterar prompts',            'handoff', 'kam',    'founder', 4.0);
end $$;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Después de ejecutar, verificar:
-- SELECT nombre, tipo_proyecto, total_steps, tiempo_total_h
--   FROM playbooks ORDER BY tiempo_total_h;
--
-- SELECT p.nombre, count(*) AS pasos
--   FROM playbooks p
--   JOIN playbook_steps ps ON ps.playbook_id = p.id
--  GROUP BY p.nombre;
-- ============================================================
