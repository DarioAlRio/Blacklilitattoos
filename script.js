// RED DE SEGURIDAD. Va lo primero del archivo a propósito: si cualquier cosa de más
// abajo lanza un error, esta parte ya se ha ejecutado y sigue en pie. Sin ella, un fallo
// dejaría el contenido invisible (.reveal es opacity:0) y la portada bloqueada por el splash.
setTimeout(function(){
  if (window.__blOk) return; // el archivo llegó hasta el final: no hace falta tocar nada
  document.documentElement.classList.remove('preload');
  var splash = document.getElementById('splash');
  if (splash) splash.remove();
  document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
}, 3000);

// splash screen: show the logo briefly, then reveal the site (index.html only)
(function(){
  const splash = document.getElementById('splash');
  if (!splash) return;
  const reveal = () => {
    splash.classList.add('hide');
    document.documentElement.classList.remove('preload');
    setTimeout(() => splash.remove(), 900);
  };
  // 600 ms es el suelo: aunque la portada esté lista antes (se mide en 166 ms
  // en local), no aparece hasta entonces. Da tiempo a ver el logo sin que la
  // espera se coma medio segundo del presupuesto de carga.
  const minDelay = new Promise(res => setTimeout(res, 600));
  const pageLoaded = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, {once:true});
  });
  Promise.all([minDelay, pageLoaded]).then(reveal);
  // techo: si el evento load se atasca, la portada sale igual a los 2 s
  setTimeout(reveal, 2000);
})();

// nav scroll state (harmless on subpages: they force the "scrolled" look via CSS)
const nav = document.getElementById('siteNav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// robust scroll lock: works correctly even when scrolled to the bottom of the page
// (plain overflow:hidden on body breaks fixed-position menus on iOS once you've scrolled down)
let scrollLockY = 0;
function lockScroll(){
  scrollLockY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = -scrollLockY + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.classList.add('menu-open');
}
function unlockScroll(){
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.classList.remove('menu-open');
  window.scrollTo(0, scrollLockY);
}

// mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    open ? lockScroll() : unlockScroll();
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    unlockScroll();
  }));
}

// subtle draw-in for the small flower mark (safe: only runs if present)
const flowerPath = document.querySelector('.flower-icon path');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (flowerPath && !reduceMotion) {
  const len = flowerPath.getTotalLength();
  flowerPath.style.strokeDasharray = len;
  flowerPath.style.strokeDashoffset = len;
  flowerPath.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1) .1s';
  const flowerIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { flowerPath.style.strokeDashoffset = 0; flowerIO.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  flowerIO.observe(flowerPath.closest('.flower-icon'));
}

// legal modals (Aviso Legal, Privacidad, Cookies) — present in the footer on every page
document.querySelectorAll('[data-legal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById('modal-' + btn.dataset.legal);
    if (modal) { modal.classList.add('open'); lockScroll(); }
  });
});
document.querySelectorAll('.legal-modal').forEach(modal => {
  const close = () => { modal.classList.remove('open'); unlockScroll(); };
  modal.querySelector('[data-close-legal]').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
});

// FAQ accordion (faq.html only)
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-question').setAttribute('aria-expanded','false'); });
    if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
  });
});

// vídeo de eventos: el HTML lo deja en preload="none" y sin autoplay, así que no se
// descarga hasta que asoma por la pantalla. Quien no baja hasta él no paga los 3,9 MB.
const eventoVideo = document.querySelector('.events-video video');
if (eventoVideo) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    eventoVideo.controls = true; // que decida quien mira, no la página
  } else {
    const videoIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        eventoVideo.preload = 'auto';
        // si el navegador rechaza la reproducción automática, al menos que se pueda dar al play
        eventoVideo.play().catch(() => { eventoVideo.controls = true; });
        videoIO.unobserve(e.target);
      });
    }, { rootMargin: '200px' });
    videoIO.observe(eventoVideo);
  }
}

