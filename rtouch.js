// game-toolbar.js
(function() {
  // 1) Inject CSS
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
      background: red;
      color: #dedede;
      border-radius: 8px;
      cursor: move;
      z-index: 2000;
      user-select: none;
    }
    #gameToolbar:hover { background: darkred; }
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
    .gameMenuItem:hover { background: #4193c9; }
    .gameMenuItem.toggle {
      display: flex; justify-content: space-between; align-items: center;
    }
    .gameMenuItem.toggle span { font-weight: bold; }
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // 2) Build toolbar + menu
  const toolbar = document.createElement("div");
  toolbar.id = "gameToolbar";
  toolbar.textContent = "🎮";

  const menu = document.createElement("div");
  menu.id = "gameMenu";

  // Menu items
  const backItem = document.createElement("div");
  backItem.className = "gameMenuItem";
  backItem.textContent = "Back to The RR Games";
  backItem.addEventListener("click", () => window.location.href = "/games/");

  const rtItem = document.createElement("div");
  rtItem.className = "gameMenuItem toggle";
  const rtLabel = document.createElement("span");
  const rtSwitch = document.createElement("span");
  rtItem.append(rtLabel, rtSwitch);
  function refreshRT() {
    const on = localStorage.getItem("r-touch") === "on";
    rtLabel.textContent  = "R Touch:";
    rtSwitch.textContent = on ? "ON" : "OFF";
    rtSwitch.style.color = on ? "#5cc93b" : "#ff4d4d";
  }
  rtItem.addEventListener("click", () => {
    if (localStorage.getItem("r-touch")==="on") {
      localStorage.removeItem("r-touch");
    } else {
      localStorage.setItem("r-touch","on");
    }
    refreshRT();
    window.dispatchEvent(new Event("r-touch-changed"));
  });

  const closeItem = document.createElement("div");
  closeItem.className = "gameMenuItem";
  closeItem.textContent = "Close the game immediately";
  closeItem.addEventListener("click", () => {
    window.close();
    window.location.href = "about:blank";
  });

  menu.append(backItem, rtItem, closeItem);
  document.body.append(toolbar, menu);
  refreshRT();

  // 3) Toggle menu
  toolbar.addEventListener("click", e => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    const rect = toolbar.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top  = `${rect.bottom + 10}px`;
  });
  document.addEventListener("click", e => {
    if (!toolbar.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  // 4) Drag behavior (fixed)
  let dragging = false, startX, startY, origX, origY;
  toolbar.addEventListener("mousedown", e => {
    dragging = true;
    // record initial cursor
    startX = e.clientX; startY = e.clientY;
    // stamp in current position to style.left & style.top
    const rect = toolbar.getBoundingClientRect();
    toolbar.style.left   = `${rect.left}px`;
    toolbar.style.top    = `${rect.top}px`;
    // clear right/bottom so left/top govern positioning
    toolbar.style.right  = "auto";
    toolbar.style.bottom = "auto";
    // same for menu for later
    menu.style.right  = "auto";
    menu.style.bottom = "auto";
    // record origin
    origX = rect.left; origY = rect.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    toolbar.style.left = `${origX + dx}px`;
    toolbar.style.top  = `${origY + dy}px`;
    // move menu in sync
    menu.style.left = `${origX + dx}px`;
    menu.style.top  = `${origY + dy + toolbar.offsetHeight + 10}px`;
  });
  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  // 5) Auto‑init touch controls if r-touch is ON
  function initTouchIfOn() {
    if (typeof window.initializeTouchControls === "function"
      && localStorage.getItem("r-touch")==="on") {
      window.initializeTouchControls();
    }
  }
  initTouchIfOn();
  window.addEventListener("r-touch-changed", initTouchIfOn);
  if (localStorage.getItem("r-touch") === null) {
    localStorage.setItem("r-touch","on");
  }
})();