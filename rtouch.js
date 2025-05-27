// game-toolbar.js
(function() {
  // 1) Inject CSS
  const css = `
    #gameToolbar {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 60px; height: 60px;
      font-size: 32px; line-height: 60px;
      text-align: center;
      background: red; color: #dedede;
      border-radius: 8px; cursor: move;
      z-index: 2000; user-select: none;
      touch-action: none; /* allow touch dragging */
    }
    #gameToolbar:hover { background: red; }
    #gameMenu {
      position: fixed;
      background: #2a2a2a;
      border: 1px solid #5cc93b;
      border-radius: 5px;
      padding: 8px 0; display: none;
      flex-direction: column; z-index: 2000;
    }
    .gameMenuItem {
      color: #dedede; padding: 8px 16px;
      font-size: 16px; cursor: pointer;
      white-space: nowrap;
    }
    .gameMenuItem:hover { background: #4193c9; }
    .gameMenuItem.toggle {
      display: flex; justify-content: space-between;
      align-items: center;
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
  backItem.addEventListener("click", () => location.href = "/games/");

  const rtItem = document.createElement("div");
  rtItem.className = "gameMenuItem toggle";
  const rtLabel = document.createElement("span");
  const rtSwitch = document.createElement("span");
  rtItem.append(rtLabel, rtSwitch);
  function refreshRT() {
    const on = localStorage.getItem("r-touch")==="on";
    rtLabel.textContent  = "R Touch:";
    rtSwitch.textContent = on ? "ON" : "OFF";
    rtSwitch.style.color = on ? "#5cc93b" : "#ff4d4d";
  }
  rtItem.addEventListener("click", () => {
    if (localStorage.getItem("r-touch")==="on") localStorage.removeItem("r-touch");
    else localStorage.setItem("r-touch","on");
    refreshRT();
    window.dispatchEvent(new Event("r-touch-changed"));
  });

  const closeItem = document.createElement("div");
  closeItem.className = "gameMenuItem";
  closeItem.textContent = "Close the game immediately";
  closeItem.addEventListener("click", () => {
    window.close();
    location.href = "about:blank";
  });

  menu.append(backItem, rtItem, closeItem);
  document.body.append(toolbar, menu);
  refreshRT();

  // 3) Toggle menu placement/visibility
  toolbar.addEventListener("click", e => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    const rect = toolbar.getBoundingClientRect();
    menu.style.left = rect.left + "px";
    menu.style.top  = rect.bottom + 10 + "px";
  });
  document.addEventListener("click", e => {
    if (!toolbar.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  // 4) Drag behavior (mouse + touch)
  let dragging = false,
      startX, startY,
      origX, origY;

  function dragStart(clientX, clientY) {
    dragging = true;
    startX = clientX; startY = clientY;
    const rect = toolbar.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    toolbar.style.left   = rect.left + "px";
    toolbar.style.top    = rect.top  + "px";
    toolbar.style.right  = "auto";
    toolbar.style.bottom = "auto";
    menu.style.right  = "auto";
    menu.style.bottom = "auto";
  }

  function dragMove(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX, dy = clientY - startY;
    toolbar.style.left = origX + dx + "px";
    toolbar.style.top  = origY + dy + "px";
    menu.style.left = origX + dx + "px";
    menu.style.top  = origY + dy + toolbar.offsetHeight + 10 + "px";
  }

  function dragEnd() {
    dragging = false;
  }

  // Mouse events
  toolbar.addEventListener("mousedown", e => {
    dragStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => dragMove(e.clientX, e.clientY));
  document.addEventListener("mouseup", () => dragEnd());

  // Touch events
  toolbar.addEventListener("touchstart", e => {
    const t = e.touches[0];
    dragStart(t.clientX, t.clientY);
    e.preventDefault();
  }, {passive: false});
  document.addEventListener("touchmove", e => {
    const t = e.touches[0];
    dragMove(t.clientX, t.clientY);
  }, {passive: false});
  document.addEventListener("touchend", () => dragEnd());

  // 5) Init touch controls if R‑Touch on
  function initTouchIfOn() {
    if (typeof initializeTouchControls === "function"
      && localStorage.getItem("r-touch")==="on") {
      initializeTouchControls();
    }
  }
  initTouchIfOn();
  window.addEventListener("r-touch-changed", initTouchIfOn);

})();