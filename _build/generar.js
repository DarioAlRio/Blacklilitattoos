/*
  Generador de artículos de BlackLili Tattoos.

  Uso:  node _build/generar.js

  Lee las definiciones de _build/articulos/*.json y escribe en la raíz del
  proyecto un .html por artículo, usando la misma cáscara (favicons, marca de
  agua, nav, footer y modales legales) que el resto de la web. Además regenera
  el índice del blog, el sitemap y los bloques de "seguir leyendo" de los
  artículos antiguos, para que nada se quede desincronizado.
*/

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const DIR_ARTICULOS = path.join(__dirname, 'articulos');
const PAGINA_MOLDE = path.join(RAIZ, 'cursos-tatuaje-linea-fina-madrid.html');
const DOMINIO = 'https://blacklilitattoos.com';

/* ---------- utilidades ---------- */

const leer = p => fs.readFileSync(p, 'utf8');
const escribir = (p, txt) => fs.writeFileSync(p, txt, 'utf8');

// escapa para meter texto dentro de un atributo HTML (aquí sí hay que escapar comillas)
const attr = s => String(s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

// escapa para contenido de texto (un h1, un h2, el <title>...): las comillas
// se dejan tal cual, porque ahí no delimitan nada y &quot; solo ensucia el código
const texto = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// escapa para meter texto dentro de una cadena JSON-LD
const json = s => JSON.stringify(String(s));

// quita etiquetas: para descripciones y para el JSON-LD de las FAQ
const plano = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function trozo(texto, inicio, fin, incluirInicio) {
  const i = texto.indexOf(inicio);
  if (i < 0) throw new Error('no encontrado en el molde: ' + inicio);
  const desde = incluirInicio ? i : i + inicio.length;
  const j = texto.indexOf(fin, desde);
  if (j < 0) throw new Error('no encontrado el cierre: ' + fin);
  return texto.slice(desde, j);
}

/* ---------- cáscara compartida ---------- */

const molde = leer(PAGINA_MOLDE);
const FAVICONS = trozo(molde, '<link rel="icon"', '<meta name="theme-color"', true).trimEnd();
const WATERMARK = trozo(molde, '<div class="watermark" aria-hidden="true">', '</div>', false).trim();
const FOOTER = trozo(molde, '<footer>', '<script src="script.js">', true).trimEnd();

const NAV = `<header class="nav" id="siteNav">
  <div class="nav-bg" aria-hidden="true"></div>
  <div class="wrap nav-inner">
    <a href="/" class="wordmark">BlackLili <em>Tattoos</em></a>
    <nav class="nav-links" id="navLinks">
      <a href="portfolio-tatuajes-linea-fina-madrid">Trabajos</a>
      <a href="tatuajes-para-bodas-y-eventos-madrid">Eventos</a>
      <a href="cursos-tatuaje-linea-fina-madrid">Formación</a>
      <a href="preguntas-frecuentes-tatuaje-linea-fina">Preguntas Frecuentes</a>
      <a href="contacto-tatuajes-puente-vallecas">Contacto</a>
      <a href="https://www.instagram.com/blacklilitattoos/" target="_blank" rel="noopener" class="nav-cta">Reservar cita</a>
    </nav>
    <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

/* ---------- carga de datos ---------- */

const nuevos = fs.readdirSync(DIR_ARTICULOS)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    try { return JSON.parse(leer(path.join(DIR_ARTICULOS, f))); }
    catch (e) { throw new Error('JSON inválido en ' + f + ': ' + e.message); }
  });

// Artículos que todavía no se generan desde JSON (sólo su ficha, para el índice
// y el sitemap). Ya está vacío: los cinco originales se migraron a articulos/.
const rutaExistentes = path.join(__dirname, 'existentes.json');
const existentes = fs.existsSync(rutaExistentes) ? JSON.parse(leer(rutaExistentes)) : [];

// registro slug -> ficha, para tarjetas de "seguir leyendo" e índice
const registro = {};
for (const a of existentes) registro[a.slug] = a;
for (const a of nuevos) {
  registro[a.slug] = {
    slug: a.slug,
    eyebrow: a.eyebrow,
    tituloCorto: a.tituloCorto || a.titulo,
    resumen: a.resumenTarjeta,
    minutos: a.minutos,
    fecha: a.fecha,
    categoria: a.categoria,
    generado: true
  };
}

/* ---------- piezas de plantilla ---------- */

function tarjeta(slug) {
  const a = registro[slug];
  if (!a) throw new Error('relacionado inexistente: ' + slug);
  return `      <a class="post-card" href="${a.slug}">
        <span class="eyebrow">${texto(a.eyebrow)}</span>
        <h3>${texto(a.tituloCorto)}</h3>
        <p>${texto(a.resumen)}</p>
        <span class="read">Leer · ${a.minutos} min</span>
      </a>`;
}

const faltantes = new Set();

function bloqueRelacionados(slugs) {
  slugs = slugs.filter(s => {
    if (registro[s]) return true;
    faltantes.add(s);
    return false;
  });
  return `<section class="related">
  <div class="wrap">
    <div class="reveal">
      <span class="eyebrow">Seguir leyendo</span>
      <h2 style="font-size:32px; margin-top:14px;">Otros artículos del estudio</h2>
    </div>
    <div class="post-grid reveal">
${slugs.map(tarjeta).join('\n')}
    </div>
  </div>
</section>`;
}

function bloqueFaq(faq) {
  if (!faq || !faq.length) return '';
  const items = faq.map(f => `          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">${texto(f.q)}<span class="plus"></span></button>
            <div class="faq-answer"><p>${f.a}</p></div>
          </div>`).join('\n');
  return `        <h2 id="preguntas">Preguntas frecuentes</h2>
        <div class="article-faq">
${items}
        </div>\n\n`;
}

function bloqueCta(cta) {
  return `        <div class="article-cta">
          <h3>${texto(cta.titulo)}</h3>
          <p>${cta.texto}</p>
          <div class="hero-ctas">
            <a href="${cta.btn1.href}"${cta.btn1.externo ? ' target="_blank" rel="noopener"' : ''} class="btn btn-solid">${texto(cta.btn1.label)}</a>
            <a href="${cta.btn2.href}"${cta.btn2.externo ? ' target="_blank" rel="noopener"' : ''} class="btn btn-ghost">${texto(cta.btn2.label)}</a>
          </div>
        </div>\n\n`;
}

function bloqueResumen(a) {
  if (!a.resumen || !a.resumen.length) return '';
  return `        <div class="keypoints">
          <span class="eyebrow">${texto(a.resumenTitulo || 'En resumen')}</span>
          <ul>
${a.resumen.map(p => `            <li>${p}</li>`).join('\n')}
          </ul>
        </div>\n\n`;
}

function bloqueToc(a) {
  const items = a.secciones.filter(s => s.id).map(s =>
    `            <li><a href="#${s.id}">${texto(s.toc || s.titulo)}</a></li>`);
  if (a.faq && a.faq.length) items.push('            <li><a href="#preguntas">Preguntas frecuentes</a></li>');
  return items.join('\n');
}

/* ---------- JSON-LD ---------- */

function jsonLd(a) {
  const url = `${DOMINIO}/${a.slug}`;
  const bloques = [];

  bloques.push(`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${json(a.titulo)},
  "description": ${json(a.descripcion)},
  "inLanguage": "es-ES",
  "author": {
    "@type": "Organization",
    "name": "BlackLili Tattoos",
    "url": "${DOMINIO}/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BlackLili Tattoos",
    "logo": {
      "@type": "ImageObject",
      "url": "${DOMINIO}/og-image.jpg"
    }
  },
  "datePublished": "${a.fecha}",
  "dateModified": "${a.fecha}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${url}"
  },
  "about": {"@type": "Thing", "name": ${json(a.tema)}}${a.lugar ? `,
  "spatialCoverage": {"@type": "Place", "name": ${json(a.lugar)}}` : ''}
}`);

  bloques.push(`{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Inicio","item":"${DOMINIO}/"},
    {"@type":"ListItem","position":2,"name":"Blog","item":"${DOMINIO}/blog-tatuajes-linea-fina"},
    {"@type":"ListItem","position":3,"name":${json(a.migaCorta || a.tituloCorto || a.titulo)},"item":"${url}"}
  ]
}`);

  if (a.faq && a.faq.length) {
    const preguntas = a.faq.map(f => `    {
      "@type": "Question",
      "name": ${json(f.q)},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": ${json(plano(f.a))}
      }
    }`).join(',\n');
    bloques.push(`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${preguntas}
  ]
}`);
  }

  return bloques.map(b => `<script type="application/ld+json">\n${b}\n</script>`).join('\n\n');
}

/* ---------- plantilla del artículo ---------- */

function renderArticulo(a) {
  const url = `${DOMINIO}/${a.slug}`;
  const ctaTras = typeof a.ctaTras === 'number' ? a.ctaTras : Math.ceil(a.secciones.length / 2);

  let cuerpo = '';
  a.secciones.forEach((s, i) => {
    const clase = s.paso === false ? '' : ' class="step"';
    cuerpo += `        <h2${clase}${s.id ? ` id="${s.id}"` : ''}>${texto(s.titulo)}</h2>\n`;
    cuerpo += s.html.trimEnd() + '\n\n';
    if (i + 1 === ctaTras) cuerpo += bloqueCta(a.cta);
  });

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${texto(a.titleTag)}</title>
<meta name="description" content="${attr(a.descripcion)}">
<meta name="robots" content="index, follow">
<meta name="language" content="Spanish">
<meta name="geo.region" content="ES-M">
<meta name="geo.placename" content="Madrid">
<meta name="geo.position" content="40.3930247;-3.6664344">
<meta name="ICBM" content="40.3930247, -3.6664344">
<link rel="canonical" href="${url}">

<!-- Favicons -->
${FAVICONS}
<meta name="theme-color" content="#F1ECE6">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="BlackLili Tattoos">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${attr(a.tituloCorto || a.titulo)}">
<meta property="og:description" content="${attr(a.ogDescripcion || a.descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMINIO}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(a.tituloCorto || a.titulo)}">
<meta name="twitter:description" content="${attr(a.ogDescripcion || a.descripcion)}">
<meta name="twitter:image" content="${DOMINIO}/og-image.jpg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="styles.css">

${jsonLd(a)}
</head>
<body class="no-hero">

<div class="watermark" aria-hidden="true">
${WATERMARK}
</div>

${NAV}

<main>
<article>

  <header class="article-head">
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="/">Inicio</a></li>
          <li><a href="blog-tatuajes-linea-fina">Blog</a></li>
          <li><span aria-current="page">${texto(a.migaCorta || a.tituloCorto || a.titulo)}</span></li>
        </ol>
      </nav>

      <span class="eyebrow">${texto(a.eyebrow)}</span>
      <h1>${texto(a.titulo)}</h1>
      <p class="article-lead">${a.lead}</p>

      <div class="article-meta">
        <span>Actualizado agosto 2026</span>
        <span class="sep">·</span>
        <span>${a.minutos} min de lectura</span>
        <span class="sep">·</span>
        <span>${texto(a.contexto)}</span>
      </div>
    </div>
  </header>

  <div class="article-layout">
    <div class="wrap">

      <div class="prose reveal">

${bloqueResumen(a)}${a.intro.trimEnd()}

${cuerpo}${bloqueFaq(a.faq)}        <p class="article-foot">${a.cierre}</p>

      </div>

      <aside class="article-aside">
        <nav class="toc" aria-label="Contenido del artículo">
          <span class="eyebrow">En este artículo</span>
          <ol>
${bloqueToc(a)}
          </ol>
        </nav>
        <div class="aside-card">
          <h3>${texto(a.tarjetaLateral.titulo)}</h3>
          <p>${a.tarjetaLateral.texto}</p>
          <a href="${a.tarjetaLateral.href}"${a.tarjetaLateral.externo ? ' target="_blank" rel="noopener"' : ''} class="btn btn-ghost">${texto(a.tarjetaLateral.label)}</a>
        </div>
      </aside>

    </div>
  </div>

</article>

${bloqueRelacionados(a.relacionados)}

</main>

${FOOTER}

<script src="script.js"></script>
</body>
</html>
`;
}

