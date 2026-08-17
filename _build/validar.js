/*
  Validador del sitio.  Uso:  node _build/validar.js

  Comprueba lo que rompe en silencio: enlaces internos rotos, anclas del índice
  que no existen, JSON-LD mal formado, títulos o descripciones duplicados,
  canonicals que no coinciden con el archivo y páginas fuera del sitemap.
*/

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const DOMINIO = 'https://blacklilitattoos.com';

const paginas = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html'));
const errores = [];
const avisos = [];
const titulos = new Map();
const descripciones = new Map();

const uno = (txt, re) => { const m = txt.match(re); return m ? m[1] : null; };
const todos = (txt, re) => [...txt.matchAll(re)].map(m => m[1]);

for (const p of paginas) {
  const html = fs.readFileSync(path.join(RAIZ, p), 'utf8');

  // --- title y description únicos ---
  const title = uno(html, /<title>([\s\S]*?)<\/title>/);
  const desc = uno(html, /<meta name="description" content="([^"]*)"/);
  if (!title) errores.push(`${p}: sin <title>`);
  else {
    if (titulos.has(title)) errores.push(`${p}: <title> duplicado con ${titulos.get(title)}`);
    else titulos.set(title, p);
    if (title.length > 65) avisos.push(`${p}: title de ${title.length} caracteres (se corta en Google sobre 60)`);
  }
  if (!desc) errores.push(`${p}: sin meta description`);
  else {
    if (descripciones.has(desc)) errores.push(`${p}: description duplicada con ${descripciones.get(desc)}`);
    else descripciones.set(desc, p);
    if (desc.length > 160) avisos.push(`${p}: description de ${desc.length} caracteres (se corta sobre 155)`);
  }

  // --- canonical coherente con el nombre del archivo (URLs limpias, sin .html) ---
  const canonical = uno(html, /rel="canonical" href="([^"]+)"/);
  const esperado = p === 'index.html' ? `${DOMINIO}/` : `${DOMINIO}/${p.replace(/\.html$/, '')}`;
  if (!canonical) errores.push(`${p}: sin canonical`);
  else if (canonical !== esperado) errores.push(`${p}: canonical apunta a ${canonical}, se esperaba ${esperado}`);

  // --- un solo h1 ---
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errores.push(`${p}: tiene ${h1} etiquetas h1 (debe haber exactamente 1)`);

  // --- JSON-LD válido ---
  todos(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).forEach((bloque, i) => {
    try { JSON.parse(bloque); }
    catch (e) { errores.push(`${p}: JSON-LD nº${i + 1} inválido — ${e.message}`); }
  });

  // --- enlaces internos (URLs limpias: el archivo real sigue teniendo .html) ---
  todos(html, /href="((?!https?:|tel:|mailto:|#|data:)[^"]+)"/g).forEach(href => {
    const destino = href.split('#')[0];
    if (!destino || destino === '/') return;
    const archivo = destino.endsWith('.html') ? destino : destino + '.html';
    if (!fs.existsSync(path.join(RAIZ, archivo)) && !fs.existsSync(path.join(RAIZ, destino))) {
      errores.push(`${p}: enlace roto a ${destino}`);
    }
  });

  // --- anclas internas: que el id exista en la propia página ---
  const ids = new Set(todos(html, /\sid="([^"]+)"/g));
  todos(html, /href="#([^"]+)"/g).forEach(ancla => {
    if (!ids.has(ancla)) errores.push(`${p}: ancla #${ancla} no existe en la página`);
  });

  // --- imágenes con alt ---
  const imgs = [...html.matchAll(/<img\b([^>]*)>/g)];
  imgs.forEach(m => {
    if (!/\salt=/.test(m[1])) avisos.push(`${p}: <img> sin atributo alt`);
  });
}

// --- sitemap ---
const sitemap = fs.readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8');
const locs = todos(sitemap, /<loc>([^<]+)<\/loc>/g);
for (const p of paginas) {
  const url = p === 'index.html' ? `${DOMINIO}/` : `${DOMINIO}/${p.replace(/\.html$/, '')}`;
  if (!locs.includes(url)) errores.push(`sitemap: falta ${p}`);
}
for (const l of locs) {
  const f = l === `${DOMINIO}/` ? 'index.html' : l.replace(DOMINIO + '/', '') + '.html';
  if (!paginas.includes(f)) errores.push(`sitemap: ${l} no corresponde a ningún archivo`);
}

// --- robots.txt ---
const robots = path.join(RAIZ, 'robots.txt');
if (!fs.existsSync(robots)) errores.push('falta robots.txt');
else if (!fs.readFileSync(robots, 'utf8').includes('sitemap.xml')) errores.push('robots.txt no apunta al sitemap');

// --- salida ---
console.log(`Páginas analizadas : ${paginas.length}`);
console.log(`URLs en el sitemap : ${locs.length}`);
if (avisos.length) {
  console.log(`\nAVISOS (${avisos.length}):`);
  [...new Set(avisos)].forEach(a => console.log('  · ' + a));
}
if (errores.length) {
  console.log(`\nERRORES (${errores.length}):`);
  errores.forEach(e => console.log('  ✗ ' + e));
  process.exitCode = 1;
} else {
  console.log('\nSin errores.');
}
