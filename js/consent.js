/* ============================================================
   CamCheck — ad consent banner
   The actual "non-personalized ads" flag is set inline in each
   page's <head>, before adsbygoogle.js loads (that timing is
   required for it to take effect). This file only drives the
   banner UI and remembers the visitor's choice.
   ============================================================ */

(() => {
  const KEY = "camcheck-ad-consent";
  const banner = document.getElementById("consentBanner");
  const acceptBtn = document.getElementById("consentAcceptBtn");
  const declineBtn = document.getElementById("consentDeclineBtn");
  const settingsLink = document.getElementById("cookieSettingsLink");
  if (!banner) return;

  function getConsent() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      // Storage might be unavailable (private browsing, etc). The banner
      // will just reappear next visit, which is an acceptable fallback.
    }
  }

  function show() {
    banner.classList.add("show");
  }
  function hide() {
    banner.classList.remove("show");
  }

  if (!getConsent()) {
    show();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      setConsent("personalized");
      hide();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      setConsent("non-personalized");
      hide();
    });
  }
  if (settingsLink) {
    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      show();
    });
  }
})();