/* ---------- índice del blog ---------- */

const ORDEN_CATEGORIAS = [
  { clave: 'vallecas', titulo: 'Tatuarte en Vallecas y Madrid', entradilla: 'Dónde tatuarte, cómo reconocer un estudio serio y qué esperar del barrio.' },
  { clave: 'bodas', titulo: 'Tatuajes para bodas', entradilla: 'Estaciones de tatuaje, alianzas tatuadas y todo lo que implica llevar un tatuador a tu boda.' },
  { clave: 'eventos', titulo: 'Tatuajes para eventos', entradilla: 'Despedidas, cumpleaños, eventos de empresa y activaciones de marca.' },
  { clave: 'diseno', titulo: 'Estilos y diseño', entradilla: 'Qué funciona en línea fina, qué envejece bien y cómo elegir tu pieza.' },
  { clave: 'practico', titulo: 'Antes y después de tatuarte', entradilla: 'Dolor, cicatrización, verano, deporte y decisiones prácticas.' },
  { clave: 'formacion', titulo: 'Aprender a tatuar', entradilla: 'Formación, material y primeros pasos si quieres dedicarte a esto.' }
];

function renderIndice() {
  const todos = Object.values(registro);
  let secciones = '';

  for (const cat of ORDEN_CATEGORIAS) {
    const arts = todos.filter(a => a.categoria === cat.clave);
    if (!arts.length) continue;
    arts.sort((x, y) => (x.orden || 99) - (y.orden || 99));
    secciones += `
      <div class="reveal" style="margin-top:70px;">
        <span class="eyebrow">${texto(cat.titulo)}</span>
        <p style="max-width:560px; margin-top:10px;">${texto(cat.entradilla)}</p>
      </div>
      <div class="post-grid reveal">
${arts.map(a => tarjeta(a.slug)).join('\n')}
      </div>
`;
  }

  const sinCategoria = todos.filter(a => !ORDEN_CATEGORIAS.some(c => c.clave === a.categoria));
  if (sinCategoria.length) throw new Error('categoría desconocida en: ' + sinCategoria.map(a => a.slug).join(', '));

  const listaLd = todos.map((a, i) => `    {
      "@type": "ListItem",
      "position": ${i + 1},
      "url": "${DOMINIO}/${a.slug}",
      "name": ${json(a.tituloCorto)}
    }`).join(',\n');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog de tatuajes | BlackLili Tattoos Madrid</title>
<meta name="description" content="Guías sobre tatuaje escritas desde el estudio: elegir tatuador en Vallecas, tatuajes para bodas y eventos, cuidados, precios, diseño y formación.">
<meta name="robots" content="index, follow">
<meta name="language" content="Spanish">
<meta name="geo.region" content="ES-M">
<meta name="geo.placename" content="Madrid">
<meta name="geo.position" content="40.3930247;-3.6664344">
<meta name="ICBM" content="40.3930247, -3.6664344">
<link rel="canonical" href="${DOMINIO}/blog-tatuajes-linea-fina">

<!-- Favicons -->
${FAVICONS}
<meta name="theme-color" content="#F1ECE6">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackLili Tattoos">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="Blog de tatuajes | BlackLili Tattoos">
<meta property="og:description" content="Guías sobre tatuaje escritas desde el estudio: Vallecas, bodas, eventos, cuidados, precios y diseño.">
<meta property="og:url" content="${DOMINIO}/blog-tatuajes-linea-fina">
<meta property="og:image" content="${DOMINIO}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Blog de tatuajes | BlackLili Tattoos">
<meta name="twitter:description" content="Guías sobre tatuaje escritas desde el estudio: Vallecas, bodas, eventos, cuidados, precios y diseño.">
<meta name="twitter:image" content="${DOMINIO}/og-image.jpg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="styles.css">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Blog de BlackLili Tattoos",
  "description": "Guías sobre tatuaje escritas desde el estudio de BlackLili Tattoos, en Puente de Vallecas, Madrid.",
  "inLanguage": "es-ES",
  "url": "${DOMINIO}/blog-tatuajes-linea-fina",
  "publisher": {
    "@type": "Organization",
    "name": "BlackLili Tattoos",
    "logo": {
      "@type": "ImageObject",
      "url": "${DOMINIO}/og-image.jpg"
    }
  },
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": ${todos.length},
    "itemListElement": [
${listaLd}
    ]
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Inicio","item":"${DOMINIO}/"},
    {"@type":"ListItem","position":2,"name":"Blog","item":"${DOMINIO}/blog-tatuajes-linea-fina"}
  ]
}
</script>
</head>
<body class="no-hero">

