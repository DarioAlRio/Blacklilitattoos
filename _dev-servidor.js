/* Servidor estático mínimo para ver la web en local mientras se trabaja.
   No forma parte del sitio: no lo subas al hosting.
   Uso:  node _dev-servidor.js   →   http://localhost:5174  */

const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const PUERTO = 5174;
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

http
  .createServer((req, res) => {
    let ruta = decodeURIComponent(req.url.split("?")[0]);
    if (ruta === "/") ruta = "/index.html";
    if (!path.extname(ruta)) ruta += ".html";
    const archivo = path.join(RAIZ, path.normalize(ruta).replace(/^(\.\.[/\\])+/, ""));

    fs.readFile(archivo, (err, datos) => {
      if (err) {
        fs.readFile(path.join(RAIZ, "404.html"), (e2, pag) => {
          res.writeHead(404, { "Content-Type": TIPOS[".html"] });
          res.end(e2 ? "404" : pag);
        });
        return;
      }
      res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream" });
      res.end(datos);
    });
  })
  .listen(PUERTO, () => console.log("Servidor en http://localhost:" + PUERTO));
