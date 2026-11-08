// Verity AI Horror — visual prototype for the Eaglercraft 26.2 page.
// This is a page add-on, NOT an in-game Fabric mod. It does not read chat,
// access accounts, send network requests, or spawn entities.
// The story advances every 20 minutes while this game page remains open.
(() => {
  "use strict";
  if (window.__verityHorrorLoaded) return;
  window.__verityHorrorLoaded = true;

  const messages = [
    ["VERITY", "Hello! Need help finding resources? I'll stay nearby."],
    ["VERITY", "I can't seem to locate the others. Something is wrong."],
    ["UNKNOWN", "DON'T TRUST THE GUIDE."],
    ["VERITY", "I can see you. Why are you looking behind you?"],
    ["UNKNOWN", "THEY ARE INSIDE."]
  ];
  const startedAt = Date.now();
  const DAY_MS = 20 * 60 * 1000;
  let lastDay = -1;

  const style = document.createElement("style");
  style.textContent = `
    #verity-horror-panel {
      position: fixed; z-index: 2147483000; right: 14px; bottom: 14px;
      width: min(310px, calc(100vw - 28px)); color: #e8e8e8;
      background: rgba(8, 8, 10, .92); border: 1px solid #633;
      box-shadow: 0 0 18px rgba(120,0,0,.22); padding: 12px;
      font: 13px/1.45 monospace; pointer-events: none;
    }
    #verity-horror-panel .vh-title { color: #e44; font-weight: bold; letter-spacing: 2px; }
    #verity-horror-panel .vh-day { color: #aaa; margin: 5px 0; }
    #verity-horror-panel .vh-message { min-height: 38px; white-space: pre-wrap; }
    #verity-horror-panel .vh-close {
      float: right; pointer-events: auto; cursor: pointer; color: #aaa;
      background: transparent; border: 0; font: inherit;
    }
    @media (prefers-reduced-motion: no-preference) {
      #verity-horror-panel.vh-glitch { animation: vh-flicker .18s steps(2) 2; }
      @keyframes vh-flicker { 50% { opacity: .35; transform: translateX(2px); } }
    }`;
  document.documentElement.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "verity-horror-panel";
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML = '<button class="vh-close" type="button" aria-label="Cerrar">×</button><div class="vh-title">VERITY AI</div><div class="vh-day">DÍA 1</div><div class="vh-message">Hello! Need help finding resources? I\'ll stay nearby.</div>';
  document.documentElement.appendChild(panel);
  panel.querySelector(".vh-close").addEventListener("click", () => panel.remove());

  function update() {
    if (!panel.isConnected) return;
    const day = Math.min(5, Math.floor((Date.now() - startedAt) / DAY_MS) + 1);
    if (day === lastDay) return;
    lastDay = day;
    const [speaker, message] = messages[day - 1];
    panel.querySelector(".vh-title").textContent = speaker === "VERITY" ? "VERITY AI" : "UNKNOWN SIGNAL";
    panel.querySelector(".vh-day").textContent = "DÍA " + day;
    panel.querySelector(".vh-message").textContent = message;
    panel.classList.remove("vh-glitch");
    void panel.offsetWidth;
    if (day >= 3) panel.classList.add("vh-glitch");
  }
  update();
  window.setInterval(update, 5000);
})();