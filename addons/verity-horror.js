// Verity AI Horror — page-level prototype for the Eaglercraft 26.2 build.
// This is NOT a Fabric game mod: it cannot spawn real in-world entities or read game chat.
// It adds a harmless visual horror HUD to the browser page only.
(() => {
  "use strict";
  if (window.__verityHorrorLoaded) return;
  window.__verityHorrorLoaded = true;

  const DAY_MS = 20 * 60 * 1000;
  const startedAt = Date.now();
  let lastDay = 0;
  let lastSighting = 0;
  const story = [
    ["VERITY AI", "Hello! Need help finding resources? I'll stay nearby."],
    ["VERITY AI", "I can't seem to locate the others. Something is wrong."],
    ["UNKNOWN SIGNAL", "DON'T TRUST THE GUIDE."],
    ["VERITY AI", "I can see you. Why are you looking behind you?"],
    ["UNKNOWN SIGNAL", "THEY ARE INSIDE."]
  ];
  const sightings = [
    "STALKER STEVE — movement detected nearby.",
    "HEROBRINE — someone is watching from a distance.",
    "THE NULL — signal lost. Do not follow the sound."
  ];

  const style = document.createElement("style");
  style.textContent = `
    #verity-horror-panel {
      position:fixed; z-index:2147483000; right:14px; bottom:14px;
      width:min(320px,calc(100vw - 28px)); box-sizing:border-box;
      color:#eee; background:rgba(5,5,7,.94); border:1px solid #633;
      box-shadow:0 0 20px rgba(130,0,0,.28); padding:12px;
      font:13px/1.45 monospace; pointer-events:none;
    }
    #verity-horror-panel .vh-title { color:#e44; font-weight:bold; letter-spacing:2px; }
    #verity-horror-panel .vh-day { color:#aaa; margin:5px 0; }
    #verity-horror-panel .vh-message { min-height:38px; white-space:pre-wrap; }
    #verity-horror-panel .vh-close {
      float:right; pointer-events:auto; cursor:pointer; color:#aaa;
      background:transparent; border:0; font:inherit;
    }
    #verity-horror-panel .vh-sighting { color:#f77; margin-top:8px; min-height:18px; }
    #verity-horror-flash {
      position:fixed; inset:0; z-index:2147482999; pointer-events:none;
      opacity:0; background:rgba(0,0,0,.72);
    }
    #verity-horror-flash.vh-show { animation:vh-flash .65s ease-out; }
    #verity-horror-shadow {
      position:fixed; z-index:2147482998; right:9%; top:18%;
      width:72px; height:190px; opacity:0; pointer-events:none;
      filter:blur(1px); transition:opacity .35s;
    }
    #verity-horror-shadow:before {
      content:""; position:absolute; left:17px; top:0; width:38px; height:38px;
      border-radius:50%; background:#020203;
      box-shadow:0 0 22px rgba(0,0,0,.9);
    }
    #verity-horror-shadow:after {
      content:""; position:absolute; left:7px; top:34px; width:58px; height:150px;
      background:#020203; clip-path:polygon(22% 0,78% 0,100% 100%,0 100%);
      box-shadow:0 0 20px #000;
    }
    #verity-horror-shadow.vh-visible { opacity:.88; }
    @keyframes vh-flash { 0%{opacity:0} 12%{opacity:.7} 100%{opacity:0} }
    @media(prefers-reduced-motion:reduce) {
      #verity-horror-flash.vh-show { animation:none; opacity:.12; }
    }`;
  document.documentElement.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "verity-horror-panel";
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML = '<button class="vh-close" type="button" aria-label="Cerrar">×</button><div class="vh-title">VERITY AI</div><div class="vh-day">DÍA 1</div><div class="vh-message"></div><div class="vh-sighting"></div>';
  document.documentElement.appendChild(panel);
  panel.querySelector(".vh-close").addEventListener("click", () => panel.remove());

  const flash = document.createElement("div");
  flash.id = "verity-horror-flash";
  document.documentElement.appendChild(flash);
  const shadow = document.createElement("div");
  shadow.id = "verity-horror-shadow";
  shadow.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(shadow);

  function scare() {
    if (!panel.isConnected) return;
    flash.classList.remove("vh-show");
    void flash.offsetWidth;
    flash.classList.add("vh-show");
    shadow.classList.add("vh-visible");
    window.setTimeout(() => shadow.classList.remove("vh-visible"), 1500);
  }

  function update() {
    if (!panel.isConnected) return;
    const day = Math.min(5, Math.floor((Date.now() - startedAt) / DAY_MS) + 1);
    if (day !== lastDay) {
      lastDay = day;
      panel.querySelector(".vh-title").textContent = story[day - 1][0];
      panel.querySelector(".vh-day").textContent = "DÍA " + day;
      panel.querySelector(".vh-message").textContent = story[day - 1][1];
      if (day >= 3) scare();
    }
    if (day >= 3 && Date.now() - lastSighting > 3 * 60 * 1000) {
      lastSighting = Date.now();
      const sighting = sightings[Math.floor(Math.random() * sightings.length)];
      panel.querySelector(".vh-sighting").textContent = sighting;
      if (day >= 4) scare();
    }
  }

  update();
  window.setInterval(update, 5000);
})();