<div class="watermark" aria-hidden="true">
${WATERMARK}
</div>

${NAV}

<main>

  <section class="page-head">
    <div class="wrap">
      <span class="eyebrow">Blog del estudio</span>
      <h1>Todo lo que deberías saber<br>antes de tatuarte.</h1>
      <p style="max-width:580px; margin:26px auto 0; font-size:17px;">${todos.length} guías escritas desde la cabina, no desde un manual. Lo que preguntan de verdad quienes vienen a tatuarse a Puente de Vallecas.</p>
    </div>
  </section>

  <section class="blog-index">
    <div class="wrap">
${secciones}    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>¿Ya tienes tu idea en la cabeza?</h2>
      <p>Cuéntanosla. Valoramos el diseño, la zona y el tamaño contigo, y te damos presupuesto antes de reservar.</p>
      <div class="hero-ctas">
        <a href="https://www.instagram.com/blacklilitattoos/" target="_blank" rel="noopener" class="btn btn-solid">Reservar cita</a>
        <a href="contacto-tatuajes-puente-vallecas" class="btn btn-ghost">Ver horarios y dirección</a>
      </div>
    </div>
  </section>

</main>

${FOOTER}

<script src="script.js"></script>
</body>
</html>
`;
}

/* ---------- sitemap ---------- */

const PAGINAS_FIJAS = [
  { loc: DOMINIO + '/', fecha: '2026-07-17' },
  { loc: DOMINIO + '/portfolio-tatuajes-linea-fina-madrid', fecha: '2026-07-17' },
  { loc: DOMINIO + '/tatuajes-para-bodas-y-eventos-madrid', fecha: '2026-07-17' },
  { loc: DOMINIO + '/cursos-tatuaje-linea-fina-madrid', fecha: '2026-07-17' },
  { loc: DOMINIO + '/preguntas-frecuentes-tatuaje-linea-fina', fecha: '2026-07-17' },
  { loc: DOMINIO + '/contacto-tatuajes-puente-vallecas', fecha: '2026-07-17' },
  { loc: DOMINIO + '/blog-tatuajes-linea-fina', fecha: '2026-08-08' }
];

function renderSitemap() {
  const urls = PAGINAS_FIJAS.concat(
    Object.values(registro).map(a => ({ loc: `${DOMINIO}/${a.slug}`, fecha: a.fecha }))
  );
  const cuerpo = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.fecha}</lastmod>
  </url>`).join('\n\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${cuerpo}

</urlset>
`;
}

/* ---------- refrescar "seguir leyendo" de los artículos antiguos ---------- */

function refrescarAntiguos() {
  let tocados = 0;
  for (const a of existentes) {
    if (!a.relacionados) continue;
    const p = path.join(RAIZ, a.slug + '.html');
    if (!fs.existsSync(p)) { console.log('  aviso: no existe ' + a.slug + '.html'); continue; }
    const html = leer(p);
    const i = html.indexOf('<section class="related">');
    const j = html.indexOf('</section>', i);
    if (i < 0 || j < 0) { console.log('  aviso: sin bloque related en ' + a.slug); continue; }
    const nuevo = html.slice(0, i) + bloqueRelacionados(a.relacionados) + html.slice(j + '</section>'.length);
    if (nuevo !== html) { escribir(p, nuevo); tocados++; }
  }
  return tocados;
}

/* ---------- ejecución ---------- */

let generados = 0;
for (const a of nuevos) {
  escribir(path.join(RAIZ, a.slug + '.html'), renderArticulo(a));
  generados++;
}
escribir(path.join(RAIZ, 'blog-tatuajes-linea-fina.html'), renderIndice());
escribir(path.join(RAIZ, 'sitemap.xml'), renderSitemap());
const refrescados = refrescarAntiguos();

if (faltantes.size) {
  console.log('AVISO — relacionados que aún no existen (se han omitido de las tarjetas):');
  for (const s of faltantes) console.log('  · ' + s);
}
console.log(`Artículos generados : ${generados}`);
console.log(`Artículos antiguos refrescados : ${refrescados}`);
console.log(`Total en el blog : ${Object.keys(registro).length}`);
console.log('Índice y sitemap regenerados.');
