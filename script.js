
/* =========================================
   COVID.19 — JAVASCRIPT
   Interacciones y animaciones de la página
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Elementos principales
  const body = document.body;
  const menuButton = document.getElementById("menuButton");
  const navigation = document.getElementById("navigation");
  const themeButton = document.getElementById("themeButton");
  const progress = document.getElementById("progress");
  const year = document.getElementById("year");

  /* =========================================
     1. AÑO AUTOMÁTICO
  ========================================= */

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =========================================
     2. MENÚ MÓVIL
  ========================================= */

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
      );

      menuButton.textContent = isOpen ? "✕" : "☰";
    });

    // Cerrar el menú al seleccionar una sección
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
        menuButton.textContent = "☰";
      });
    });

    // Cerrar el menú con Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
        menuButton.textContent = "☰";
      }
    });
  }

  /* =========================================
     3. MODO OSCURO Y CLARO
  ========================================= */

  function updateThemeButton() {
    if (!themeButton) return;

    const isLight = body.classList.contains("light-theme");

    themeButton.textContent = isLight ? "☾" : "☼";
    themeButton.setAttribute(
      "aria-label",
      isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
    );
    themeButton.title = isLight
      ? "Activar modo oscuro"
      : "Activar modo claro";
  }

  // Recuperar el tema guardado, si existe
  try {
    const savedTheme = localStorage.getItem("covid-theme");

    if (savedTheme === "light") {
      body.classList.add("light-theme");
    }
  } catch (error) {
    // La página sigue funcionando si el almacenamiento está bloqueado.
  }

  updateThemeButton();

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      body.classList.toggle("light-theme");

      const theme = body.classList.contains("light-theme")
        ? "light"
        : "dark";

      try {
        localStorage.setItem("covid-theme", theme);
      } catch (error) {
        // El cambio visual funciona aunque no se pueda guardar.
      }

      updateThemeButton();
    });
  }

  /* =========================================
     4. BARRA DE PROGRESO DE LECTURA
  ========================================= */

  let scrollScheduled = false;

  function updateScrollProgress() {
    if (!progress) return;

    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      scrollableHeight > 0
        ? (window.scrollY / scrollableHeight) * 100
        : 0;

    progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;

    scrollScheduled = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        window.requestAnimationFrame(updateScrollProgress);
        scrollScheduled = true;
      }
    },
    { passive: true }
  );

  updateScrollProgress();

  /* =========================================
     5. ANIMACIONES AL DESPLAZARSE
  ========================================= */

  const revealElements = document.querySelectorAll(
    ".section, .card, .notice, .hero-copy, .hero-art, .footer"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    revealElements.forEach((element) => {
      element.classList.add("reveal-ready");
    });

    // Añadir los estilos necesarios desde JavaScript
    const revealStyle = document.createElement("style");

    revealStyle.textContent = `
      .reveal-ready {
        opacity: 0;
        transform: translateY(22px);
        transition:
          opacity .65s ease,
          transform .65s ease;
      }

      .reveal-ready.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal-ready {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;

    document.head.appendChild(revealStyle);

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  /* =========================================
     6. ILUSTRACIÓN DEL CORONAVIRUS
  ========================================= */

  const virus = document.getElementById("virus");

  if (virus && !virus.querySelector(".spike")) {
    const spikeCount = 20;

    for (let i = 0; i < spikeCount; i++) {
      const spike = document.createElement("span");

      spike.className = "spike";
      spike.setAttribute("aria-hidden", "true");
      spike.style.transform = `rotate(${(360 / spikeCount) * i}deg)`;

      virus.appendChild(spike);
    }
  }

  /* =========================================
     7. MOVIMIENTO SUAVE DEL VIRUS
  ========================================= */

  if (virus && !reducedMotion) {
    let pointerFrame = null;

    document.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 900) return;

      if (pointerFrame !== null) {
        cancelAnimationFrame(pointerFrame);
      }

      pointerFrame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 12;
        const y = (event.clientY / window.innerHeight - 0.5) * 12;

        virus.style.setProperty("--mouse-x", `${x}px`);
        virus.style.setProperty("--mouse-y", `${y}px`);

        pointerFrame = null;
      });
    });
  }

  /* =========================================
     8. TARJETAS CON EFECTO INTERACTIVO
  ========================================= */

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointerdown", () => {
      card.classList.add("card-active");
    });

    const removeActive = () => {
      card.classList.remove("card-active");
    };

    card.addEventListener("pointerup", removeActive);
    card.addEventListener("pointercancel", removeActive);
    card.addEventListener("pointerleave", removeActive);
  });

  const interactionStyle = document.createElement("style");

  interactionStyle.textContent = `
    .card {
      -webkit-tap-highlight-color: transparent;
    }

    .card.card-active {
      border-color: var(--cyan);
    }

    .virus {
      translate: var(--mouse-x, 0px) var(--mouse-y, 0px);
      transition: translate .25s ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
      .virus {
        translate: none;
      }
    }
  `;

  document.head.appendChild(interactionStyle);

  /* =========================================
     9. ANIMACIÓN DEL ENLACE ACTIVO DEL MENÚ
  ========================================= */

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(
    '#navigation a[href^="#"]'
  );

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${entry.target.id}`;

            if (isCurrent) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  console.log("COVID.19: JavaScript cargado correctamente.");
});