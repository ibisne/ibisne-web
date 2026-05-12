// § 00.LEAD — Vercel serverless function
// Recibe leads del quiz · valida payload · reenvía a Slack + email (Resend)
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
            text: { type: 'plain_text', text: 'Nuevo lead — iBisne quiz' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: '*Nombre:* ' + (lead.nombre || '—') },
              { type: 'mrkdwn', text: '*Email:* ' + (lead.email || '—') },
              { type: 'mrkdwn', text: '*Teléfono:* ' + (lead.telefono || '—') },
              { type: 'mrkdwn', text: '*Empresa:* ' + (lead.empresa || '—') },
              { type: 'mrkdwn', text: '*Vertical:* ' + (lead.vertical || '—') },
              { type: 'mrkdwn', text: '*Subtipo:* ' + (lead.subtipo || '—') },
              { type: 'mrkdwn', text: '*Total:* ' + (lead.total || '—') + ' ' + (lead.currency || lead.moneda || '') },
              { type: 'mrkdwn', text: '*Locale:* ' + (lead.locale || '—') }
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
      const html = [
        '<h2 style="font-family:sans-serif;margin:0 0 12px 0;">Nuevo lead — iBisne quiz</h2>',
        '<table cellpadding="6" cellspacing="0" style="font-family:sans-serif;border-collapse:collapse;">',
        '<tr><td><b>Nombre</b></td><td>' + (lead.nombre || '—') + '</td></tr>',
        '<tr><td><b>Email</b></td><td>' + (lead.email || '—') + '</td></tr>',
        '<tr><td><b>Teléfono</b></td><td>' + (lead.telefono || '—') + '</td></tr>',
        '<tr><td><b>Empresa</b></td><td>' + (lead.empresa || '—') + '</td></tr>',
        '<tr><td><b>Vertical</b></td><td>' + (lead.vertical || '—') + '</td></tr>',
        '<tr><td><b>Subtipo</b></td><td>' + (lead.subtipo || '—') + '</td></tr>',
        '<tr><td><b>Total</b></td><td>' + (lead.total || '—') + ' ' + (lead.currency || lead.moneda || '') + '</td></tr>',
        '<tr><td><b>Locale</b></td><td>' + (lead.locale || '—') + '</td></tr>',
        '<tr><td><b>UA</b></td><td>' + (lead.ua || '—') + '</td></tr>',
        '</table>',
        '<h3 style="font-family:sans-serif;margin-top:18px;">Selecciones</h3>',
        '<pre style="font-family:monospace;background:#f4f4f4;padding:12px;border-radius:6px;white-space:pre-wrap;">' + (lead.selecciones || '—') + '</pre>'
      ];
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
          from: 'iBisne quiz <noreply@ibisne.com>',
          to: [notifyEmail],
          reply_to: lead.email || undefined,
          subject: 'Nuevo lead · ' + (lead.nombre || lead.email || lead.telefono),
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
