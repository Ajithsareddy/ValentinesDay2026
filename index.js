/* ============ Shared helpers (we'll reuse across pages) ============ */
const STORE_KEY = "seedToBloomState";

function getState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function setState(patch) {
  const current = getState();
  const next = { ...current, ...patch };
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}

function resetState() {
  localStorage.removeItem(STORE_KEY);
}

function qs(sel) {
  return document.querySelector(sel);
}

/* ============ Landing Page Logic ============ */
(function initLanding() {
  const potButton = qs("#potButton");
  const statusText = qs("#statusText");
  const ctaGrow = qs("#ctaGrow");
  const ctaReset = qs("#ctaReset");

  if (!potButton) return; // safety if file reused on other pages

  // Restore state if already planted
  const state = getState();
  if (state.planted) {
    potButton.classList.add("planted");
    statusText.textContent = "Planted 🌱 — ready to grow.";
    ctaGrow.classList.remove("is-hidden");
    ctaReset.classList.remove("is-hidden");
  }

  potButton.addEventListener("click", () => {
    const already = potButton.classList.contains("planted");
    if (already) return;

    potButton.classList.add("planted");
    setState({ planted: true, stage: 1 });

    statusText.textContent = "A seed is in! Something sweet is starting… 💗";

    // Reveal CTA after animation feels done
    window.setTimeout(() => {
      ctaGrow.classList.remove("is-hidden");
      ctaReset.classList.remove("is-hidden");
      statusText.textContent = "Okay… now give it water & sunshine 🌤️💧";
    }, 1400);
  });

  ctaReset.addEventListener("click", () => {
    resetState();
    potButton.classList.remove("planted");
    statusText.textContent = "(It’s waiting…)";
    ctaGrow.classList.add("is-hidden");
    ctaReset.classList.add("is-hidden");
  });
})();