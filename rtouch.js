// game-toolbar.js
(function() {
  // ─────────────────────────────────────────────────────
  // 1) Inject CSS for toolbar & dropdown
  // ─────────────────────────────────────────────────────
  const css = `
    #gameToolbar {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      font-size: 32px;
      line-height: 60px;
      text-align: center;
      background: #2a2a2a;
      color: #dedede;
      border-radius: 8px;
      cursor: move;
      z-index: 2000;
      user-select: none;
    }
    #gameToolbar:hover { background: #333; }
    #gameMenu {
      position: fixed;
      top: 90px;
      right: 20px;
      background: #2a2a2a;
      border: 1px solid #5cc93b;
      border-radius: 5px;
      padding: 8px 0;
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
    .gameMenuItem.toggle { display: flex; justify-content: space-between; align-items: center; }
    .gameMenuItem.toggle span { font-weight: bold; }
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // ─────────────────────────────────────────────────────
  // 2) Build toolbar button + menu
  // ─────────────────────────────────────────────────────
  const toolbar = document.createElement("div");
  toolbar.id = "gameToolbar";
  toolbar.textContent = "🎮";

  const menu = document.createElement("div");
  menu.id = "gameMenu";

  // ---- Menu items ----
  const backItem = Object.assign(document.createElement("div"), {
    className: "gameMenuItem",
    textContent: "Back to The RR Games"
  });
  backItem.addEventListener("click", () => {
    window.location.href = "/games/";
  });

  const rtItem = Object.assign(document.createElement("div"), {
    className: "gameMenuItem toggle",
  });
  const rtLabel = document.createElement("span");
  const rtSwitch = document.createElement("span");
  rtItem.append(rtLabel, rtSwitch);

  function refreshRTItem() {
    const on = localStorage.getItem("r-touch") === "on";
    rtLabel.textContent  = "R Touch:";
    rtSwitch.textContent = on ? "ON" : "OFF";
    rtSwitch.style.color = on ? "#5cc93b" : "#ff4d4d";
  }
  rtItem.addEventListener("click", () => {
    const on = localStorage.getItem("r-touch") === "on";
    if (on) localStorage.removeItem("r-touch");
    else    localStorage.setItem   ("r-touch", "on");
    refreshRTItem();
    // notify touch‑control script
    window.dispatchEvent(new Event("r-touch-changed"));
  });

  const closeItem = Object.assign(document.createElement("div"), {
    className: "gameMenuItem",
    textContent: "Close the game immediately"
  });
  closeItem.addEventListener("click", () => {
    // Try window.close(); if that fails, navigate away
    window.close();
    window.location.href = "about:blank";
  });

  menu.append(backItem, rtItem, closeItem);
  document.body.append(toolbar, menu);

  // initialize
  refreshRTItem();

  // ─────────────────────────────────────────────────────
  // 3) Toggle menu visibility
  // ─────────────────────────────────────────────────────
  toolbar.addEventListener("click", () => {
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  // Hide menu if clicking outside
  document.addEventListener("click", e => {
    if (!toolbar.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  // ─────────────────────────────────────────────────────
  // 4) Drag behavior
  // ─────────────────────────────────────────────────────
  let isDragging = false, startX, startY, origX, origY;
  toolbar.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = toolbar.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    let dx = e.clientX - startX, dy = e.clientY - startY;
    toolbar.style.left = `${origX + dx}px`;
    toolbar.style.top  = `${origY + dy}px`;
    menu .style.left  = `${origX + dx}px`;
    menu .style.top   = `${origY + dy + toolbar.offsetHeight + 10}px`;
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // ─────────────────────────────────────────────────────
  // 5) Activate touch controls only when R Touch is on
  // ─────────────────────────────────────────────────────
  function maybeInitTouch() {
    if (window.initializeTouchControls && localStorage.getItem("r-touch") === "on") {
      window.initializeTouchControls();
    }
  }
  // Run on load
  maybeInitTouch();
  // And any time the toggle changes
  window.addEventListener("r-touch-changed", maybeInitTouch);
})();
