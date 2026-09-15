export function initCursor() {
  const cursor = document.querySelector(".cursor");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) {
    document.body.style.cursor = "auto";
    return;
  }

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;
  let hovering = false;
  let running = false;

  const tick = () => {
    x += (tx - x) * 0.82;
    y += (ty - y) * 0.82;
    cursor.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;

    if (Math.abs(tx - x) > 0.12 || Math.abs(ty - y) > 0.12) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    },
    { passive: true }
  );

  document.addEventListener("pointerover", (event) => {
    const hit = event.target.closest("a, button, input, textarea, select");
    if (hit && !hovering) {
      hovering = true;
      document.body.classList.add("is-hovering");
    }
  });

  document.addEventListener("pointerout", (event) => {
    const hit = event.target.closest("a, button, input, textarea, select");
    if (!hit) return;
    const next = event.relatedTarget;
    if (next && next.closest?.("a, button, input, textarea, select")) return;
    hovering = false;
    document.body.classList.remove("is-hovering");
  });
}
