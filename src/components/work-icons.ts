/**
 * Iconos de los filtros de TIPO en Trabajo. Lineales, caja 14x14, trazo 1.5.
 * Cada valor es el contenido interno de un <svg viewBox="0 0 14 14">.
 * La pagina los inyecta con set:html: son cadenas estaticas del repo, no datos de usuario.
 */
import type { Tipo } from '../data/brands';

export const TIPO_ICONS: Record<Tipo, string> = {
  // bolsa de compra
  eCommerce:
    '<path d="M2.4 4.6h9.2l-.6 7a1 1 0 0 1-1 .9H4a1 1 0 0 1-1-.9l-.6-7Z"/><path d="M4.9 6V4.2a2.1 2.1 0 0 1 4.2 0V6"/>',
  // telefono con flecha de descarga
  PWA: '<rect x="3.4" y="1" width="7.2" height="12" rx="1.6"/><path d="M7 4.4v4M5.3 6.9 7 8.6l1.7-1.7"/><path d="M6 11.1h2"/>',
  // pagina con bloque hero
  'Landing page':
    '<rect x="1.6" y="1.6" width="10.8" height="10.8" rx="1.6"/><path d="M1.6 6.4h10.8M4 9.2h3.2M4 3.9h2"/>',
  // ventana de navegador
  'Sitio web':
    '<rect x="1.4" y="2.4" width="11.2" height="9.2" rx="1.6"/><path d="M1.4 5.4h11.2M3.7 3.9h.01M5.5 3.9h.01"/>',
  // contactos
  CRM: '<circle cx="5.2" cy="4.8" r="1.9"/><path d="M1.6 11.8a3.6 3.6 0 0 1 7.2 0"/><path d="M9.3 3.2a1.7 1.7 0 0 1 0 3.3M10.4 8.5a3.3 3.3 0 0 1 2 3.3"/>',
  // cubo
  ERP: '<path d="M7 1.4 12.2 4.2v5.6L7 12.6 1.8 9.8V4.2L7 1.4Z"/><path d="M1.8 4.2 7 7l5.2-2.8M7 7v5.6"/>',
  // nube
  SaaS: '<path d="M4.2 11.4a2.7 2.7 0 0 1-.4-5.3 3.6 3.6 0 0 1 6.9.7 2.3 2.3 0 0 1-.4 4.6H4.2Z"/>',
  // panel con controles deslizantes
  Backoffice:
    '<rect x="1.5" y="1.5" width="11" height="11" rx="1.6"/><path d="M4 5h1.2M8 5h2M4 9h3M9.6 9H10"/><circle cx="6.6" cy="5" r="1"/><circle cx="8.3" cy="9" r="1"/>',
};
