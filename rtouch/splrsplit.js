// arrowkeyt.js

// ─────────────────────────────────────────────────────────────────
// 1) Expose the pad‑injection function
// ─────────────────────────────────────────────────────────────────
window.initializeTouchControls = (function() {
  let controlsEl = null;

  function makeControls() {
    if (controlsEl) return;  // already there

    // a) Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      .rt-touch-btn {
        position: fixed;
        width: 120px;
        height: 120px;
        font-size: 48px;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        user-select: none;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      .rt-touch-group {
        position: fixed;
        bottom: 20px;
        left: 20px;
        display: flex;
        gap: 10px;
        z-index: 2000;
      }
      .rt-touch-up {
        bottom: 20px;
        right: 20px;
      }
    `;
    document.head.appendChild(style);

    // b) Build containers
    controlsEl = document.createElement('div');

    // group for left/right
    const lrGroup = document.createElement('div');
    lrGroup.className = 'rt-touch-group';

    // left button
    const btnLeft = document.createElement('button');
    btnLeft.className = 'rt-touch-btn';
    btnLeft.style.backgroundColor = '#5cc93b';
    btnLeft.textContent = '←';

    // right button
    const btnRight = document.createElement('button');
    btnRight.className = 'rt-touch-btn';
    btnRight.style.backgroundColor = '#5cc93b';
    btnRight.textContent = '→';

    lrGroup.append(btnLeft, btnRight);

    // up (space) button
    const btnUp = document.createElement('button');
    btnUp.className = 'rt-touch-btn rt-touch-up';
    btnUp.style.backgroundColor = '#4193c9';
    btnUp.textContent = '↑';

    // append to body
    document.body.append(lrGroup, btnUp);
    controlsEl.lrGroup = lrGroup;
    controlsEl.btnUp   = btnUp;
    controlsEl.btnLeft = btnLeft;
    controlsEl.btnRight= btnRight;
    document.body.append(controlsEl);

    // c) Key‑event simulator
    function sendKey(keyName, codeName, keyCode) {
      ['keydown','keyup'].forEach(type => {
        const ev = new KeyboardEvent(type, {
          key: keyName,
          code: codeName,
          keyCode: keyCode,
          which: keyCode,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(ev);
      });
    }

    // d) Wire click + touchstart
    btnLeft.addEventListener('click',      e => (e.preventDefault(), sendKey('ArrowLeft','ArrowLeft',37)));
    btnLeft.addEventListener('touchstart', e => (e.preventDefault(), sendKey('ArrowLeft','ArrowLeft',37)));

    btnRight.addEventListener('click',      e => (e.preventDefault(), sendKey('ArrowRight','ArrowRight',39)));
    btnRight.addEventListener('touchstart', e => (e.preventDefault(), sendKey('ArrowRight','ArrowRight',39)));

    // Up arrow maps to Spacebar
    btnUp.addEventListener('click',      e => (e.preventDefault(), sendKey(' ','Space',32)));
    btnUp.addEventListener('touchstart', e => (e.preventDefault(), sendKey(' ','Space',32)));

    // e) Passive‑touch shim
    document.addEventListener('touchstart', ()=>{}, { passive: true });
  }

  function removeControls() {
    if (controlsEl) {
      controlsEl.lrGroup.remove();
      controlsEl.btnUp.remove();
      controlsEl.remove();
      controlsEl = null;
    }
  }

  // Exposed function toggles based on localStorage["r-touch"]
  return function() {
    if (localStorage.getItem('r-touch') === 'on') {
      makeControls();
    } else {
      removeControls();
    }
  };
})();


// ─────────────────────────────────────────────────────────────────
// 2) Self‑bootstrap on full load & on toggle changes
// ─────────────────────────────────────────────────────────────────
function initRTouchPad() {
  if (typeof window.initializeTouchControls === 'function') {
    window.initializeTouchControls();
  }
}
window.addEventListener('load',           initRTouchPad);
window.addEventListener('r-touch-changed', initRTouchPad);