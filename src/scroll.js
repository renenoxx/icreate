import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function splitHeadlineWords() {
  document.querySelectorAll(".display .line").forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.innerHTML = words
      .map((word) => `<span class="word"><span>${word}</span></span>`)
      .join("");
  });
}

function initWordRotate() {
  const windowEl = document.querySelector("[data-rotate]");
  if (!windowEl) return;
  const words = Array.from(windowEl.children);
  if (words.length < 2) return;

  gsap.set(words, { yPercent: 120, autoAlpha: 0 });
  gsap.set(words[0], { yPercent: 0, autoAlpha: 1 });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const tl = gsap.timeline({ repeat: -1 });
  words.forEach((word, index) => {
    const next = words[(index + 1) % words.length];
    tl.to(word, { yPercent: -120, autoAlpha: 0, duration: 0.7, ease: "power3.inOut" }, "+=1.35")
      .fromTo(
        next,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.inOut" },
        "<"
      );
  });
}

export function initScroll() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = new Lenis({
    duration: reduced ? 0.6 : 1.35,
    lerp: 0.075,
    smoothWheel: true,
    syncTouch: false,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-progress]");

  lenis.on("scroll", ({ scroll, limit }) => {
    const max = limit || document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, scroll / max) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;

    header?.classList.toggle("scrolled", scroll > 24);
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.6 });
      document.body.classList.remove("menu-open");
    });
  });

  splitHeadlineWords();
  initWordRotate();

  gsap.set(".display .word span", { yPercent: 120 });
  gsap.set(".lede, .hero-actions, .eyebrow, .hero-footer, .hero-aside, .hero-rotate", {
    autoAlpha: 0,
    y: 28,
  });

  const intro = gsap.timeline({ delay: 0.12 });
  intro
    .to(".display .word span", {
      yPercent: 0,
      duration: 1.25,
      ease: "power4.out",
      stagger: 0.08,
    })
    .to(
      ".eyebrow, .lede, .hero-rotate, .hero-actions, .hero-footer, .hero-aside",
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.07,
      },
      "-=0.8"
    );

  gsap.utils.toArray(".reveal-line span").forEach((line) => {
    gsap.from(line, {
      yPercent: 110,
      duration: 1.25,
      ease: "power4.out",
      scrollTrigger: {
        trigger: line.parentElement,
        start: "top 86%",
      },
    });
  });

  gsap.utils.toArray(".reveal").forEach((node) => {
    gsap.from(node, {
      autoAlpha: 0,
      y: 36,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: node,
        start: "top 88%",
      },
    });
  });

  gsap.utils.toArray(".service-item").forEach((item, index) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 42,
      duration: 1,
      delay: index * 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
      },
    });
  });

  gsap.from(".principle", {
    autoAlpha: 0,
    y: 40,
    duration: 1.05,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".principle-list",
      start: "top 82%",
    },
  });

  gsap.from(".process-list li", {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".process-list",
      start: "top 82%",
    },
  });

  gsap.from(".stat", {
    autoAlpha: 0,
    y: 32,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".stat-grid",
      start: "top 86%",
    },
  });

  const countEl = document.querySelector("[data-count]");
  if (countEl) {
    const target = Number(countEl.dataset.count || 0);
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.6,
      ease: "power2.out",
      snap: { n: 1 },
      onUpdate: () => {
        countEl.textContent = String(obj.n).padStart(2, "0");
      },
      scrollTrigger: {
        trigger: countEl,
        start: "top 85%",
      },
    });
  }

  gsap.from(".client-pills li", {
    autoAlpha: 0,
    y: 18,
    duration: 0.7,
    stagger: 0.06,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".client-pills",
      start: "top 88%",
    },
  });

  gsap.from(".project-form .form-field", {
    autoAlpha: 0,
    y: 28,
    duration: 0.95,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".project-form",
      start: "top 86%",
    },
  });

  gsap.from(".contact-row", {
    autoAlpha: 0,
    y: 32,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-rows",
      start: "top 84%",
    },
  });

  const featured = document.querySelector("[data-featured]");
  if (featured) {
    gsap.fromTo(
      featured,
      { autoAlpha: 0.35, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".featured",
          start: "top 80%",
          end: "center center",
          scrub: 1,
        },
      }
    );

    gsap.fromTo(
      ".featured-logo",
      { scale: 0.9, y: 36 },
      {
        scale: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".featured",
          start: "top 85%",
          end: "center center",
          scrub: 1.2,
        },
      }
    );

    gsap.fromTo(
      ".featured-ghost",
      { y: 90, autoAlpha: 0.2 },
      {
        y: -70,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".featured",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  return lenis;
}
