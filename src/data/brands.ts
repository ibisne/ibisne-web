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
import logoDigitalife from '../assets/logos/digitalife.png';
import logoAlbercasopia from '../assets/logos/albercasopia.png';
import logoRancho from '../assets/logos/rancho-contento.png';
import logoDocer from '../assets/logos/docer.png';
import logoAlbercasvip from '../assets/logos/albercasvip.png';
import logoCgcac from '../assets/logos/cgcac.png';
import logoBatauro from '../assets/logos/batauro.png';

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
import mkAlbercasopia from '../assets/mockups/albercasopia.webp';
import mkDigitalife from '../assets/mockups/digitalife.webp';
import mkBatauro from '../assets/mockups/batauro.webp';
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
  /** Ficha corta del proyecto (página /trabajo/<slug>/). Máximo 10 palabras. */
  tagline: string;
  /** El reto, en una frase. */
  reto: string;
  /** La solución, en 1-2 frases. */
  solucion: string;
  /** Resultado en una frase. Sin cifras inventadas; se omite si no hay evidencia. */
  resultado?: string;
  /** Textos de la ficha en borrador, pendientes de aprobación de Eduardo. */
  borrador: boolean;
}

// TIPOS PROVISIONALES: confirmar con Eduardo
// Orden = el de la pantalla Trabajo en Figma (frame 26:2).
// year: ninguna ficha del sitio viejo declara año de proyecto (el 2026 que aparece es el
// copyright), por eso queda ausente. url con host *.ibisne-apps.com = demo de staging
// publicada en la ficha vieja; confirmar si se muestra como enlace público.
export const brands: Brand[] = [
  {
    slug: 'thcc',
    name: 'THCC',
    logo: logoThcc,
    mockup: mkThcc,
    nicho: 'Salud y bienestar',
    tipos: ['eCommerce'],
    url: 'https://www.thcc.com.mx',
    stack: ['Shopify', 'Liquid', 'Asistente IA', 'Verificación de edad', 'PWA', 'Vercel'],
    resumen:
      'Tienda multimarca que ordena varias marcas bajo un mismo catálogo, con verificación de edad, carrito, buscador y filtros, tres idiomas y un asistente conversacional que devuelve tarjetas de producto comparables dentro del chat.',
    tagline: 'Varias marcas, un solo catálogo y una tienda confiable.',
    reto: 'Vender varias marcas de cannabinoides sin que la tienda se sintiera como catálogos pegados, y sin dejar el cumplimiento regulatorio para el final.',
    solucion: 'Una tienda en Shopify que ordena las marcas bajo un mismo catálogo, con verificación de edad antes de comprar y fichas con el etiquetado que exige la norma. Fily, un asistente con IA, responde dudas y recomienda productos dentro del chat.',
    resultado: 'La tienda está en línea y se puede instalar como app desde el navegador.',
    borrador: true,
  },
  {
    slug: 'ibroker',
    name: 'iBroker',
    logo: logoIbroker,
    mockup: mkIbroker,
    nicho: 'Construcción',
    tipos: ['CRM'],
    url: 'https://ibroker.com.mx',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards', 'IA'],
    resumen:
      'CRM inmobiliario que automatiza el seguimiento de cada prospecto y publica propiedades en minutos. Un panel que trabaja solo para que el bróker capture menos y cierre más.',
    propio: true,
    tagline: 'Un ARM que agentiza el día del broker.',
    reto: 'El broker vivía entre hojas de cálculo y chats, sin un lugar donde viera todo su día.',
    solucion: 'Junto con el cliente se concluyó que el CRM ya no basta, y se creó un ARM que agentiza su día. Seguimiento de prospectos, agenda, inventario y publicación de propiedades en un mismo panel, con un portal público de inmuebles al frente.',
    borrador: true,
  },
  {
    slug: 'dci',
    name: 'DCI de la Península',
    logo: logoDci,
    mockup: mkDci,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://www.inmobiliariadci.com',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards', 'Chatbot IA', 'i18n'],
    resumen:
      'Conjunto inmobiliario enfocado en la península de Yucatán: catálogo de inmuebles validados con lógica de inversión y CRM de leads.',
    tagline: 'Inmuebles de la península, con lógica de inversión.',
    reto: 'Mostrar propiedades y desarrollos de Yucatán y Quintana Roo de forma clara, con lotes que se pudieran explorar a detalle.',
    solucion: 'Sitio bilingüe con catálogo de inmuebles, masterplans interactivos para elegir lote y un blog con guías. Nicté, un chatbot con IA, atiende dudas, y un CRM aparte da seguimiento a los leads.',
    resultado: 'Los visitantes recorren los masterplans y resuelven dudas con el chatbot sin salir del sitio.',
    borrador: true,
  },
  {
    slug: 'neoterre',
    name: 'Neoterre',
    logo: logoNeoterre,
    mockup: mkNeoterre,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://www.neoterre.org/es',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards', 'i18n'],
    resumen:
      'Web inmobiliaria con CRM de leads: catálogo de desarrollos y captación, con una identidad sobria y contemporánea.',
    tagline: 'Desarrollos de la Riviera Maya, en español e inglés.',
    reto: 'Presentar los desarrollos de una inmobiliaria con una identidad sobria y captar a cada interesado desde el primer vistazo.',
    solucion: 'Sitio bilingüe con catálogo de desarrollos y animaciones suaves, conectado a un CRM de leads para dar seguimiento a cada contacto.',
    borrador: true,
  },
  {
    slug: 'batauro',
    name: 'Batauro',
    logo: logoBatauro,
    mockup: mkBatauro,
    nicho: 'Industria y comercio',
    tipos: ['eCommerce'],
    url: 'https://batauro.com/',
    stack: ['Shopify', 'Liquid', 'Checkout', 'Integraciones'],
    resumen:
      'Tienda gamer premium de gabinetes, componentes y periféricos, con una experiencia de compra cinematográfica. Catálogo y eCommerce en Shopify orientado a conversión.',
    tagline: 'Tienda gamer premium, con compra cinematográfica.',
    reto: 'Llevar la marca a una plataforma digital a su altura y lista para escalar.',
    solucion: 'Una tienda Shopify cinematográfica orientada a conversión, con catálogo de gabinetes, componentes y periféricos.',
    resultado: 'Hoy está en línea y operando.',
    borrador: true,
  },
  {
    slug: 'digitalife',
    name: 'Digitalife',
    logo: logoDigitalife,
    mockup: mkDigitalife,
    nicho: 'Industria y comercio',
    tipos: ['eCommerce'],
    url: 'https://www.digitalife.com.mx',
    stack: ['Figma', 'Adobe XD', 'UX/UI', 'Design system'],
    resumen:
      'Renovación completa de la experiencia y la identidad visual del e-commerce de tecnología: investigación, arquitectura de información, flujo de compra y sistema visual, diseñados en Figma y Adobe XD. Participación en la capa de diseño UX/UI.',
    tagline: 'Rediseño UX/UI de una tienda de tecnología de referencia.',
    reto: 'Modernizar la experiencia y la identidad de una tienda de tecnología de referencia en México, con una interfaz más clara para comprar.',
    solucion: 'Investigación, arquitectura de información, flujo de compra y sistema visual, diseñados en Figma y Adobe XD con metodologías ágiles. La participación fue en la capa de diseño UX/UI, sin desarrollo.',
    resultado: 'Se entregó el rediseño UX/UI completo, listo para implementación.',
    borrador: true,
  },
  {
    slug: 'medical-mexicanna',
    name: 'Medical Mexicanna',
    logo: logoMedical,
    mockup: mkMedical,
    nicho: 'Salud y bienestar',
    tipos: ['eCommerce', 'Landing page'],
    url: 'https://medicalmexicanna.store',
    stack: ['Tailwind', 'JavaScript', 'Serverless', 'PWA', 'Vercel'],
    resumen:
      'Tienda en línea de gomitas CBD full spectrum con dosis a medida. Landing de conversión y checkout propio dentro de un ecosistema de bienestar.',
    tagline: 'Gomitas CBD con la dosis calculada para cada persona.',
    reto: 'Explicar el CBD con claridad y ayudar a cada persona a decidir cuántas gomitas necesita.',
    solucion: 'Una landing educativa y SEM EndoMap, un perfilador que estima la dosis después de un filtro de seguridad. La compra se concentra en la tienda oficial de THCC.',
    borrador: true,
  },
  {
    slug: 'albercasvip',
    name: 'AlbercasVIP',
    logo: logoAlbercasvip,
    mockup: mkAlbercasvip,
    nicho: 'Construcción',
    tipos: ['Sitio web', 'PWA'],
    url: 'https://albercasvip.com',
    stack: ['Astro', 'Tailwind', 'GSAP', 'PWA', 'i18n'],
    resumen:
      'Sitio y catálogo para constructor de albercas premium, distribuidor RENOLIT Alkorplan: diez colecciones, cotizador y PWA instalable.',
    tagline: 'Catálogo técnico de albercas premium, instalable como app.',
    reto: 'Un catálogo técnico muy amplio, con garantía y uso por acabado, tenía que caber en el teléfono de un vendedor parado en obra.',
    solucion: 'Catálogo por colecciones RENOLIT con ficha técnica navegable, cotizador, selector de idioma y moneda, modo oscuro, un chatbot y versión instalable sin pasar por las tiendas de apps.',
    resultado: 'El vendedor consulta el catálogo en obra, y la ficha técnica dejó de ser un PDF adjunto.',
    borrador: true,
  },
  {
    slug: 'sem',
    name: 'SEM (Semillas Endémicas Mexicanna)',
    logo: logoSem,
    mockup: mkSem,
    nicho: 'Salud y bienestar',
    tipos: ['SaaS'],
    url: 'https://sem-org.com',
    stack: ['Next.js', 'React', 'Tailwind', 'Design system', 'CMS', 'Vercel'],
    resumen:
      'Centro de mando que concentra, como un marketplace, todos los sistemas dados de alta: un ecommerce que unifica el ecosistema de marcas en una sola plataforma.',
    tagline: 'La casa de marcas de un ecosistema de bienestar.',
    reto: 'Un ecosistema de marcas con tiendas separadas necesitaba un solo lugar que lo explicara completo.',
    solucion: 'Un sitio-catálogo con una hoja propia por marca: la explica, muestra sus productos y lleva a su tienda. Un sistema de diseño compartido mantiene todo coherente.',
    borrador: true,
  },
  {
    slug: 'otomi',
    name: 'Otomí',
    logo: logoOtomi,
    mockup: mkOtomi,
    nicho: 'Alimentos y bebidas',
    tipos: ['eCommerce', 'PWA'],
    url: 'https://otomitequila.com',
    stack: ['HTML, CSS y JS', 'Botella 3D', 'Animaciones', 'PWA', 'i18n'],
    resumen:
      'Sitio animado premium para una marca de tequila artesanal inspirada en la cultura Otomí: narrativa envolvente, catálogo y checkout propio con versión instalable (PWA).',
    tagline: 'Tequila plata super premium, con su botella en 3D.',
    reto: 'Contar la marca y su cultura Otomí de forma envolvente, en dos idiomas y desde el teléfono.',
    solucion: 'Sitio animado en HTML, CSS y JavaScript, sin dependencias: botella 3D interactiva, doce recetas de cocteles, modo claro y oscuro y versión instalable. Para comprar, lleva a la compra en línea o a WhatsApp.',
    borrador: true,
  },
  {
    slug: 'steelbeird',
    name: 'Steelbeird',
    logo: logoSteelbeird,
    mockup: mkSteelbeird,
    nicho: 'Industria y comercio',
    tipos: ['Landing page'],
    url: 'https://www.steelbeird.com',
    stack: ['Next.js', 'React', 'Tailwind', 'Motion', 'SEO'],
    resumen:
      'Constructora industrial en Yucatán: sistema de cuatro landing pages bajo una misma identidad de obra y acero, lista para escalar por página.',
    tagline: 'La infraestructura industrial de Yucatán, en versión cinematográfica.',
    reto: 'Dar a una constructora industrial una presencia digital que transmitiera obra, equipo y confianza.',
    solucion: 'Sitio con landing pages bajo una identidad de obra y acero: logo animado, servicios, proyectos, equipo y un momento de soldadura en video. Acompaña una propuesta comercial en PDF.',
    borrador: true,
  },
  {
    slug: 'unframe',
    name: 'Unframe',
    logo: logoUnframe,
    mockup: mkUnframe,
    nicho: 'Educación y servicios',
    tipos: ['Sitio web'],
    // url de staging oculta hasta tener dominio propio: https://unframe.ibisne-apps.com
    stack: ['Vite', 'React', 'Framer Motion', 'Tailwind', 'Vercel'],
    resumen:
      'Plataforma editorial "motion as memory", con CMS autoadministrable e identidad ultra-minimal. Ritmo, tipografía y movimiento como eje del contenido.',
    tagline: 'Motion as memory, hecho sitio web.',
    reto: 'Que el sitio de un estudio de motion se moviera con la misma intención que su trabajo.',
    solucion: 'Sitio multipágina con transiciones cinematográficas entre páginas y cuatro modos para que el cliente elija el que más le guste. Tipografía y ritmo llevan el contenido.',
    resultado: 'El sitio funciona hoy como MVP, listo para validarse y crecer.',
    borrador: true,
  },
  {
    slug: 'distenvases',
    name: 'Distenvases',
    logo: logoDistenvases,
    mockup: null,
    nicho: 'Alimentos y bebidas',
    tipos: ['Sitio web'],
    stack: ['Python', 'Visión por IA', 'Sitio estático', 'Datos curados'],
    tagline: 'Envases de vidrio, comparados a escala real.',
    reto: 'El catálogo en línea había perdido las especificaciones, y los catálogos impresos no tenían texto que se pudiera copiar.',
    solucion: 'Se digitalizaron los catálogos del fabricante y se unieron al inventario en una sola base verificada. De ahí se genera el sitio, con un estante de envases a escala, catálogo y los datos técnicos en cada tarjeta.',
    resultado: 'El catálogo completo vive en una sola base y el sitio se genera desde ella.',
    borrador: true,
  },
  {
    slug: 'docer',
    name: 'Docer',
    logo: logoDocer,
    mockup: null,
    nicho: 'Turismo y hospitalidad',
    tipos: ['Backoffice'],
    stack: ['Next.js', 'Supabase', 'Importación de Excel'],
    tagline: 'La operación de material y flete, medida y en orden.',
    reto: 'Toda la operación vivía en un Excel donde distintos tipos de viaje convivían en la misma tabla.',
    solucion: 'Se midió el Excel de la empresa y se separaron los tipos de operación. Un backoffice organiza viajes, notas y folios, y avisa de lo que falta o está por confirmar.',
    borrador: true,
  },
  {
    slug: 'cgcac',
    name: 'CGCAC',
    logo: logoCgcac,
    mockup: null,
    nicho: 'Educación y servicios',
    tipos: ['Landing page'],
    stack: ['Registro en línea', 'Pases con QR', 'Verificador', 'Vercel'],
    tagline: 'Registro y pases con QR para un foro nacional.',
    reto: 'Registrar a los asistentes de un foro nacional y validar su pase en la puerta.',
    solucion: 'Sitio del evento con formulario de registro, pase personal con código QR y un verificador para validarlo el día del foro. Terminado el evento, el sitio se sustituyó por un cartel de agradecimiento.',
    resultado: 'El foro se celebró con registro en línea, y los registros quedaron exportados.',
    borrador: true,
  },
  {
    slug: 'albercasopia',
    name: 'Albercasopia',
    logo: logoAlbercasopia,
    mockup: mkAlbercasopia,
    nicho: 'Construcción',
    tipos: ['eCommerce'],
    url: 'https://albercasopia.com',
    stack: ['Shopify', 'Liquid', 'Checkout', 'Integraciones'],
    resumen:
      'E-commerce de construcción, mantenimiento y renovación de albercas: catálogo de equipamiento y refacciones con tienda en línea propia.',
    tagline: 'Equipo y refacciones para albercas, en tienda propia.',
    reto: 'Vender en línea equipamiento y refacciones para albercas con un catálogo fácil de recorrer.',
    solucion: 'Tienda en Shopify con catálogo de equipamiento y refacciones, carrito y pago en línea, lista para escalar.',
    borrador: true,
  },
  {
    slug: 'rancho-contento',
    name: 'Rancho Contento',
    logo: logoRancho,
    mockup: mkRancho,
    nicho: 'Turismo y hospitalidad',
    tipos: ['Sitio web', 'CRM'],
    url: 'https://ranchocontentoyucatan.com.mx',
    stack: ['Next.js', 'PostgreSQL', 'Automatización', 'Dashboards'],
    resumen:
      'Plataforma de renta de ranchos y eventos al aire libre, con reservas y CRM de leads. Naturaleza, animales y experiencia presentados con una estética cálida y editorial.',
    tagline: 'Ranchos y eventos al aire libre, con reservas en línea.',
    reto: 'Dar a una renta de ranchos una plataforma que transmitiera su naturaleza y ordenara las reservas.',
    solucion: 'Plataforma con reservas y CRM de leads, con una estética cálida y editorial que presenta naturaleza, animales y experiencia.',
    borrador: true,
  },
];
