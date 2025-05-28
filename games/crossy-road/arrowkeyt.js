// touch‑controls.js

// Expose a global initializer—does NOT auto‑run
window.initializeTouchControls = (function() {
  let dpadEl = null;

  // Create & inject the inverted‑T pad
  function makeDpad() {
    if (dpadEl) return;  // already there

    // 1) Inject CSS
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

    // 2) Build the container
    dpadEl = document.createElement('div');
    dpadEl.className = 'rt-dpad';

    // 3) Create each button
    const btnUp    = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-up',    textContent: '↑' });
    const btnLeft  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-left',  textContent: '←' });
    const center   = Object.assign(document.createElement('div'),    { className: 'dpad-button dpad-center' });
    const btnRight = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-right', textContent: '→' });
    const btnDown  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-down',  textContent: '↓' });

    // 4) Assign grid areas
    btnUp   .style.gridArea = 'up';
    btnLeft .style.gridArea = 'lt';
    center  .style.gridArea = 'cntr';
    btnRight.style.gridArea = 'rt';
    btnDown .style.gridArea = 'down';

    // 5) Append and done
    dpadEl.append(btnUp, btnLeft, center, btnRight, btnDown);
    document.body.append(dpadEl);

    // 6) Helper to simulate arrow key events
    function sendArrow(key) {
      const code = key === 'ArrowUp'    ? 38
                 : key === 'ArrowDown'  ? 40
                 : key === 'ArrowLeft'  ? 37
                 : key === 'ArrowRight' ? 39
                 : 0;
      ['keydown','keyup'].forEach(type => {
        const ev = new KeyboardEvent(type, {
          key, code: key,
          keyCode: code, which: code,
          bubbles: true, cancelable: true
        });
        document.dispatchEvent(ev);
      });
    }

    // 7) Wire both click & touchstart for each
    [
      [btnUp,    'ArrowUp'],
      [btnDown,  'ArrowDown'],
      [btnLeft,  'ArrowLeft'],
      [btnRight, 'ArrowRight']
    ].forEach(([btn, key]) => {
      btn.addEventListener('touchstart', e => { e.preventDefault(); sendArrow(key); });
      btn.addEventListener('click',      e => { e.preventDefault(); sendArrow(key); });
    });

    // 8) passive‑touch shim
    document.addEventListener('touchstart', () => {}, { passive: true });
  }

  // Remove the pad
  function removeDpad() {
    if (dpadEl) {
      dpadEl.remove();
      dpadEl = null;
    }
  }

  // The global initializer toggles presence
  return function() {
    if (localStorage.getItem('r-touch') === 'on') {
      makeDpad();
    } else {
      removeDpad();
    }
  };
})();