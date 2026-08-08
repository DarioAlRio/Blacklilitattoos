# CLAUDE.md — El Escaparate

Web del estudio de Dario Domínguez. Siete páginas estáticas, sin build.
Dominio: `elescaparateweb.com`.

Antes de tocar nada, mira si la respuesta ya está escrita:

| Pregunta | Archivo |
|---|---|
| Qué es, a quién habla, qué se ofrece y qué no | `PRODUCT.md` |
| Paleta, tipografía, motivos, movimiento, accesibilidad | `DESIGN.md` |
| Qué le queda por rellenar a Dario antes de publicar | `PERSONALIZAR.md` |

Este archivo es lo demás: cómo se trabaja aquí y qué trampas ya se han pagado.

---

## 1. Reglas inviolables

1. **Sin build, sin npm, sin dependencias.** HTML + CSS + JS a pelo.
2. **Sin módulos ES.** Los `<script>` son clásicos, en IIFE con `"use strict"`.
   Motivo: `type="module"` no funciona bajo `file://`, y la web tiene que abrirse
   con **doble clic** en `index.html`. Esa condición no se negocia.
3. **Enlaces internos relativos y con `.html`** (`diseno-web.html`). El `.html` lo
   quita el servidor, nunca el código: la web está en **Vercel** y lo hace
   `vercel.json` con `cleanUrls`. `canonical`, `og:url` y `sitemap.xml` sí
   llevan la dirección limpia. Ya se intentó quitar la extensión del HTML:
   rompió el doble clic.
4. **Sin backend.** Capturas a servicios públicos, formulario a endpoint externo.
5. **Español de España, tuteo, sin jerga.** El código también va en español
   (`envoltura`, `franja`, `toldo`, `cierra`, `pinta`). No mezclar idiomas.
6. **Un solo CSS y tres JS.** No se añaden archivos sin motivo fuerte.
7. **Nada de inventar** precios, plazos, URLs de clientes ni testimonios. Si
   falta un dato, se marca en `PERSONALIZAR.md` y se deja el hueco visible.

## 2. Comandos

```bash
node _dev-servidor.js
```

Sirve la carpeta en `http://localhost:5174` y resuelve rutas sin extensión igual
que el hosting. `node` del sistema es 16.10 y basta: el servidor es CommonJS.

```bash
node "C:\Users\Dario\.claude\skills\impeccable\scripts\detect.mjs" index.html
```

Detector de antipatrones de **impeccable** (instalado global en `~\.claude`,
nunca copiado dentro del proyecto). **Exit 0 = limpio.** Pásalo por cada página
que toques antes de darla por buena.

## 3. Mapa

| Archivo | Dirección publicada | Qué es |
|---|---|---|
| `index.html` | `/` | Portada: contrato de dirección, escaparate vivo, oferta |
| `diseno-web.html` | `/diseno-web` | Los tres formatos, precios y desplegables |
| `trabajos.html` | `/trabajos` | Rejilla del portfolio + filtros (menú: «La calle») |
| `como-trabajo.html` | `/como-trabajo` | Los cuatro pasos del método |
| `sobre-mi.html` | `/sobre-mi` | Quién está detrás |
| `presupuesto.html` | `/presupuesto` | Formulario, WhatsApp y correo |
| `aviso-legal.html` | `/aviso-legal` | Titular, uso, propiedad intelectual |
| `privacidad.html` | `/privacidad` | Datos, finalidades, proveedores, derechos |
| `cookies.html` | `/cookies` | No hay cookies; sí `localStorage` de capturas |
| `404.html` | — | Lo sirve Vercel solo |

```
assets/css/estilos.css    Sistema entero, 18 secciones numeradas en comentarios
assets/js/proyectos.js    Datos del portfolio — lo único que se toca a menudo
assets/js/escaparates.js  Motor de capturas, fichas y visor
assets/js/sitio.js        Menú, año, .entra, formulario, varilla y cierre
vercel.json               cleanUrls + los 301 de las direcciones antiguas
.htaccess                 Lo mismo para Apache, por si se muda
robots.txt · sitemap.xml · favicon.svg
_dev-servidor.js          No se sube al hosting
```

Los nombres de archivo **son** las direcciones. Renombrar una página obliga a
tocar los enlaces de las siete, su `canonical` y su `og:url`, `sitemap.xml`, y a
dejar el 301 de la vieja en `vercel.json` y en `.htaccess`.

Para localizar CSS, busca la cabecera numerada (`/* --- 9. Oferta`). Añade
reglas **dentro de su sección**, no al final del archivo.

## 4. Convenciones

- **Estado en atributos `data-`**, no en clases: `data-estado="cerrado"`,
  `data-abierta="no"`, `data-vista="movil"`. El CSS lee `[data-estado="…"]`.
  Las clases describen qué es la cosa, nunca en qué estado está.
- **Nada de `!important`** y nada de estilos en línea salvo variables por
  instancia (`style="--tono:#ff5c3a"`).