// scroll reveal
// se dispara en cuanto el bloque asoma por la parte de abajo. Antes se pedía un 15%
// del elemento visible, y eso no funciona con bloques más altos que la pantalla:
// el cuerpo de un artículo nunca llega a ese 15% y se quedaba invisible.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// lightbox: click any gallery/portfolio photo to enlarge, with caption + prev/next navigation
// (only present on estudio.html and trabajos.html)
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxName = document.getElementById('lightboxName');
  const lightboxDesc = document.getElementById('lightboxDesc');

  const allGalleryImgs = Array.from(document.querySelectorAll('.gallery-grid img, .portfolio-card img'));

  // each photo belongs to a group (its own section); swiping/arrows only move within that group
  function groupOf(img){
    return img.closest('.portfolio-card') ? 'portfolio' : 'studio';
  }
  let currentGroup = [];
  let currentIndex = 0;

  function captionFor(img){
    const card = img.closest('.portfolio-card, figure');
    if(!card) return {name:'', desc:''};
    const name = card.querySelector('.name')?.textContent || card.querySelector('figcaption')?.textContent || '';
    const desc = card.querySelector('.desc')?.textContent || '';
    return {name, desc};
  }

  // direction: 0 = no slide (first open), 1 = next (slide from right), -1 = prev (slide from left)
  function showImage(index, direction = 0){
    const nextIndex = (index + currentGroup.length) % currentGroup.length;
    const img = currentGroup[nextIndex];
    const {name, desc} = captionFor(img);

    function paint(){
      currentIndex = nextIndex;
      // la miniatura de la rejilla puede ser una versión pequeña del srcset:
      // para ampliar se usa el archivo grande que lleva anotado cada foto
      lightboxImg.src = img.dataset.full || img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      lightboxName.textContent = name;
      lightboxDesc.textContent = desc;
      if (direction !== 0) {
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = `translateX(${direction * 36}px) scale(0.96)`;
        lightboxImg.style.opacity = '0';
        lightboxImg.offsetHeight; // force reflow so the entrance transition actually plays
      }
      requestAnimationFrame(() => {
        lightboxImg.style.transition = 'opacity .45s cubic-bezier(.22,.61,.36,1), transform .45s cubic-bezier(.22,.61,.36,1)';
        lightboxImg.style.transform = 'translateX(0) scale(1)';
        lightboxImg.style.opacity = '1';
      });
    }

    if (direction !== 0) {
      lightboxImg.style.transition = 'opacity .22s ease, transform .22s ease';
      lightboxImg.style.transform = `translateX(${direction * -28}px) scale(0.97)`;
      lightboxImg.style.opacity = '0';
      setTimeout(paint, 180);
    } else {
      paint();
    }
  }

  // desde qué foto se abrió el visor, para devolver ahí el foco al cerrarlo
  let fotoDeOrigen = null;

  function openLightbox(img){
    fotoDeOrigen = img;
    currentGroup = allGalleryImgs.filter(i => groupOf(i) === groupOf(img));
    showImage(currentGroup.indexOf(img), 0);
    lightbox.classList.add('open');
    lockScroll();
    lightboxClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    unlockScroll();
    // sin esto, quien navega con teclado vuelve al principio de la página
    if (fotoDeOrigen) { fotoDeOrigen.focus(); fotoDeOrigen = null; }
  }

  allGalleryImgs.forEach((img) => {
    img.style.cursor = 'zoom-in';
    // una <img> no entra en el recorrido del tabulador ni responde a Enter:
    // hay que decirle al navegador que aquí se comporta como un botón
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1, -1));
  lightboxNext.addEventListener('click', () => showImage(currentIndex + 1, 1));
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') showImage(currentIndex - 1, -1);
    if(e.key === 'ArrowRight') showImage(currentIndex + 1, 1);
    if(e.key === 'Tab'){
      // el visor tapa la pantalla entera: el foco no debe escaparse a la
      // página de detrás, así que da vueltas entre sus tres botones
      const botones = [lightboxClose, lightboxPrev, lightboxNext];
      const i = botones.indexOf(document.activeElement);
      const siguiente = e.shiftKey
        ? (i <= 0 ? botones.length - 1 : i - 1)
        : (i === botones.length - 1 ? 0 : i + 1);
      e.preventDefault();
      botones[siguiente].focus();
    }
  });

  // mobile swipe: swipe down to close, swipe left/right to navigate (the X button still works too)
  const lightboxFrame = document.querySelector('.lightbox-frame');
  let touchStartX = 0, touchStartY = 0, touchCurX = 0, touchCurY = 0, isDragging = false;

  lightbox.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = touchCurX = e.touches[0].clientX;
    touchStartY = touchCurY = e.touches[0].clientY;
    isDragging = true;
    lightboxFrame.style.transition = 'none';
  }, {passive:true});

  lightbox.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    touchCurX = e.touches[0].clientX;
    touchCurY = e.touches[0].clientY;
    const dx = touchCurX - touchStartX;
    const dy = touchCurY - touchStartY;
    if (Math.abs(dy) > Math.abs(dx) && dy > 0) {
      lightboxFrame.style.transform = `translateY(${dy}px) scale(${Math.max(1 - dy / 900, 0.85)})`;
      lightbox.style.background = `rgba(10,8,6,${Math.max(0.92 - dy / 350, 0.25)})`;
    }
  }, {passive:true});

  lightbox.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const dx = touchCurX - touchStartX;
    const dy = touchCurY - touchStartY;
    lightboxFrame.style.transition = '';
    lightboxFrame.style.transform = '';
    lightbox.style.background = '';
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      closeLightbox();
    } else if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? showImage(currentIndex + 1, 1) : showImage(currentIndex - 1, -1);
    }
  });
}

// llegar hasta aqui significa que el archivo se ha ejecutado entero: la red de
// seguridad de arriba se desactiva sola y las animaciones siguen su curso normal.
window.__blOk = true;
