// § 00.LEAD — Vercel serverless function
// Recibe leads de /contacto/ y del brief /empecemos/ · valida payload
// reenvía a Slack + email (Resend)
// Env vars requeridas (configurar en Vercel):
//   - SLACK_WEBHOOK_URL  (opcional · si no existe, se omite el reenvío a Slack)
//   - RESEND_API_KEY     (opcional · si no existe, se omite el email)
//   - LEAD_NOTIFY_EMAIL  (destino · default: proyectos@ibisne.com)
//
// Diseño: idempotente, sin DB. La fuente de verdad sigue siendo el cliente
// (localStorage + state). Este endpoint solo notifica al equipo.

module.exports = async function handler(req, res) {
  // CORS / preflight — solo aceptamos POST same-origin
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Validación mínima del payload
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (_) { payload = null; }
  }
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // Honeypot anti-bot
  if (payload.website) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  // Sanitizar campos básicos (corta strings largas y deja números/booleans)
  const clean = (v, max = 500) => {
    if (v == null) return null;
    if (typeof v === 'string') return v.slice(0, max);
    if (typeof v === 'number' || typeof v === 'boolean') return v;
    if (typeof v === 'object') {
      try { return JSON.stringify(v).slice(0, max * 2); } catch (_) { return null; }
    }
    return null;
  };

  const lead = {
    nombre: clean(payload.nombre, 120),
    email: clean(payload.email, 200),
    telefono: clean(payload.telefono, 60),
    empresa: clean(payload.empresa, 200),
    vertical: clean(payload.vertical, 100),
    subtipo: clean(payload.subtipo, 100),
    total: clean(payload.total, 60),
    currency: clean(payload.currency, 10),
    moneda: clean(payload.moneda, 10),
    selecciones: clean(payload.selecciones, 2000),
    mensaje: clean(payload.mensaje, 2000),
    locale: clean(payload.locale, 10),
    // Brief de aterrizaje (/empecemos/). Sin estas claves el endpoint las
    // descartaria en silencio: solo se reenvia lo que esta en esta lista.
    origen: clean(payload.origen, 60),
    dominio: clean(payload.dominio, 200),
    redes: clean(payload.redes, 300),
    google_ficha: clean(payload.google_ficha, 40),
    correos_corp: clean(payload.correos_corp, 40),
    fecha_lanzamiento: clean(payload.fecha_lanzamiento, 40),
    urgencia: clean(payload.urgencia, 60),
    inversion: clean(payload.inversion, 60),
    // Promo de landing pages (/promos/landing-pages/). Sin estas tres claves el
    // lead llegaria sin saber que nivel eligio ni como pensaba pagarlo.
    plan: clean(payload.plan, 60),
    modalidad: clean(payload.modalidad, 80),
    metodo_pago: clean(payload.metodo_pago, 40),
    ua: clean(req.headers['user-agent'], 300),
    ts: new Date().toISOString(),
  };

  // Mínimo: necesitamos al menos nombre+email o telefono para que sea procesable
  const tieneContacto = lead.email || lead.telefono;
  if (!tieneContacto) {
    return res.status(400).json({ ok: false, error: 'missing_contact' });
  }

  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || 'proyectos@ibisne.com';

  const errors = [];
  const sent = {};

  // ─── Slack ───
  if (slackUrl) {
    try {
      const slackBody = {
        text: 'Nuevo lead iBisne · ' + (lead.nombre || lead.email || lead.telefono),
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Nuevo lead — iBisne' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: '*Nombre:* ' + (lead.nombre || '—') },
              { type: 'mrkdwn', text: '*Email:* ' + (lead.email || '—') },
              { type: 'mrkdwn', text: '*Teléfono:* ' + (lead.telefono || '—') },
              { type: 'mrkdwn', text: '*Empresa / proyecto:* ' + (lead.empresa || '—') },
              { type: 'mrkdwn', text: '*Origen:* ' + (lead.origen || lead.vertical || '—') },
              { type: 'mrkdwn', text: '*Nivel:* ' + (lead.subtipo || lead.plan || '—') },
              { type: 'mrkdwn', text: '*Forma de pago:* ' + (lead.modalidad || '—') },
              { type: 'mrkdwn', text: '*Urgencia:* ' + (lead.urgencia || '—') },
              { type: 'mrkdwn', text: '*Inversión:* ' + (lead.inversion || '—') },
              { type: 'mrkdwn', text: '*Lanzamiento:* ' + (lead.fecha_lanzamiento || '—') },
              { type: 'mrkdwn', text: '*Dominio:* ' + (lead.dominio || '—') },
              { type: 'mrkdwn', text: '*Redes:* ' + (lead.redes || '—') },
              { type: 'mrkdwn', text: '*Ficha Google:* ' + (lead.google_ficha || '—') },
              { type: 'mrkdwn', text: '*Correos corp.:* ' + (lead.correos_corp || '—') }
            ]
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: '*Selecciones:*\n```' + (lead.selecciones || '—') + '```' }
          }
        ]
      };
      if (lead.mensaje) {
        slackBody.blocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: '*Mensaje:*\n' + lead.mensaje }
        });
      }
      const r = await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackBody)
      });
      sent.slack = r.ok;
      if (!r.ok) errors.push('slack_' + r.status);
    } catch (e) {
      errors.push('slack_throw');
    }
  }

  // ─── Resend (email transactional) ───
  if (resendKey) {
    try {
      // Fila de tabla: se omite sola cuando el campo viene vacio, para que el
      // correo del brief no llegue lleno de guiones de campos que no aplican.
      const fila = (etiqueta, valor) =>
        valor ? '<tr><td style="border-bottom:1px solid #eee;"><b>' + etiqueta +
                '</b></td><td style="border-bottom:1px solid #eee;">' + valor + '</td></tr>' : '';

      const html = [
        '<h2 style="font-family:sans-serif;margin:0 0 4px 0;">Nuevo lead — iBisne</h2>',
        '<p style="font-family:sans-serif;color:#666;margin:0 0 16px 0;font-size:14px;">Origen: ' +
          (lead.origen || lead.vertical || 'sitio web') + ' · ' + lead.ts + '</p>',
        '<table cellpadding="6" cellspacing="0" style="font-family:sans-serif;border-collapse:collapse;">',
        fila('Nombre', lead.nombre),
        fila('Email', lead.email),
        fila('Teléfono', lead.telefono),
        fila('Empresa / proyecto', lead.empresa),
        fila('Dominio', lead.dominio),
        fila('Redes sociales', lead.redes),
        fila('Ficha en Google', lead.google_ficha),
        fila('Correos corporativos', lead.correos_corp),
        fila('Fecha de lanzamiento', lead.fecha_lanzamiento),
        fila('Urgencia', lead.urgencia),
        fila('Expectativa de inversión', lead.inversion),
        fila('Vertical', lead.vertical),
        fila('Nivel', lead.subtipo || lead.plan),
        fila('Forma de pago', lead.modalidad),
        fila('Método elegido', lead.metodo_pago),
        fila('Total', lead.total ? lead.total + ' ' + (lead.currency || lead.moneda || '') : null),
        fila('UA', lead.ua),
        '</table>'
      ];
      if (lead.selecciones) {
        html.push('<h3 style="font-family:sans-serif;margin-top:18px;">Selecciones</h3>');
        html.push('<pre style="font-family:monospace;background:#f4f4f4;padding:12px;border-radius:6px;white-space:pre-wrap;">' + lead.selecciones + '</pre>');
      }
      if (lead.mensaje) {
        html.push('<h3 style="font-family:sans-serif;margin-top:18px;">Mensaje</h3>');
        html.push('<p style="font-family:sans-serif;">' + lead.mensaje + '</p>');
      }
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + resendKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'iBisne <noreply@ibisne.com>',
          to: [notifyEmail],
          reply_to: lead.email || undefined,
          subject: 'Nuevo lead · ' + (lead.nombre || lead.email || lead.telefono) +
                   (lead.urgencia ? ' · ' + lead.urgencia : ''),
          html: html.join('')
        })
      });
      sent.resend = r.ok;
      if (!r.ok) errors.push('resend_' + r.status);
    } catch (e) {
      errors.push('resend_throw');
    }
  }

  // Si no hay integraciones configuradas, devolvemos ok pero indicamos noop
  if (!slackUrl && !resendKey) {
    return res.status(200).json({ ok: true, noop: true, hint: 'no integrations configured' });
  }

  if (errors.length && !sent.slack && !sent.resend) {
    return res.status(502).json({ ok: false, errors });
  }

  return res.status(200).json({ ok: true, sent, errors });
};