- **JS: `var`, funciones nombradas, sin frameworks.** `escaparates.js` expone
  `window.Escaparates = { captura, normaliza, pinta, abreVisor }`; es la única
  variable global del sitio.
- **Los comentarios explican el porqué, no el qué.** Si una regla parece
  arbitraria, es que costó descubrirla: déjala documentada en el sitio.
- **Accesibilidad no opcional:** `aria-current` en el menú, `aria-expanded` en
  el desplegable, `aria-pressed` en los conmutadores, foco visible siempre,
  visor con foco atrapado y `Esc`, y todo bajo `prefers-reduced-motion`.

## 5. Trampas ya pagadas

No las vuelvas a pisar; todas están comprobadas midiendo, no a ojo.

- **`overflow-x: hidden` va en `html`, jamás en `body`.** En el `body` convierte
  su desbordamiento vertical en `auto` y anula cualquier `position: sticky` de
  dentro.
- **Las máscaras del toldo llevan `left bottom`, no `bottom`.** Por defecto la
  máscara se centra al 50 % y los festones se desincronizan de las franjas.
- **El toldo cuelga fuera de la cabecera** (`position:absolute; bottom:-24px`).
  Si se mete dentro, la cabecera reserva esos 24 px y se ve el fondo del body
  entre festón y festón.
- **Especificidad en los numerales:** `.fase p` gana a `.fase__marca`; hay que
  escribir `.fase .fase__marca`.
- **`.lista-marcada li` es una rejilla de dos columnas**: el rombo y el texto.
  Si dentro del `<li>` hay un `<a>` o un `<strong>`, eso ya son dos elementos y
  el segundo se cae a otra fila, con el texto desalineado y el enlace debajo.
  El contenido de cada punto va **siempre envuelto en un `<span>`**.
- **mShots contesta con un gris de 400×300** mientras genera. Se rechaza por
  tamaño exacto; si no, se cuela como si fuera la web del cliente.
- **thum.io ignora la espera** (devuelve la misma imagen byte a byte). Solo
  Microlink respeta `waitForTimeout`, así que las fichas con `espera` van a
  Microlink y el resto a thum.io, que es más rápido. Tiempo de espera: 22 s.
- **Microlink son 25 peticiones al día por IP del visitante**, y cada vista del
  visor gasta una. Por eso no se le pide la imagen (`embed=`) sino su JSON: de
  ahí sale la dirección definitiva en su CDN, que no cuenta para el cupo y se
  guarda 30 días en `localStorage`. Y por eso se le piden `type=jpeg&quality=72`
  con `viewport.deviceScaleFactor=1`: por defecto devuelve 2560×1600 y 2,7 MB;
  así son 1280×800 y 104 KB. Medido, no estimado.
- **Con `espera` obligatoria no vale el relevo.** Si Microlink fallaba, la
  cadena caía en thum.io y la captura salía con el logo del intro — se veía al
  abrir el visor, que pide una captura por vista. Por eso `captura()` tiene un
  cuarto argumento, `estricto`: reintenta Microlink y, si no, no hay captura.
- **Bermellón doble:** `--accion` no llega a 4,5:1 sobre la baldosa. Texto y
  grafismo sobre claro usan `--accion-tinta`; el vivo solo relleno o sobre azul.
- **Sin bloqueo de scroll al bajar el cierre:** el `overflow:hidden` en el body
  dejaba una franja clara a la derecha. El cierre es `fixed` y ya tapa todo.

## 6. Cómo verificar

El panel del navegador bloquea `localhost` y las capturas fallan a menudo. El
método que funciona es **medir el DOM en vivo** con `javascript_tool`:
`getBoundingClientRect` para huecos y desbordes, `getComputedStyle` + la fórmula
WCAG para contraste, `scrollWidth > clientWidth` para desbordes horizontales,
`getPointAtLength` / `getScreenCTM` para geometría SVG. Nunca des por bueno un
ajuste visual «a ojo» si se puede medir.

Si no hay navegador disponible, dilo claramente en la respuesta en vez de
afirmar que se ha comprobado.

## 7. Al cerrar un cambio

1. `detect.mjs` en exit 0 en cada página tocada.
2. Contraste medido si has tocado color, a 390 px y a 1440 px.
3. Sin desbordes horizontales a 390 px.
4. Sigue abriendo con doble clic (sin servidor).
5. Si has cambiado precios, plazos, contacto o condiciones, actualiza también
   `PERSONALIZAR.md`; si has cambiado el sistema visual, `DESIGN.md`.

## 8. Cómo responder a Dario

Va al grano y detecta el relleno. Cuando pide un ajuste visual, quiere **ese**
ajuste: no aproveches para rediseñar de paso. Si algo se ha intentado ya y
falló, dilo en una línea y propón la alternativa en vez de repetir el intento.
Si dos lecturas de la petición dan resultados muy distintos, pregunta antes de
gastar el trabajo.
