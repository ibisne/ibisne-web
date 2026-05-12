/**
 * iBisne CRM · Drizzle schema completo
 * --------------------------------------------------------------
 * Mapea 1:1 a sql/0001_init_schema.sql + sql/0002_playbooks_seed.sql
 *
 * Usage:
 *   import { db } from './db';
 *   import { leads, clientes, proyectos } from './schema';
 *
 *   const allLeads = await db.select().from(leads).where(eq(leads.stage, 'cotizacion_enviada'));
 *
 * IMPORTANTE: cuando cambies el SQL, actualiza este archivo también.
 * --------------------------------------------------------------
 */

import {
  pgTable, pgEnum, uuid, text, timestamp, integer, smallint, numeric,
  boolean, jsonb, date, primaryKey, uniqueIndex, index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── ENUMS ───────────────────────────────────────────────────

export const userRole = pgEnum('user_role', [
  'founder', 'kam', 'arquitecto', 'senior', 'junior', 'cliente', 'reseller'
]);

export const leadStage = pgEnum('lead_stage', [
  'prospecto', 'lead_calificado', 'cotizacion_enviada', 'en_discovery',
  'negociacion', 'contrato_firmado', 'cliente_activo', 'lost'
]);

export const leadSource = pgEnum('lead_source', ['quiz', 'manual', 'referido', 'inbound']);

export const clienteTipo = pgEnum('cliente_tipo', ['persona', 'empresa']);

export const proyectoStatus = pgEnum('proyecto_status', [
  'borrador', 'cotizado', 'firmado', 'kickoff', 'discovery',
  'en_produccion', 'qa', 'entregado', 'mantenimiento', 'pausado', 'cancelado'
]);

export const briefStatus = pgEnum('brief_status', ['pendiente', 'en_progreso', 'completo', 'aprobado']);
export const contratoStatus = pgEnum('contrato_status', ['borrador', 'enviado', 'firmado', 'cancelado']);

export const pagoTipo = pgEnum('pago_tipo', ['anticipo', 'entrega', 'hito', 'mensualidad', 'unico']);
export const pagoStatus = pgEnum('pago_status', ['programado', 'enviado', 'pagado', 'vencido', 'cancelado']);
export const pagoMetodo = pgEnum('pago_metodo', ['paypal', 'stripe', 'transferencia', 'oxxo', 'efectivo', 'crypto', 'mp']);

export const suscripcionTier = pgEnum('suscripcion_tier', ['foundation', 'growth', 'scale', 'holding']);
export const suscripcionStatus = pgEnum('suscripcion_status', ['trial', 'activa', 'pausada', 'cancelada', 'morosa']);

export const resellerStatus = pgEnum('reseller_status', ['pendiente', 'activo', 'pausado', 'cancelado']);
export const comisionStatus = pgEnum('comision_status', ['devengada', 'aprobada', 'pagada', 'cancelada']);

export const notifChannel = pgEnum('notif_channel', ['email', 'slack', 'in_app']);
export const notifStatus = pgEnum('notif_status', ['queued', 'sent', 'failed', 'cancelled']);

export const playbookTipo = pgEnum('playbook_tipo', [
  'bio-link', 'landing', 'leads-page', 'sitio-completo',
  'single-product', 'shopify', 'headless-commerce', 'marketplace',
  'app-ios-nativa', 'app-android-nativa', 'app-hybrida', 'mvp-nocode',
  'ai-chatbot', 'web3-dapp', 'saas-custom', 'otro-custom'
]);

export const stepTipo = pgEnum('step_tipo', ['input', 'review', 'build', 'deploy', 'handoff']);

export const projectStepStatus = pgEnum('project_step_status', [
  'bloqueado', 'pendiente', 'en_progreso', 'en_revision', 'completo', 'rechazado'
]);

export const resourceTipo = pgEnum('resource_tipo', ['figma', 'video', 'doc', 'link', 'template', 'example']);

// ── TABLAS ──────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  nombre: text('nombre'),
  role: userRole('role').notNull().default('cliente'),
  clienteId: uuid('cliente_id'),
  resellerId: uuid('reseller_id'),
  capacidadHorasSemana: smallint('capacidad_horas_semana').default(40),
  especialidades: text('especialidades').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex('idx_users_email').on(t.email),
  roleIdx: index('idx_users_role').on(t.role),
}));

