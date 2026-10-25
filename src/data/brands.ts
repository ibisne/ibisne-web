import type { ImageMetadata } from 'astro';

import logoIbroker from '../assets/logos/ibroker.png';
import logoNeoterre from '../assets/logos/neoterre.png';
import logoThcc from '../assets/logos/thcc.svg';
import logoSem from '../assets/logos/sem.png';
import logoDci from '../assets/logos/dci.png';
import logoMedical from '../assets/logos/medical-mexicanna.png';
import logoOtomi from '../assets/logos/otomi.png';
import logoFarmacias from '../assets/logos/farmacias-hernandez.png';
import logoSteelbeird from '../assets/logos/steelbeird.png';
import logoSemilla from '../assets/logos/semilla.png';
import logoUnframe from '../assets/logos/unframe.png';
import logoDistenvases from '../assets/logos/distenvases.png';
import logoAcefap from '../assets/logos/acefap.png';
import logoIpools from '../assets/logos/ipools.png';
import logoDocer from '../assets/logos/docer.png';
import logoAlbercasvip from '../assets/logos/albercasvip.png';
import logoCgcac from '../assets/logos/cgcac.png';
import logoEndomap from '../assets/logos/endomap.png';
import logoCluster from '../assets/logos/cluster.svg';

import mkIbroker from '../assets/mockups/ibroker.webp';
import mkNeoterre from '../assets/mockups/neoterre.webp';
import mkThcc from '../assets/mockups/thcc.webp';
import mkSem from '../assets/mockups/sem.webp';
import mkDci from '../assets/mockups/dci.webp';
import mkMedical from '../assets/mockups/medical-mexicanna.webp';
import mkOtomi from '../assets/mockups/otomi.webp';
import mkFarmacias from '../assets/mockups/farmacias-hernandez.webp';
import mkSteelbeird from '../assets/mockups/steelbeird.webp';
import mkSemilla from '../assets/mockups/semilla.webp';
import mkUnframe from '../assets/mockups/unframe.webp';
import mkAlbercasvip from '../assets/mockups/albercasvip.webp';
import mkEndomap from '../assets/mockups/endomap.webp';
import mkAlbercasopia from '../assets/mockups/albercasopia.webp';
import mkDigitalife from '../assets/mockups/digitalife.webp';
import mkRancho from '../assets/mockups/rancho-contento.webp';

export type Nicho =
  | 'Construcción'
  | 'Salud y bienestar'
  | 'Alimentos y bebidas'
  | 'Turismo y hospitalidad'
  | 'Industria y comercio'
  | 'Educación y servicios';

export type Tipo =
  | 'eCommerce'
  | 'PWA'
  | 'Landing page'
  | 'Sitio web'
  | 'CRM'
  | 'ERP'
  | 'SaaS'
  | 'Backoffice';

export const NICHOS: Nicho[] = [
  'Construcción',
  'Salud y bienestar',
  'Alimentos y bebidas',
  'Turismo y hospitalidad',
  'Industria y comercio',
  'Educación y servicios',
];

export const TIPOS: Tipo[] = [
  'eCommerce',
  'PWA',
  'Landing page',
  'Sitio web',
  'CRM',
  'ERP',
  'SaaS',
  'Backoffice',
];

export interface Brand {
  slug: string;
  name: string;
  /** Logo blanco. null = la UI pinta el placeholder "LOGO PENDIENTE". */
  logo: ImageMetadata | null;
  /** Captura horizontal real. null = sin captura disponible. */
  mockup: ImageMetadata | null;
  nicho: Nicho;
  tipos: Tipo[];
  /** Solo si está publicada en las páginas del sitio viejo. */
  url?: string;
  year?: number;
  stack?: string[];
  /** Alcance en 1-2 frases, para el modal "Ver resumen técnico". */
  resumen?: string;
  /** Producto propio de iBisne. */
  propio?: boolean;
}

