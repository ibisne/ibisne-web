/** Datos y vinculos de Contacto. Un solo lugar para telefono, correo, redes y opciones. */

export const WA_NUMBER = '523337237525';
export const WA_BASE = `https://wa.me/${WA_NUMBER}`;
export const PHONE_LABEL = '33 3723 7525';
export const PHONE_HREF = 'tel:+523337237525';
export const EMAIL = 'proyectos@ibisne.com';
export const INSTAGRAM = { handle: '@ibisnemx', href: 'https://www.instagram.com/ibisnemx' };
export const FACEBOOK = { handle: '/ibisnecom', href: 'https://www.facebook.com/ibisnecom' };

/** Mensaje prellenado de WhatsApp para un interes concreto */
export const waLink = (interest: string): string =>
  `${WA_BASE}?text=${encodeURIComponent(`Hola iBisne, me interesa: ${interest}.`)}`;

export type IconName =
  | 'android'
  | 'ios'
  | 'bag'
  | 'browser'
  | 'landing'
  | 'cube'
  | 'compass'
  | 'chat';

export interface ContactOption {
  label: string;
  /** Texto corto para los tiles compactos de movil (una linea). Si falta, se usa label */
  short?: string;
  /** Sublinea opcional bajo el titulo */
  sub?: string;
  icon: IconName;
  /** Texto que viaja en el mensaje de WhatsApp */
  message: string;
}

export const OPTIONS: ContactOption[] = [
  { label: 'App Android', icon: 'android', message: 'App Android' },
  { label: 'App iOS', icon: 'ios', message: 'App iOS' },
  { label: 'eCommerce', icon: 'bag', message: 'eCommerce' },
  { label: 'Sitio web', icon: 'browser', message: 'Sitio web' },
  { label: 'Landing page', icon: 'landing', message: 'Landing page' },
  {
    label: 'Sistema a la medida',
    short: 'Sistema a la medida',
    sub: 'CRM, ERP, SaaS o Backoffice',
    icon: 'cube',
    message: 'Sistema a la medida: CRM, ERP, SaaS o Backoffice',
  },
  {
    label: 'Asesoría para implementar tecnología en tu empresa',
    short: 'Asesoría tech',
    icon: 'compass',
    message: 'Asesoría para implementar tecnología en mi empresa',
  },
  { label: 'Otra cosa', icon: 'chat', message: 'Otra cosa' },
];

/** Iconos lineales propios, caja 20x20, trazo 1.5 (el motivo ocupa 18px). Contenido estatico y confiable. */
export const ICONS: Record<IconName, string> = {
  android:
    '<path d="M3.5 10.5a6.5 6.5 0 0 1 13 0z"/><path d="M6.6 3.4 7.9 5.2M13.4 3.4 12.1 5.2"/><path d="M3.5 12.5h13v3a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8z"/><path d="M8 8h.01M12 8h.01"/>',
  ios: '<rect x="5" y="1.75" width="10" height="16.5" rx="2.4"/><path d="M8.4 4.3h3.2"/><path d="M8.5 16h3"/>',
  bag: '<path d="M4 6.5h12l-.9 10a1.2 1.2 0 0 1-1.2 1.1H6.1a1.2 1.2 0 0 1-1.2-1.1z"/><path d="M7.2 8.7V6.4a2.8 2.8 0 0 1 5.6 0v2.3"/>',
  browser:
    '<rect x="1.75" y="3.5" width="16.5" height="13" rx="2.2"/><path d="M1.75 7.6h16.5"/><path d="M4.6 5.55h.01M6.6 5.55h.01"/>',
  landing:
    '<rect x="3.5" y="1.75" width="13" height="16.5" rx="2.2"/><rect x="6.3" y="4.9" width="7.4" height="3.6" rx=".9"/><path d="M6.5 11.4h7M6.5 14.2h4.6"/>',
  cube: '<path d="M10 1.9 17.3 6v8L10 18.1 2.7 14V6z"/><path d="M2.9 6.1 10 10.2l7.1-4.1M10 10.2v7.8"/>',
  compass:
    '<circle cx="10" cy="10" r="8.1"/><path d="M13.1 6.9 11.3 11.3 6.9 13.1 8.7 8.7z"/>',
  chat: '<path d="M3.4 3.6h13.2a1.3 1.3 0 0 1 1.3 1.3v7.6a1.3 1.3 0 0 1-1.3 1.3H9.2L5.6 17v-3.2H3.4a1.3 1.3 0 0 1-1.3-1.3V4.9a1.3 1.3 0 0 1 1.3-1.3z"/>',
};

/** Icono lineal de WhatsApp (globo con cola y auricular), caja 20x20 */
export const WHATSAPP_ICON =
  '<path d="M10 2.1a7.9 7.9 0 0 0-6.8 11.9L2.1 17.9l4-1.05A7.9 7.9 0 1 0 10 2.1z"/><path d="M7.5 6.4c-.35.4-.5 1-.2 1.8.5 1.3 1.6 2.6 3 3.3.9.4 1.5.4 2-.1l.4-.7-1.5-.9-.6.5c-.8-.3-1.7-1.2-2-2l.5-.6-.9-1.5z"/>';

/** Iconos lineales de la fila de contacto movil (telefono, correo, Instagram, Facebook), caja 20x20, trazo 1.5 */
export const SOCIAL_ICONS = {
  phone:
    '<path d="M5.7 2.75h2.2l1.2 3.4-1.6 1.15a9.4 9.4 0 0 0 5.2 5.2l1.15-1.6 3.4 1.2v2.2a1.9 1.9 0 0 1-2.05 1.9A13.8 13.8 0 0 1 3.8 4.8a1.9 1.9 0 0 1 1.9-2.05z"/>',
  mail: '<rect x="2.25" y="4" width="15.5" height="12" rx="2.2"/><path d="m2.9 5.6 7.1 5.4 7.1-5.4"/>',
  instagram:
    '<rect x="2.5" y="2.5" width="15" height="15" rx="4.4"/><circle cx="10" cy="10" r="3.5"/><path d="M14.35 5.65h.01"/>',
  facebook: '<path d="M11.6 17.5v-6.4h2.2l.4-2.6h-2.6V6.9c0-.8.4-1.4 1.5-1.4h1.2V3.3A14 14 0 0 0 12.5 3C10.5 3 9.1 4.2 9.1 6.4v2.1H7v2.6h2.1v6.4"/>',
} as const;
