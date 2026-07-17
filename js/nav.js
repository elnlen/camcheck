/* ============================================================
   CamCheck — nav panel toggle
   One button, one dropdown panel. Closes on outside click,
   Escape, or picking a link. Label text is read off whichever
   link has aria-current="page" so this file works unmodified
   on every page.
   ============================================================ */

(() => {
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("navPanel");
  if (!toggle || !panel) return;

  const label = document.getElementById("navToggleLabel");
  const current = panel.querySelector('a[aria-current="page"]');
  if (label && current) label.textContent = current.textContent;

  function openPanel() {
    panel.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) closePanel();
    else openPanel();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !toggle.contains(e.target)) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", closePanel));
})();