// TIPOS PROVISIONALES: confirmar con Eduardo
// Orden = el de la pantalla Trabajo en Figma (frame 26:2).
// year: ninguna ficha del sitio viejo declara año de proyecto (el 2026 que aparece es el
// copyright), por eso queda ausente. url con host *.ibisne-apps.com = demo de staging
// publicada en la ficha vieja; confirmar si se muestra como enlace público.
export const brands: Brand[] = [
  {
    slug: 'ibroker',
    name: 'iBroker',
    logo: logoIbroker,
    mockup: mkIbroker,
    nicho: 'Construcción',
    tipos: ['CRM'],
    url: 'https://ibroker.com.mx',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards'],
    resumen:
      'CRM inmobiliario que automatiza el seguimiento de cada prospecto y publica propiedades en minutos. Un panel que trabaja solo para que el bróker capture menos y cierre más.',
    propio: true,
  },
  {
    slug: 'neoterre',
    name: 'Neoterre',
    logo: logoNeoterre,
    mockup: mkNeoterre,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://www.neoterre.org/es',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards'],
    resumen:
      'Web inmobiliaria con CRM de leads: catálogo de desarrollos y captación, con una identidad sobria y contemporánea.',
  },
  {
    slug: 'thcc',
    name: 'THCC',
    logo: logoThcc,
    mockup: mkThcc,
    nicho: 'Salud y bienestar',
    tipos: ['eCommerce'],
    url: 'https://www.thcc.com.mx',
    stack: ['Next.js', 'Checkout propio', 'Asistente IA', 'i18n', 'Vercel'],
    resumen:
      'Tienda multimarca que ordena varias marcas bajo un mismo catálogo, con verificación de edad, carrito, buscador y filtros, tres idiomas y un asistente conversacional que devuelve tarjetas de producto comparables dentro del chat.',
  },
  {
    slug: 'sem',
    name: 'SEM (Semillas Endémicas Mexicanna)',
    logo: logoSem,
    mockup: mkSem,
    nicho: 'Salud y bienestar',
    tipos: ['SaaS'],
    url: 'https://sem-org.com',
    stack: ['Next.js', 'React', 'Tailwind', 'CMS', 'Vercel'],
    resumen:
      'Centro de mando que concentra, como un marketplace, todos los sistemas dados de alta: un ecommerce que unifica el ecosistema de marcas en una sola plataforma.',
  },
  {
    slug: 'dci',
    name: 'DCI de la Península',
    logo: logoDci,
    mockup: mkDci,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://www.inmobiliariadci.com',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards'],
    resumen:
      'Conjunto inmobiliario enfocado en la península de Yucatán: catálogo de inmuebles validados con lógica de inversión y CRM de leads.',
  },
  {
    slug: 'medical-mexicanna',
    name: 'Medical Mexicanna',
    logo: logoMedical,
    mockup: mkMedical,
    nicho: 'Salud y bienestar',
    tipos: ['eCommerce', 'Landing page'],
    url: 'https://medicalmexicanna.store',
    stack: ['Next.js', 'Checkout propio', 'Animaciones', 'PWA'],
    resumen:
      'Tienda en línea de gomitas CBD full spectrum con dosis a medida. Landing de conversión y checkout propio dentro de un ecosistema de bienestar.',
  },
  {
    slug: 'otomi',
    name: 'Otomí',
    logo: logoOtomi,
    mockup: mkOtomi,
    nicho: 'Alimentos y bebidas',
    tipos: ['eCommerce', 'PWA'],
    url: 'https://otomitequila.com',
    stack: ['Next.js', 'Checkout propio', 'Animaciones', 'PWA'],
    resumen:
      'Sitio animado premium para una marca de tequila artesanal inspirada en la cultura Otomí: narrativa envolvente, catálogo y checkout propio con versión instalable (PWA).',
  },
  {
    slug: 'farmacias-hernandez',
    name: 'Farmacias Hernández',
    logo: logoFarmacias,
    mockup: mkFarmacias,
    nicho: 'Salud y bienestar',
    tipos: ['eCommerce'],
    // url de staging oculta hasta tener dominio propio: https://farmaciahernandez.ibisne-apps.com/mvp-home
    stack: ['Shopify', 'Liquid', 'Checkout', 'Integraciones'],
    resumen:
      'Rediseño de marca y e-commerce para una farmacia homeopática con 107 años de tradición: catálogo amplio, flujo de compra y sistema de diseño propio.',
  },
  {
    slug: 'steelbeird',
    name: 'Steelbeird',
    logo: logoSteelbeird,
    mockup: mkSteelbeird,
    nicho: 'Industria y comercio',
    tipos: ['Landing page'],
    url: 'https://www.steelbeird.com',
    stack: ['Next.js', 'React', 'Tailwind', 'SEO'],
    resumen:
      'Constructora industrial en Yucatán: sistema de cuatro landing pages bajo una misma identidad de obra y acero, lista para escalar por página.',
  },
  {
    slug: 'semilla',
    name: 'Semilla',
    logo: logoSemilla,
    mockup: mkSemilla,
    nicho: 'Construcción',
    tipos: ['Sitio web'],
    // url de staging oculta hasta tener dominio propio: https://semilla.ibisne-apps.com
    stack: ['Next.js', 'React', 'CMS', 'Vercel'],
    resumen:
      'Desarrollo residencial en la península: sitio institucional con apertura en video, recorrido del proyecto y contacto directo con ventas.',
  },
  {
    slug: 'unframe',
    name: 'Unframe',
    logo: logoUnframe,
    mockup: mkUnframe,
    nicho: 'Educación y servicios',
    tipos: ['Sitio web'],
    // url de staging oculta hasta tener dominio propio: https://unframe.ibisne-apps.com
    stack: ['Next.js', 'CMS headless', 'React', 'Vercel'],
    resumen:
      'Plataforma editorial "motion as memory", con CMS autoadministrable e identidad ultra-minimal. Ritmo, tipografía y movimiento como eje del contenido.',
  },
  {
    slug: 'distenvases',
    name: 'Distenvases',
    logo: logoDistenvases,
    mockup: null,
    nicho: 'Alimentos y bebidas',
    tipos: ['Sitio web'],
  },
  {
    slug: 'acefap',
    name: 'ACEFAP',
    logo: logoAcefap,
    mockup: null,
    nicho: 'Educación y servicios',
    tipos: ['eCommerce', 'PWA'],
  },
  {
    slug: 'ipools',
    name: 'iPools',
    logo: logoIpools, // logo HIDROSITE
    mockup: null,
    nicho: 'Construcción',
    tipos: ['ERP', 'SaaS'],
    stack: ['Next.js', 'Multi-tenant', 'PostgreSQL', 'Stripe'],
    resumen:
      'SaaS para la gestión integral de albercas y servicio: operación, clientes y mantenimiento administrados desde la nube.',
    propio: true,
  },
  {
    slug: 'docer',
    name: 'Docer',
    logo: logoDocer,
    mockup: null,
    nicho: 'Turismo y hospitalidad',
    tipos: ['Backoffice'],
  },
  {
    slug: 'albercasvip',
    name: 'AlbercasVIP',
    logo: logoAlbercasvip,
    mockup: mkAlbercasvip,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'PWA'],
    url: 'https://albercasvip.com',
    stack: ['Next.js', 'PWA', 'CMS', 'i18n', 'Vercel'],
    resumen:
      'Sitio y catálogo para constructor de albercas premium, distribuidor RENOLIT Alkorplan: diez colecciones, cotizador y PWA instalable.',
  },
  {
    slug: 'cgcac',
    name: 'CGCAC',
    logo: logoCgcac,
    mockup: null,
    nicho: 'Educación y servicios',
    tipos: ['Landing page'],
  },
  {
    slug: 'endomap',
    name: 'SEM EndoMap',
    logo: logoEndomap,
    mockup: mkEndomap,
    nicho: 'Salud y bienestar',
    tipos: ['SaaS'],
    url: 'https://www.sem-org.store',
    stack: ['Python', 'API REST', 'Integraciones', 'Datos'],
    resumen:
      'API de tecnología CBD: dosificación endocannabinoide de precisión, lista para integrarse en negocios digitales y físicos. El motor detrás de múltiples productos.',
  },
  {
    slug: 'cluster',
    name: 'Cluster',
    logo: logoCluster,
    mockup: null,
    nicho: 'Turismo y hospitalidad',
    tipos: ['SaaS'],
  },
  {
    slug: 'albercasopia',
    name: 'Albercasopia',
    logo: null,
    mockup: mkAlbercasopia,
    nicho: 'Construcción',
    tipos: ['eCommerce'],
    url: 'https://albercasopia.com',
    stack: ['Shopify', 'Liquid', 'Checkout', 'Integraciones'],
    resumen:
      'E-commerce de construcción, mantenimiento y renovación de albercas: catálogo de equipamiento y refacciones con tienda en línea propia.',
  },
  {
    slug: 'iwellscore',
    name: 'iWellScore',
    logo: null,
    mockup: null,
    nicho: 'Salud y bienestar',
    tipos: ['SaaS'],
  },
  {
    slug: 'digitalife',
    name: 'Digitalife',
    logo: null,
    mockup: mkDigitalife,
    nicho: 'Industria y comercio',
    tipos: ['eCommerce'],
    url: 'https://www.digitalife.com.mx',
    resumen:
      'Renovación completa de la experiencia y la identidad visual del e-commerce de tecnología: investigación, arquitectura de información, flujo de compra y sistema visual, diseñados en Figma y Adobe XD. Participación en la capa de diseño UX/UI.',
  },
  {
    slug: 'rancho-contento',
    name: 'Rancho Contento',
    logo: null,
    mockup: mkRancho,
    nicho: 'Turismo y hospitalidad',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://ranchocontentoyucatan.com.mx',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards'],
    resumen:
      'Plataforma de renta de ranchos y eventos al aire libre, con reservas y CRM de leads. Naturaleza, animales y experiencia presentados con una estética cálida y editorial.',
  },
];
