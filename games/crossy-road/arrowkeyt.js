// arrowkeyt.js

// ─────────────────────────────────────────────────────────────────
// 1) Expose the pad‑injection function (does NOT auto‑run)
// ─────────────────────────────────────────────────────────────────
window.initializeTouchControls = (function() {
  let dpadEl = null;

  // Create & inject the inverted‑T pad
  function makeDpad() {
    if (dpadEl) return;  // already injected

    // 1a) Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      .rt-dpad {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: grid;
        grid-template:
          ". up   ." 120px
          "lt  cntr rt" 120px
          ". down ." 120px
          / 120px 120px 120px;
        gap: 10px;
        z-index: 2000;
        user-select: none;
        touch-action: none;
      }
      .dpad-button {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
      }
      .dpad-up, .dpad-down { background-color: #5cc93b; }
      .dpad-left, .dpad-right { background-color: #4193c9; }
      .dpad-center { background: transparent; pointer-events: none; }
    `;
    document.head.appendChild(style);

    // 1b) Build the container
    dpadEl = document.createElement('div');
    dpadEl.className = 'rt-dpad';

    // 1c) Create buttons
    const btnUp    = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-up',    textContent: '↑' });
    const btnLeft  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-left',  textContent: '←' });
    const center   = Object.assign(document.createElement('div'),    { className: 'dpad-button dpad-center' });
    const btnRight = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-right', textContent: '→' });
    const btnDown  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-down',  textContent: '↓' });

    // 1d) Assign grid areas
    btnUp   .style.gridArea = 'up';
    btnLeft .style.gridArea = 'lt';
    center  .style.gridArea = 'cntr';
    btnRight.style.gridArea = 'rt';
    btnDown .style.gridArea = 'down';

    // 1e) Append to body
    dpadEl.append(btnUp, btnLeft, center, btnRight, btnDown);
    document.body.append(dpadEl);

    // 1f) Key‑event simulator
    function sendArrow(keyName) {
      const code = keyName === 'ArrowUp'    ? 38
                 : keyName === 'ArrowDown'  ? 40
                 : keyName === 'ArrowLeft'  ? 37
                 : keyName === 'ArrowRight' ? 39
                 : 0;
      ['keydown','keyup'].forEach(type => {
        const ev = new KeyboardEvent(type, {
          key: keyName,
          code: keyName,
          keyCode: code,
          which: code,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(ev);
      });
    }

    // 1g) Wire both click & touchstart
    [
      [btnUp,    'ArrowUp'],
      [btnDown,  'ArrowDown'],
      [btnLeft,  'ArrowLeft'],
      [btnRight, 'ArrowRight']
    ].forEach(([btn, key]) => {
      btn.addEventListener('click',      e => { e.preventDefault(); sendArrow(key); });
      btn.addEventListener('touchstart', e => { e.preventDefault(); sendArrow(key); });
    });

    // 1h) Passive‑touch shim
    document.addEventListener('touchstart', () => {}, { passive: true });
  }

  // Remove the pad
  function removeDpad() {
    if (dpadEl) {
      dpadEl.remove();
      dpadEl = null;
    }
  }

  // The function exposed globally
  return function() {
    if (localStorage.getItem('r-touch') === 'on') {
      makeDpad();
    } else {
      removeDpad();
    }
  };
})();


// ─────────────────────────────────────────────────────────────────
// 2) Self‑bootstrap on load & on toggle (matches your old LR logic)
// ─────────────────────────────────────────────────────────────────
function initRTouchPad() {
  if (typeof window.initializeTouchControls === 'function') {
    window.initializeTouchControls();
  }
}

// Run once when the full page (and Crossy Road bootstrap) has loaded
window.addEventListener('load', initRTouchPad);

// Re‑run whenever the toolbar fires a toggle event
window.addEventListener('r-touch-changed', initRTouchPad);