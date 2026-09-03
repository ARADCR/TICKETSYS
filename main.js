/**
 * LUCENT — Ultra-Premium Editorial & Scrollytelling Experience
 * Powered by GSAP & ScrollTrigger
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReducedMotion = motionQuery.matches;

  /* =========================================================================
     1. HERO VIDEO CONTROLLER
     ========================================================================= */
  const heroSection = document.getElementById('hero');
  const heroVideo = document.getElementById('hero-video');

  if (heroVideo && heroSection) {
    heroVideo.loop = true;

    const playHeroVideo = () => {
      if (motionQuery.matches) return;
      const p = heroVideo.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    };

    const pauseHeroVideo = () => {
      if (!heroVideo.paused) {
        heroVideo.pause();
      }
    };

    if (motionQuery.matches) {
      pauseHeroVideo();
    }

    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        pauseHeroVideo();
      } else {
        playHeroVideo();
      }
    });

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: playHeroVideo,
      onEnterBack: playHeroVideo,
      onLeave: pauseHeroVideo,
      onLeaveBack: pauseHeroVideo
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseHeroVideo();
      } else if (!motionQuery.matches) {
        const rect = heroSection.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          playHeroVideo();
        }
      }
    });
  }

  /* =========================================================================
     2. HERO CINEMATIC ENTRANCE (GSAP)
     ========================================================================= */
  if (!isReducedMotion) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero-word', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.18,
        delay: 0.2
      })
      .from(
        '#hero-body',
        {
          y: 20,
          opacity: 0,
          duration: 0.8
        },
        '-=0.6'
      )
      .from(
        '#hero-action',
        {
          y: 16,
          opacity: 0,
          duration: 0.8
        },
        '-=0.5'
      );
  }

  /* =========================================================================
     3. KINETIC MANIFESTO WORD SCRUB
     ========================================================================= */
  const words = document.querySelectorAll('.m-word');
  if (words.length > 0 && !isReducedMotion) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '#manifiesto',
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 0.6
      }
    }).to(words, {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      ease: 'power2.out'
    });
  } else if (words.length > 0) {
    words.forEach((w) => {
      w.style.opacity = '1';
      w.style.transform = 'none';
    });
  }

  /* =========================================================================
     4. 1080P CANVAS SCROLLYTELLING WITH GSAP
     ========================================================================= */
  const TOTAL_FRAMES = 120;
  const canvas = document.getElementById('sequence-canvas');
  const extractionSection = document.getElementById('extraccion');

  if (canvas && extractionSection) {
    const ctx = canvas.getContext('2d');
    const frames = new Array(TOTAL_FRAMES);
    const isLoaded = new Array(TOTAL_FRAMES).fill(false);
    let currentFrameIndex = 0;

    const getFrameUrl = (index) => {
      const num = String(index + 1).padStart(4, '0');
      return `/sequence/frame_${num}.webp`;
    };

    // Render frame with high-quality smoothing and center alignment
    const renderFrame = (targetIndex) => {
      if (!ctx || canvas.width === 0 || canvas.height === 0) return;

      let imgToDraw = null;
      if (isLoaded[targetIndex] && frames[targetIndex]?.complete && frames[targetIndex]?.naturalWidth > 0) {
        imgToDraw = frames[targetIndex];
      } else {
        // Nearest fallback search
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          const prev = targetIndex - offset;
          if (prev >= 0 && isLoaded[prev] && frames[prev]?.complete && frames[prev]?.naturalWidth > 0) {
            imgToDraw = frames[prev];
            break;
          }
          const next = targetIndex + offset;
          if (next < TOTAL_FRAMES && isLoaded[next] && frames[next]?.complete && frames[next]?.naturalWidth > 0) {
            imgToDraw = frames[next];
            break;
          }
        }
      }

      if (!imgToDraw) return;

      const w = canvas.width;
      const h = canvas.height;
      const imgW = imgToDraw.naturalWidth || 1920;
      const imgH = imgToDraw.naturalHeight || 1080;

      const hRatio = w / imgW;
      const vRatio = h / imgH;
      const ratio = Math.max(hRatio, vRatio);

      const renderW = imgW * ratio;
      const renderH = imgH * ratio;

      // Perfectly center the cup and espresso flow
      const renderX = (w - renderW) / 2;
      const renderY = (h - renderH) / 2;

      ctx.fillStyle = '#070504';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgToDraw, renderX, renderY, renderW, renderH);
    };

    // Canvas resize with DPR
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderFrame(currentFrameIndex);
    };

    // Progressive frame preloader
    const initPreload = () => {
      // 1. High-priority first frame
      const firstImg = new Image();
      firstImg.src = getFrameUrl(0);
      firstImg.onload = () => {
        frames[0] = firstImg;
        isLoaded[0] = true;
        renderFrame(0);
        loadRemaining();
      };

      // 2. Remaining frames
      const loadRemaining = () => {
        for (let i = 1; i < TOTAL_FRAMES; i++) {
          const img = new Image();
          img.src = getFrameUrl(i);
          img.onload = () => {
            frames[i] = img;
            isLoaded[i] = true;
            if (Math.abs(i - currentFrameIndex) <= 2) {
              renderFrame(currentFrameIndex);
            }
          };
        }
      };
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    initPreload();
    resizeCanvas();

    // GSAP ScrollTrigger Sequence Scrub
    const sequenceObj = { frame: 0 };
    gsap.to(sequenceObj, {
      frame: TOTAL_FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: extractionSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: () => {
          const idx = Math.round(sequenceObj.frame);
          if (idx !== currentFrameIndex) {
            currentFrameIndex = idx;
            renderFrame(currentFrameIndex);
          }
        }
      }
    });
  }

  /* =========================================================================
     5. ASYMMETRIC MOVEMENTS PARALLAX & REVEAL
     ========================================================================= */
  const movements = document.querySelectorAll('.movement-item');
  movements.forEach((item, index) => {
    const num = item.querySelector('.movement-num');
    const content = item.querySelector('.movement-content');

    if (!isReducedMotion && num) {
      // Parallax on monumental background numerals
      gsap.fromTo(
        num,
        { y: 60, opacity: 0.05 },
        {
          y: -80,
          opacity: 0.16,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    // Smooth activation of content
    ScrollTrigger.create({
      trigger: item,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => item.classList.add('is-active'),
      onEnterBack: () => item.classList.add('is-active'),
      onLeave: () => item.classList.remove('is-active'),
      onLeaveBack: () => item.classList.remove('is-active')
    });
  });

  /* =========================================================================
     6. MAGNETIC BUTTON MICRO-INTERACTIONS
     ========================================================================= */
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  if (!isReducedMotion) {
    magneticButtons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.35)'
        });
      });
    });
  }

  /* =========================================================================
     7. SMOOTH IN-PAGE NAVIGATION & HEADER SCROLL STATE
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* =========================================================================
     8. RESERVA & CONTACTO (Envío y Feedback)
     ========================================================================= */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const contactBtnText = document.getElementById('contact-btn-text');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const name = nameInput ? nameInput.value.trim() : 'Estimado/a';

      if (contactBtnText) {
        contactBtnText.textContent = 'Enviando solicitud...';
      }

      setTimeout(() => {
        formFeedback.textContent = `✓ Gracias, ${name}. Tu solicitud de reserva fue recibida. Te confirmaremos por correo en breve.`;
        formFeedback.style.color = 'var(--color-amber)';
        if (contactBtnText) {
          contactBtnText.textContent = '✓ Solicitud Confirmada';
        }
        contactForm.reset();
      }, 600);
    });
  }

  /* =========================================================================
     9. MENÚ: REVELADO FLOTANTE AL CURSOR (Hover Preview)
     ========================================================================= */
  const menuSection = document.getElementById('carta');
  const floatingPreview = document.getElementById('menu-floating-preview');
  const floatingCard = floatingPreview ? floatingPreview.querySelector('.floating-preview-card') : null;
  const floatingImg = document.getElementById('floating-preview-img');
  const floatingTitle = document.getElementById('floating-preview-title');
  const floatingPrice = document.getElementById('floating-preview-price');
  const menuItems = document.querySelectorAll('.menu-item');

  if (menuSection && floatingPreview && !isReducedMotion) {
    let lastX = 0;
    let targetX = 0;
    let targetY = 0;
    let isHoveringItem = false;

    // Track mouse position over menu section
    menuSection.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const deltaX = e.clientX - lastX;
      lastX = e.clientX;

      gsap.to(floatingPreview, {
        x: targetX,
        y: targetY,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (floatingCard) {
        const rot = Math.max(-6, Math.min(6, deltaX * 0.12));
        gsap.to(floatingCard, {
          rotation: rot,
          duration: 0.35,
          ease: 'power1.out'
        });
      }
    });

    menuItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        isHoveringItem = true;
        const imgUrl = item.dataset.image;
        const title = item.dataset.title;
        const price = item.dataset.price;

        if (imgUrl && floatingImg) floatingImg.src = imgUrl;
        if (title && floatingTitle) floatingTitle.textContent = title;
        if (price && floatingPrice) floatingPrice.textContent = price;

        gsap.to(floatingPreview, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.6)',
          overwrite: 'auto'
        });
      });

      item.addEventListener('mouseleave', () => {
        isHoveringItem = false;
        gsap.to(floatingPreview, {
          autoAlpha: 0,
          scale: 0.9,
          duration: 0.2,
          ease: 'power2.in',
          overwrite: 'auto'
        });
      });
    });

    menuSection.addEventListener('mouseleave', () => {
      if (isHoveringItem) {
        isHoveringItem = false;
        gsap.to(floatingPreview, {
          autoAlpha: 0,
          scale: 0.85,
          duration: 0.2
        });
      }
    });
  }

  /* =========================================================================
     10. MENÚ MÓVIL SANDWICH: ANIMACIÓN CINEMÁTICA Y CIRCULAR
     ========================================================================= */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  let isMenuOpen = false;
  let menuAnimationInProgress = false;

  const openMobileMenu = () => {
    if (menuAnimationInProgress || isMenuOpen) return;
    menuAnimationInProgress = true;
    isMenuOpen = true;

    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        menuAnimationInProgress = false;
      }
    });

    tl.set(mobileMenu, { opacity: 1, visibility: 'visible' })
      .to(mobileMenu, {
        clipPath: 'circle(150% at calc(100% - 38px) 34px)',
        duration: 0.65,
        ease: 'power4.inOut'
      })
      .fromTo(
        '.mobile-nav-item',
        { y: 55, opacity: 0, rotateX: 20 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power3.out'
        },
        '-=0.35'
      )
      .fromTo(
        '.mobile-menu-footer',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      );
  };

  const closeMobileMenu = (callback) => {
    if (menuAnimationInProgress || !isMenuOpen) return;
    menuAnimationInProgress = true;

    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');

    const tl = gsap.timeline({
      onComplete: () => {
        isMenuOpen = false;
        menuAnimationInProgress = false;
        mobileMenu.classList.remove('is-open');
        gsap.set(mobileMenu, { opacity: 0, visibility: 'hidden' });
        document.body.style.overflow = '';
        if (typeof callback === 'function') callback();
      }
    });

    tl.to('.mobile-nav-item', {
      y: -20,
      opacity: 0,
      duration: 0.25,
      stagger: 0.03,
      ease: 'power2.in'
    })
      .to(
        mobileMenu,
        {
          clipPath: 'circle(0% at calc(100% - 38px) 34px)',
          duration: 0.5,
          ease: 'power4.inOut'
        },
        '-=0.15'
      );
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      if (isMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          closeMobileMenu(() => {
            target.scrollIntoView({ behavior: 'smooth' });
          });
        }
      });
    });
  }

  /* =========================================================================
     11. DESCARGA DE CARTA EN PDF DE ALTA CALIDAD & COMPARTIR MENÚ
     ========================================================================= */
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  const pdfBtnLabel = document.getElementById('pdf-btn-label');
  const btnShareMenu = document.getElementById('btn-share-menu');
  const shareBtnLabel = document.getElementById('share-btn-label');
  const pdfTemplate = document.getElementById('pdf-menu-template');

  if (btnDownloadPdf && pdfTemplate) {
    btnDownloadPdf.addEventListener('click', async () => {
      if (btnDownloadPdf.disabled) return;
      btnDownloadPdf.disabled = true;
      const originalText = pdfBtnLabel ? pdfBtnLabel.textContent : 'Descargar Carta (PDF)';
      if (pdfBtnLabel) pdfBtnLabel.textContent = 'Generando Carta PDF...';

      try {
        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
          import('jspdf'),
          import('html2canvas')
        ]);

        const exportContainer = document.getElementById('pdf-export-container');
        if (exportContainer) {
          exportContainer.style.position = 'fixed';
          exportContainer.style.left = '0';
          exportContainer.style.top = '0';
          exportContainer.style.zIndex = '-9999';
          exportContainer.style.opacity = '1';
        }

        const canvas = await html2canvas(pdfTemplate, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#070504',
          windowWidth: 800
        });

        if (exportContainer) {
          exportContainer.style.left = '-9999px';
          exportContainer.style.opacity = '0';
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(pageHeight, imgHeight));
        pdf.save('LUCENT_Carta_de_Barra.pdf');

        if (pdfBtnLabel) pdfBtnLabel.textContent = '✓ Carta Descargada';
        setTimeout(() => {
          if (pdfBtnLabel) pdfBtnLabel.textContent = originalText;
          btnDownloadPdf.disabled = false;
        }, 3000);
      } catch (err) {
        console.error('Error al generar PDF:', err);
        window.print();
        if (pdfBtnLabel) pdfBtnLabel.textContent = originalText;
        btnDownloadPdf.disabled = false;
      }
    });
  }

  if (btnShareMenu) {
    btnShareMenu.addEventListener('click', async () => {
      const shareUrl = window.location.origin + '/#carta';
      const shareData = {
        title: 'LUCENT — Café de Especialidad & Repostería',
        text: 'Descubrí la carta de cafés calibrados y bollería artesanal de LUCENT en Roma Norte, CDMX.',
        url: shareUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          if (shareBtnLabel) {
            shareBtnLabel.textContent = '✓ Carta Compartida';
            setTimeout(() => { shareBtnLabel.textContent = 'Compartir Carta'; }, 2500);
          }
        } catch (e) {
          // Dialog closed
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
          if (shareBtnLabel) {
            shareBtnLabel.textContent = '✓ Enlace Copiado';
            setTimeout(() => { shareBtnLabel.textContent = 'Compartir Carta'; }, 2500);
          }
        } catch (err) {
          window.location.hash = '#carta';
        }
      }
    });
  }
});