export const resellers = pgTable('resellers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono'),
  rfc: text('rfc'),
  empresa: text('empresa'),
  linkSlug: text('link_slug').notNull().unique(),
  comisionPct: numeric('comision_pct', { precision: 5, scale: 2 }).notNull().default('10.00'),
  status: resellerStatus('status').notNull().default('pendiente'),
  banco: text('banco'),
  cuentaClabe: text('cuenta_clabe'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  email: text('email').unique(),
  telefono: text('telefono'),
  rfc: text('rfc'),
  tipo: clienteTipo('tipo').notNull().default('empresa'),
  direccionFiscal: text('direccion_fiscal'),
  esReferido: boolean('es_referido').notNull().default(false),
  resellerId: uuid('reseller_id').references(() => resellers.id),
  notas: text('notas'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const marcas = pgTable('marcas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(),
  logoUrl: text('logo_url'),
  industria: text('industria'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  labelEn: text('label_en'),
  color: text('color'),
  orden: smallint('orden').notNull(),
  isTerminal: boolean('is_terminal').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre'),
  email: text('email'),
  telefono: text('telefono'),
  empresa: text('empresa'),
  vertical: text('vertical'),
  subtipo: text('subtipo'),
  totalMxn: numeric('total_mxn', { precision: 12, scale: 2 }),
  currency: text('currency').default('MXN'),
  selecciones: jsonb('selecciones'),
  stage: leadStage('stage').notNull().default('prospecto'),
  source: leadSource('source').notNull().default('quiz'),
  resellerId: uuid('reseller_id').references(() => resellers.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  score: smallint('score').default(0),
  notas: text('notas'),
  convertedToClienteId: uuid('converted_to_cliente_id').references(() => clientes.id),
  locale: text('locale').default('es'),
  ua: text('ua'),
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  stageIdx: index('idx_leads_stage').on(t.stage),
  assignedIdx: index('idx_leads_assigned').on(t.assignedTo),
  createdIdx: index('idx_leads_created').on(t.createdAt),
}));

// ── LIVING CODING ───────────────────────────────────────────

export const playbooks = pgTable('playbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  tipoProyecto: playbookTipo('tipo_proyecto').notNull(),
  descripcion: text('descripcion'),
  techStackDefault: jsonb('tech_stack_default').notNull(),
  totalSteps: smallint('total_steps').notNull().default(0),
  tiempoTotalH: numeric('tiempo_total_h', { precision: 5, scale: 1 }),
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const playbookSteps = pgTable('playbook_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  playbookId: uuid('playbook_id').notNull().references(() => playbooks.id, { onDelete: 'cascade' }),
  orden: smallint('orden').notNull(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  tipo: stepTipo('tipo').notNull(),
  rolMinimo: userRole('rol_minimo').notNull().default('junior'),
  aprobadorRol: userRole('aprobador_rol'),
  tiempoEstimadoH: numeric('tiempo_estimado_h', { precision: 4, scale: 1 }).default('4'),
  inputsRequeridos: jsonb('inputs_requeridos'),
  outputsEsperados: jsonb('outputs_esperados'),
  checklist: jsonb('checklist'),
  unlocksNext: boolean('unlocks_next').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  playbookIdx: index('idx_playbook_steps_playbook').on(t.playbookId),
  uniqueOrden: uniqueIndex('uq_playbook_steps_orden').on(t.playbookId, t.orden),
}));

export const stepResources = pgTable('step_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  playbookStepId: uuid('playbook_step_id').notNull().references(() => playbookSteps.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(),
  tipo: resourceTipo('tipo').notNull(),
  url: text('url').notNull(),
  descripcion: text('descripcion'),
  orden: smallint('orden').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const proyectos = pgTable('proyectos', {
  id: uuid('id').primaryKey().defaultRandom(),
  marcaId: uuid('marca_id').notNull().references(() => marcas.id, { onDelete: 'cascade' }),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  playbookId: uuid('playbook_id').references(() => playbooks.id),
  nombre: text('nombre').notNull(),
  vertical: text('vertical'),
  subtipo: text('subtipo'),
  totalMxn: numeric('total_mxn', { precision: 12, scale: 2 }).notNull().default('0'),
  // total_iva_mxn es GENERATED COLUMN · no se mapea en Drizzle, queryear directo si se necesita
  currency: text('currency').default('MXN'),
  selecciones: jsonb('selecciones'),
  status: proyectoStatus('status').notNull().default('borrador'),
  folio: integer('folio').unique(),
  kickoffDate: date('kickoff_date'),
  entregaDate: date('entrega_date'),
  fechaRealEntrega: date('fecha_real_entrega'),
  pmUserId: uuid('pm_user_id').references(() => users.id),
  pdfCotizacionUrl: text('pdf_cotizacion_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const techStacks = pgTable('tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  proyectoId: uuid('proyecto_id').notNull().unique().references(() => proyectos.id, { onDelete: 'cascade' }),
  plataforma: text('plataforma'),
  framework: text('framework'),
  cms: text('cms'),
  db: text('db'),
  pagos: text('pagos'),
  servicios: jsonb('servicios'),
  justificacion: text('justificacion'),
  declaradoPor: uuid('declarado_por').references(() => users.id),
  aprobadoPor: uuid('aprobado_por').references(() => users.id),
  declaradoAt: timestamp('declarado_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectSteps = pgTable('project_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id, { onDelete: 'cascade' }),
  playbookStepId: uuid('playbook_step_id').notNull().references(() => playbookSteps.id),
  orden: smallint('orden').notNull(),
  nombre: text('nombre').notNull(),
  status: projectStepStatus('status').notNull().default('bloqueado'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  approverId: uuid('approver_id').references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  tiempoRealH: numeric('tiempo_real_h', { precision: 5, scale: 2 }),
  outputs: jsonb('outputs'),
  checklistState: jsonb('checklist_state').default(sql`'{}'::jsonb`),
  notas: text('notas'),
  bloqueador: text('bloqueador'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectStepOutputs = pgTable('project_step_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectStepId: uuid('project_step_id').notNull().references(() => projectSteps.id, { onDelete: 'cascade' }),
  version: smallint('version').notNull(),
  tipo: text('tipo').notNull(),  // 'figma_link', 'pdf_upload', 'github_pr', 'video'
  url: text('url').notNull(),
  notas: text('notas'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  status: text('status').notNull().default('submitted'),  // 'submitted', 'approved', 'rejected'
  reviewNotes: text('review_notes'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
}, (t) => ({
  uniqueVersion: uniqueIndex('uq_outputs_version').on(t.projectStepId, t.version),
}));

export const briefs = pgTable('briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id, { onDelete: 'cascade' }),
  status: briefStatus('status').notNull().default('pendiente'),
  fillRate: smallint('fill_rate').notNull().default(0),
  respuestas: jsonb('respuestas').notNull().default(sql`'{}'::jsonb`),
  enviadoAt: timestamp('enviado_at', { withTimezone: true }),
  iniciadoAt: timestamp('iniciado_at', { withTimezone: true }),
  completadoAt: timestamp('completado_at', { withTimezone: true }),
  aprobadoAt: timestamp('aprobado_at', { withTimezone: true }),
  aprobadoBy: uuid('aprobado_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contratos = pgTable('contratos', {
  id: uuid('id').primaryKey().defaultRandom(),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id, { onDelete: 'cascade' }),
  status: contratoStatus('status').notNull().default('borrador'),
  pdfUrl: text('pdf_url'),
  signedPdfUrl: text('signed_pdf_url'),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  signedByEmail: text('signed_by_email'),
  montoMxn: numeric('monto_mxn', { precision: 12, scale: 2 }),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const suscripciones = pgTable('suscripciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  tier: suscripcionTier('tier').notNull(),
  status: suscripcionStatus('status').notNull().default('activa'),
  priceMxn: numeric('price_mxn', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('MXN'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  nextChargeDate: date('next_charge_date'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  beneficioConsumidoHoras: numeric('beneficio_consumido_horas', { precision: 8, scale: 2 }).default('0'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pagos = pgTable('pagos', {
  id: uuid('id').primaryKey().defaultRandom(),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id, { onDelete: 'cascade' }),
  suscripcionId: uuid('suscripcion_id').references(() => suscripciones.id, { onDelete: 'cascade' }),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  montoMxn: numeric('monto_mxn', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('MXN'),
  tipo: pagoTipo('tipo').notNull(),
  status: pagoStatus('status').notNull().default('programado'),
  metodo: pagoMetodo('metodo'),
  dueDate: date('due_date').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  stripeSessionId: text('stripe_session_id'),
  reciboUrl: text('recibo_url'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const comisiones = pgTable('comisiones', {
  id: uuid('id').primaryKey().defaultRandom(),
  resellerId: uuid('reseller_id').notNull().references(() => resellers.id),
  leadId: uuid('lead_id').references(() => leads.id),
  clienteId: uuid('cliente_id').references(() => clientes.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  pagoId: uuid('pago_id').references(() => pagos.id),
  montoMxn: numeric('monto_mxn', { precision: 12, scale: 2 }).notNull(),
  porcentaje: numeric('porcentaje', { precision: 5, scale: 2 }).notNull(),
  status: comisionStatus('status').notNull().default('devengada'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  channel: notifChannel('channel').notNull(),
  template: text('template').notNull(),
  recipient: text('recipient').notNull(),
  payload: jsonb('payload'),
  status: notifStatus('status').notNull().default('queued'),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).defaultNow(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  error: text('error'),
  relatedLeadId: uuid('related_lead_id').references(() => leads.id),
  relatedClienteId: uuid('related_cliente_id').references(() => clientes.id),
  relatedProyectoId: uuid('related_proyecto_id').references(() => proyectos.id),
  relatedPagoId: uuid('related_pago_id').references(() => pagos.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  diff: jsonb('diff'),
  ip: text('ip'),
  ua: text('ua'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── TYPE EXPORTS ────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type NewCliente = typeof clientes.$inferInsert;
export type Proyecto = typeof proyectos.$inferSelect;
export type NewProyecto = typeof proyectos.$inferInsert;
export type Playbook = typeof playbooks.$inferSelect;
export type PlaybookStep = typeof playbookSteps.$inferSelect;
export type ProjectStep = typeof projectSteps.$inferSelect;
export type NewProjectStep = typeof projectSteps.$inferInsert;
export type Pago = typeof pagos.$inferSelect;
export type Reseller = typeof resellers.$inferSelect;
export type Comision = typeof comisiones.$inferSelect;
