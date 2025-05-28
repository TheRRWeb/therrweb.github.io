// touch-controls.js

// Expose a global initializer—does NOT auto-run
window.initializeTouchControls = function() {
  // 1) Inject CSS for the inverted‑T pad
  const style = document.createElement('style');
  style.textContent = `
    .rt-dpad {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 180px;
      height: 180px;
      display: grid;
      grid-template:
        ". up   ." 1fr
        "lt  cntr rt" 1fr
        ". down ." 1fr
        / 1fr 1fr 1fr;
      gap: 10px;
      z-index: 1000;
      user-select: none;
      touch-action: none;
    }
    .dpad-button {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
      border: none;
      border-radius: 10px;
    }
    .dpad-up, .dpad-down { background-color: #5cc93b; }
    .dpad-left, .dpad-right { background-color: #4193c9; }
    .dpad-center { background: transparent; }
  `;
  document.head.appendChild(style);

  // 2) Build the pad container
  const dpad = document.createElement('div');
  dpad.className = 'rt-dpad';

  // 3) Create buttons
  const btnUp    = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-up',    textContent: '↑', tabindex: -1 });
  const btnDown  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-down',  textContent: '↓', tabindex: -1 });
  const btnLeft  = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-left',  textContent: '←', tabindex: -1 });
  const btnRight = Object.assign(document.createElement('button'), { className: 'dpad-button dpad-right', textContent: '→', tabindex: -1 });
  const center   = Object.assign(document.createElement('div'),    { className: 'dpad-button dpad-center' });

  // 4) Assign grid areas
  btnUp.style.gridArea    = 'up';
  btnLeft.style.gridArea  = 'lt';
  center.style.gridArea   = 'cntr';
  btnRight.style.gridArea = 'rt';
  btnDown.style.gridArea  = 'down';

  // 5) Append to body
  dpad.append(btnUp, btnLeft, center, btnRight, btnDown);
  document.body.append(dpad);

  // 6) Shim for key events
  function sendKey(key) {
    const code = key === 'ArrowUp'   ? 38
               : key === 'ArrowDown' ? 40
               : key === 'ArrowLeft' ? 37
               : key === 'ArrowRight'? 39
               : 0;
    ['keydown','keyup'].forEach(type => {
      document.dispatchEvent(new KeyboardEvent(type, {
        key, code: key,
        keyCode: code, which: code,
        bubbles: true, cancelable: true
      }));
    });
  }

  // 7) Touch listeners
  btnUp   .addEventListener('touchstart', e => { e.preventDefault(); sendKey('ArrowUp');    });
  btnDown .addEventListener('touchstart', e => { e.preventDefault(); sendKey('ArrowDown');  });
  btnLeft .addEventListener('touchstart', e => { e.preventDefault(); sendKey('ArrowLeft');  });
  btnRight.addEventListener('touchstart', e => { e.preventDefault(); sendKey('ArrowRight'); });

  // 8) Activate passive touch
  document.addEventListener('touchstart', () => {}, true);
};