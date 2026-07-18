/* ============================================================
   CamCheck — mobile nav toggle
   On wide screens .nav is just a plain horizontal row (no JS
   involved). Below the CSS breakpoint the same <nav> becomes a
   dropdown that this toggles open/closed.
   ============================================================ */

(() => {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (nav.classList.contains("open")) closeNav();
    else openNav();
  });

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  // If the window is resized back past the breakpoint, drop the open state
  // so it doesn't linger the next time the toggle becomes visible again.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNav();
  });
})();
