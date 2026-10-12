# BlackLili Tattoos

![BlackLili Tattoos](og-image.jpg)

Web del estudio de tatuaje **fine-line BlackLili** en Puente de Vallecas (Madrid).
Sitio estático en **HTML, CSS y JS puro**, sin frameworks, desplegado en Vercel.

🌐 **[blacklilitattoos.com](https://blacklilitattoos.com)**

## Qué incluye

- **39 páginas**: portada, portfolio, reservas, contacto, sobre la artista, cursos, eventos y bodas, preguntas frecuentes y un blog con 30 artículos.
- **SEO local**: datos estructurados `TattooParlor` (JSON-LD) con dirección, coordenadas y horario, canonicals, `sitemap.xml` y clúster de artículos enlazados entre sí.
- **Rendimiento**: imágenes en WebP con `<picture>`, `srcset` y respaldo JPG; fuentes propias (Cormorant y Manrope) servidas desde el dominio; caché larga para estáticos.
- **Seguridad y legal**: cabeceras de seguridad en `vercel.json`, aviso legal, privacidad y cookies.
- **Redirecciones permanentes** de URLs antiguas para no perder posicionamiento.

## Estructura

```
├── *.html            Páginas del sitio (los artículos se generan, no se editan a mano)
├── styles.css        Estilos
├── script.js         Interacción (menú, modales, etc.)
├── img/  fonts/      Imágenes optimizadas y fuentes propias
├── sitemap.xml  robots.txt  vercel.json
└── _build/           Herramientas (no se publican)
    ├── articulos/    Contenido de cada artículo en JSON
    ├── generar.js    Genera los artículos, el índice del blog y el sitemap
    ├── validar.js    Comprueba enlaces, JSON-LD, canonicals y duplicados
    └── servidor.js   Servidor local para previsualizar (http://localhost:4173)
```

## Uso

Requiere [Node.js](https://nodejs.org/).

```bash
node _build/servidor.js   # previsualizar en local
node _build/generar.js    # regenerar artículos, blog y sitemap tras editar _build/articulos/*.json
node _build/validar.js    # comprobar que no hay nada roto antes de publicar
```

Cada `git push` a `main` se publica automáticamente en Vercel.

## Créditos

Diseño y desarrollo: [El Escaparate](https://elescaparateweb.com).
