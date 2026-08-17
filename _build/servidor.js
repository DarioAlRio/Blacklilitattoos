// Servidor estatico minimo solo para previsualizar la web en local.
// No forma parte del sitio publicado (_build esta en .vercelignore).
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};

// imita las cleanUrls de Vercel: sirve /foo desde foo.html y redirige foo.html -> foo
http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  else if (rel.endsWith('.html')) {
    res.writeHead(308, { Location: rel.slice(0, -'.html'.length) }).end();
    return;
  } else if (!path.extname(rel)) {
    rel += '.html';
  }
  const destino = path.join(RAIZ, rel);
  // no salir de la carpeta del proyecto
  if (!destino.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  fs.readFile(destino, (err, datos) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream' });
    res.end(datos);
  });
}).listen(4173, () => console.log('http://localhost:4173'));
