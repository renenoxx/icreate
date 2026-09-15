import "./style.css";
import { createHeroScene } from "./hero3d.js";
import { initCursor } from "./cursor.js";
import { initScroll } from "./scroll.js";
import { initProjectForm } from "./projectForm.js";
import gsap from "gsap";

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

initCursor();
initProjectForm();

try {
  const canvas = document.querySelector("[data-hero-canvas]");
  if (canvas) createHeroScene(canvas);
} catch (error) {
  console.warn("Hero scene could not start.", error);
}

const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLinks = gsap.utils.toArray("[data-menu-link]");

gsap.set(menuLinks, { yPercent: 110, autoAlpha: 0 });

const menuTl = gsap.timeline({ paused: true });
menuTl.to(menuLinks, {
  yPercent: 0,
  autoAlpha: 1,
  duration: 0.9,
  stagger: 0.07,
  ease: "power4.out",
  delay: 0.12,
});

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (open) menuTl.play(0);
  else menuTl.reverse();
}

menuToggle?.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const loader = document.querySelector("[data-loader]");
const loaderCount = document.querySelector("[data-loader-count]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counter = { n: 0 };
let started = false;

function startSite() {
  if (started) return;
  started = true;
  loader?.remove();
  initScroll();
}

if (!loader) {
  startSite();
} else {
  const boot = gsap.timeline({ defaults: { ease: "power3.out" } });
  boot
    .from(".loader-mark", { scale: 0.62, rotate: -8, autoAlpha: 0, duration: 0.95 })
    .from(".loader-word, .loader-label", { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.45")
    .to(
      counter,
      {
        n: 100,
        duration: reduced ? 0.2 : 1.35,
        ease: "power2.inOut",
        onUpdate: () => {
          if (loaderCount) {
            loaderCount.textContent = String(Math.round(counter.n)).padStart(2, "0");
          }
        },
      },
      "-=0.7"
    )
    .to(".loader-inner, .loader-count, .loader-label", {
      y: -22,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.04,
    })
    .to(
      loader,
      {
        yPercent: -100,
        duration: 1.1,
        ease: "power4.inOut",
        onComplete: startSite,
      },
      "-=0.12"
    )
    .add(startSite, "+=0");

  window.setTimeout(startSite, 4200);
}
