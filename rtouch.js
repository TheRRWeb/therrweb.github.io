// game-toolbar.js
(function() {
  // ─────────────────────────────────────────────────────
  // 1) Inject CSS
  // ─────────────────────────────────────────────────────
  const css = `
    #gameToolbar {
      position: fixed;
      top: 20px;
      /* we’ll set left/right in JS */
      width: 60px;
      height: 60px;
      font-size: 32px;
      line-height: 60px;
      text-align: center;
      background: red;
      color: #dedede;
      border-radius: 8px;
      cursor: pointer;
      z-index: 2000;
      user-select: none;
      touch-action: none;
    }
    #gameMenu {
      position: fixed;
      background: #2a2a2a;
      border: 1px solid #5cc93b;
      border-radius: 5px;
      padding: 4px 0;
      display: none;
      flex-direction: column;
      z-index: 2000;
    }
    .gameMenuItem {
      color: #dedede;
      padding: 8px 16px;
      font-size: 16px;
      cursor: pointer;
      white-space: nowrap;
    }
    .gameMenuItem:hover {
      background: #4193c9;
    }
    .gameMenuItem.toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gameMenuItem.toggle span {
      font-weight: bold;
    }
  `;
  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  // ─────────────────────────────────────────────────────
  // 2) Build toolbar & menu elements
  // ─────────────────────────────────────────────────────
  const toolbar = document.createElement("div");
  toolbar.id = "gameToolbar";
  toolbar.textContent = "🎮";

  const menu = document.createElement("div");
  menu.id = "gameMenu";

  // — Move toggle item
  const posItem = document.createElement("div");
  posItem.className = "gameMenuItem toggle";
  const posLabel = document.createElement("span");
  const posSwitch = document.createElement("span");
  posItem.append(posLabel, posSwitch);

  function refreshPosition() {
    const pos = localStorage.getItem("toolbar-pos") || "right";
    posLabel.textContent = "Move:";
    posSwitch.textContent = pos === "right" ? "Right" : "Left";
    // Clear both before setting one
    toolbar.style.left = toolbar.style.right = "";
    if (pos === "right") {
      toolbar.style.right = "20px";
    } else {
      toolbar.style.left = "20px";
    }
  }
  posItem.addEventListener("click", () => {
    const curr = localStorage.getItem("toolbar-pos") || "right";
    const next = curr === "right" ? "left" : "right";
    localStorage.setItem("toolbar-pos", next);
    refreshPosition();
  });

  // — Back to games
  const backItem = document.createElement("div");
  backItem.className = "gameMenuItem";
  backItem.textContent = "Back to The RR Games";
  backItem.addEventListener("click", () => {
    window.location.href = "/games/";
  });

  // — R Touch toggle
  const rtItem = document.createElement("div");
  rtItem.className = "gameMenuItem toggle";
  const rtLabel = document.createElement("span");
  const rtSwitch = document.createElement("span");
  rtItem.append(rtLabel, rtSwitch);

  function refreshRT() {
    const on = localStorage.getItem("r-touch") === "on";
    rtLabel.textContent = "R Touch:";
    rtSwitch.textContent = on ? "ON" : "OFF";
    rtSwitch.style.color = on ? "#5cc93b" : "#ff4d4d";
  }
  rtItem.addEventListener("click", () => {
    if (localStorage.getItem("r-touch") === "on") {
      localStorage.removeItem("r-touch");
    } else {
      localStorage.setItem("r-touch", "on");
    }
    refreshRT();
    window.dispatchEvent(new Event("r-touch-changed"));
  });

  // — Close game
  const closeItem = document.createElement("div");
  closeItem.className = "gameMenuItem";
  closeItem.textContent = "Close the game immediately";
  closeItem.addEventListener("click", () => {
    window.close();
    window.location.href = "about:blank";
  });

  menu.append(posItem, backItem, rtItem, closeItem);
  document.body.append(toolbar, menu);

  // ─────────────────────────────────────────────────────
  // 3) Menu show/hide & inside‑screen positioning
  // ─────────────────────────────────────────────────────
  toolbar.addEventListener("click", e => {
    e.stopPropagation();
    const showing = menu.style.display === "flex";
    menu.style.display = showing ? "none" : "flex";

    // Position menu relative to toolbar
    const tbRect = toolbar.getBoundingClientRect();
    const pos = localStorage.getItem("toolbar-pos") || "right";

    if (pos === "right") {
      // menu to the left of button
      menu.style.left = (tbRect.left - menu.offsetWidth - 10) + "px";
    } else {
      // menu to the right
      menu.style.left = (tbRect.right + 10) + "px";
    }
    menu.style.top = tbRect.bottom + "px";
  });
  document.addEventListener("click", e => {
    if (!toolbar.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  // ─────────────────────────────────────────────────────
  // 4) Initialize states
  // ─────────────────────────────────────────────────────
  refreshPosition();
  refreshRT();

  // ─────────────────────────────────────────────────────
  // 5) Auto‑init touch controls if R‑Touch is ON
  // ─────────────────────────────────────────────────────
  function initTouchIfOn() {
    if (typeof window.initializeTouchControls === "function" &&
        localStorage.getItem("r-touch") === "on") {
      window.initializeTouchControls();
    }
  }
  initTouchIfOn();
  window.addEventListener("r-touch-changed", initTouchIfOn);
})();