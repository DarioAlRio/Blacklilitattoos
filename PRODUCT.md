# PRODUCT.md — El Escaparate

Contexto duradero del producto. No es documentación de diseño (eso vive en
DESIGN.md) ni instrucciones de personalización (eso vive en PERSONALIZAR.md).

## Qué es

**El Escaparate** es el estudio de Dario Domínguez: diseña y programa webs para
negocios pequeños que ya tienen clientes en la calle y no tienen presencia
decente en internet. Es la web del propio estudio: capta encargos y enseña
trabajo hecho.

Nombre y dominio, decididos el 29/07/2026: **El Escaparate**, en
**elescaparateweb.com**, que es el que estaba libre. El `.com` a secas y el
`.es` los tiene un tercero que los vende. Descartados por el camino:
*Marquesina* y *Chaflán*.

## Mecanismo propio

Pegas la dirección de una web y sale su captura al momento, en escritorio y en
móvil, sin instalar nada. El estudio usa eso para dos cosas:

1. **El portfolio se mantiene solo.** Cada trabajo es una URL; la miniatura se
   genera desde fuera. Dario añade un cliente escribiendo una línea en
   `assets/js/proyectos.js`, no exportando imágenes.
2. **La captación empieza por el espejo.** El visitante pega la dirección de su
   web actual en la portada y la ve como la ve un desconocido. Nadie discute su
   propia captura.

## A quién le habla

Dueños de negocio local en España —tatuaje, alimentación, reformas, belleza,
cultura— que deciden solos y en poco tiempo. No son técnicos. Llegan desde el
móvil, muchas veces de noche y con prisa. Lo que necesitan creer: que esto lo
hace una persona concreta, que se entiende el precio y que existe trabajo real
detrás.

## Qué vende

Tres tipos de encargo, con precio de entrada visible («desde X €») y
presupuesto cerrado tras hablar:

- Web de una página (tarjeta de presentación con reserva o contacto)
- Web multipágina (catálogo, servicios, historia, contacto)
- Tienda online

**Lo que no se ofrece** (2026-07-29, decisión de Dario): aplicaciones web a
medida y rescate de webs ajenas. No los hace, así que no aparecen en ninguna
página, ni en los filtros del portfolio, ni en el formulario.

## Restricciones

- **Sin build.** HTML + CSS + JS a pelo. Se abre el archivo y funciona; se
  publica arrastrando la carpeta. El Node del equipo es el 16.10.
- **Sin backend.** Las capturas se piden a servicios públicos de screenshots y
  el formulario sale por un servicio externo de formularios.
- **Español (es-ES), tuteo.** Sin jerga técnica en la parte visible.
- **Multipágina de verdad**, no una sola página con anclas.

## Prueba real disponible

Trabajos hechos para negocios reales: Black Lili Tattoos, El Nido Biblioteca,
Pastor de Adrada, Zarea Beauty Studio y un proyecto de reformas. Sus URLs
públicas las rellena Dario en `assets/js/proyectos.js`; hasta entonces las
fichas se muestran en estado «pendiente de publicar» y nunca inventan una
dirección.

## Lo que no se inventa

Precios, plazos, número de clientes, testimonios y datos de contacto son
compromisos comerciales de Dario. Los que trae el código son valores por
defecto marcados en PERSONALIZAR.md para que los revise antes de publicar.
