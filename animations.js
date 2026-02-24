(() => {
  const targets = document.querySelectorAll(
    ".panel, .card, .member, .trust-card, .project-card, .redesign-card, .hero-copy, .project-hero-copy, .process-step, .result-card"
  );

  const revealModes = ["up", "left", "right", "zoom"];

  if (targets.length) {
    targets.forEach((el, index) => {
      el.classList.add("js-animate");
      el.dataset.anim = revealModes[index % revealModes.length];
      el.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -7% 0px" }
      );

      targets.forEach((el) => observer.observe(el));
    }
  }

  const popTargets = document.querySelectorAll(
    ".section-tag, .trust-tag, h2, .lead, .gallery-note, .services-cta-note, .contact-subtext"
  );

  if (popTargets.length) {
    popTargets.forEach((el) => el.classList.add("js-pop"));

    if (!("IntersectionObserver" in window)) {
      popTargets.forEach((el) => el.classList.add("is-visible"));
    } else {
      const popObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.22, rootMargin: "0px 0px -6% 0px" }
      );

      popTargets.forEach((el) => popObserver.observe(el));
    }
  }

  const footer = document.querySelector(".footer");
  if (footer) {
    if (!("IntersectionObserver" in window)) {
      footer.classList.add("is-visible");
    } else {
      const footerObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            footer.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      footerObserver.observe(footer);
    }
  }

  const counters = document.querySelectorAll("[data-count]");

  function animateCounter(node) {
    const target = Number(node.dataset.count || 0);
    if (!target) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (counters.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach((counter) => countObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      counter.textContent = counter.dataset.count || "0";
    });
  }

  const progress = document.createElement("div");
  progress.id = "scroll-progress";
  document.body.appendChild(progress);

  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(Math.max(value, 0), 100)}%`;
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMain = header ? header.querySelector(".nav-main") : null;
  let lastScrollY = window.scrollY;

  function closeMobileNav() {
    if (!header || !navToggle || !navMain) return;
    header.classList.remove("nav-open");
    navMain.classList.remove("is-open");
    document.body.classList.remove("nav-open-mobile");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMain && header) {
    navToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      navMain.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open-mobile", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) return;
      if (header.contains(event.target)) return;
      closeMobileNav();
    });

    navMain.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) closeMobileNav();
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) closeMobileNav();
    });
  }

  function updateHeaderState() {
    if (!header) return;
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const isDown = delta > 0;

    header.classList.toggle("is-scrolled", currentY > 28);

    if (currentY < 70 || Math.abs(delta) < 5) {
      header.classList.remove("is-hidden");
    } else if (isDown) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentY;
  }

  if (header) {
    header.addEventListener("mouseenter", () => {
      header.classList.remove("is-hidden");
    });
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typeTargets = document.querySelectorAll(".hero-pre, .project-kicker");

  function runTyping(el) {
    if (!el || el.dataset.typed === "1") return;
    const original = el.textContent || "";
    if (!original.trim()) return;
    el.dataset.typed = "1";
    el.textContent = "";
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      el.textContent = original.slice(0, i);
      if (i >= original.length) window.clearInterval(interval);
    }, 28);
  }

  if (!reduceMotion && typeTargets.length) {
    if ("IntersectionObserver" in window) {
      const typeObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runTyping(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.8 }
      );

      typeTargets.forEach((el) => typeObserver.observe(el));
    } else {
      typeTargets.forEach((el) => runTyping(el));
    }
  }

  const canUsePointerEffects =
    window.matchMedia("(pointer: fine)").matches &&
    !reduceMotion;

  if (!canUsePointerEffects) return;

  const halo = document.querySelector(".page-halo");
  const depthTargets = document.querySelectorAll(".hero-photo, .project-face, .client-face");
  const tiltCards = document.querySelectorAll(
    ".card, .member, .trust-card, .project-card, .result-card, .redesign-card, .process-step"
  );
  const magneticButtons = document.querySelectorAll(".btn");
  const cursorGlow = document.createElement("div");
  cursorGlow.id = "cursor-glow";
  document.body.appendChild(cursorGlow);

  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;

  function paintDepth() {
    rafId = null;
    const x = (mouseX / window.innerWidth - 0.5) * 2;
    const y = (mouseY / window.innerHeight - 0.5) * 2;

    if (halo) {
      halo.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    }

    depthTargets.forEach((el) => {
      el.style.transform = `translate(${x * -4}px, ${y * -3}px)`;
    });
  }

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    if (rafId) return;
    rafId = window.requestAnimationFrame(paintDepth);
  });

  window.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
    if (halo) halo.style.transform = "";
    depthTargets.forEach((el) => {
      el.style.transform = "";
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 8;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-7px) scale(1.01)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  magneticButtons.forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      btn.style.transform = `translate(${(x * 8).toFixed(2)}px, ${(y * 6).toFixed(2)}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  if (!reduceMotion) {
    let navigating = false;

    function shouldHandleLink(link, event) {
      if (!link) return false;
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return false;
      if (link.target && link.target !== "_self") return false;
      if (link.hasAttribute("download")) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (event.button !== 0) return false;
      if (link.origin !== window.location.origin) return false;
      if (link.pathname === window.location.pathname && link.hash) return false;
      return true;
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!shouldHandleLink(link, event)) return;
      if (navigating) return;

      navigating = true;
      event.preventDefault();
      document.body.classList.add("page-transitioning");

      window.setTimeout(() => {
        window.location.href = link.href;
      }, 250);
    });
  }
})();
