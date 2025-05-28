// arrowkeyt.js

// ─────────────────────────────────────────────────────────────────
// 1) Expose global initializer
// ─────────────────────────────────────────────────────────────────
window.initializeTouchControls = (function() {
  let inited = false;
  let lrGroup, btnLeft, btnRight, btnUp;
  const repeaters = new Map();

  function sendKeyEvent(type, keyName, codeName, keyCode) {
    const ev = new KeyboardEvent(type, {
      key: keyName, code: codeName,
      keyCode: keyCode, which: keyCode,
      bubbles: true, cancelable: true
    });
    document.dispatchEvent(ev);
  }

  function startRepeater(btnElem, downArgs) {
    // fire initial keydown
    sendKeyEvent('keydown', ...downArgs);
    // then start interval
    const id = setInterval(() => sendKeyEvent('keydown', ...downArgs), 100);
    repeaters.set(btnElem, id);
  }

  function stopRepeater(btnElem, upArgs) {
    // clear the interval
    const id = repeaters.get(btnElem);
    if (id != null) clearInterval(id);
    repeaters.delete(btnElem);
    // fire keyup
    sendKeyEvent('keyup', ...upArgs);
  }

  function makeControls() {
    if (inited) return;
    inited = true;

    // a) CSS
    const style = document.createElement('style');
    style.textContent = `
      .rt-touch-btn {
        position: fixed;
        width: 120px; height: 120px;
        font-size: 48px; color: white;
        border: none; border-radius: 20px;
        cursor: pointer; user-select: none; touch-action: none;
        display: flex; align-items: center; justify-content: center;
        z-index: 2000;
      }
      .rt-touch-group {
        position: fixed;
        bottom: 20px; left: 20px;
        display: flex; gap: 10px;
        z-index: 2000;
      }
      .rt-touch-up {
        position: fixed;
        bottom: 20px; right: 20px;
        z-index: 2000;
      }
    `;
    document.head.appendChild(style);

    // b) Build LR group
    lrGroup = document.createElement('div');
    lrGroup.className = 'rt-touch-group';

    btnLeft = document.createElement('button');
    btnLeft.className = 'rt-touch-btn';
    btnLeft.style.backgroundColor = '#5cc93b';
    btnLeft.textContent = '←';

    btnRight = document.createElement('button');
    btnRight.className = 'rt-touch-btn';
    btnRight.style.backgroundColor = '#5cc93b';
    btnRight.textContent = '→';

    lrGroup.append(btnLeft, btnRight);
    document.body.append(lrGroup);

    // c) Build Up button (Space)
    btnUp = document.createElement('button');
    btnUp.className = 'rt-touch-btn rt-touch-up';
    btnUp.style.backgroundColor = '#4193c9';
    btnUp.textContent = '↑';
    document.body.append(btnUp);

    // d) Pointer event wiring for press‑and‑hold
    [
      [btnLeft,  ['ArrowLeft','ArrowLeft',37], ['ArrowLeft','ArrowLeft',37]],
      [btnRight, ['ArrowRight','ArrowRight',39], ['ArrowRight','ArrowRight',39]],
      [btnUp,    [' ','Space',32],             [' ','Space',32]]
    ].forEach(([btn, downArgs, upArgs]) => {
      // on press
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        startRepeater(btn, downArgs);
      });
      // on release or leave
      ['pointerup','pointercancel','pointerleave'].forEach(evtName => {
        btn.addEventListener(evtName, e => {
          e.preventDefault();
          stopRepeater(btn, upArgs);
        });
      });
    });
  }

  function removeControls() {
    if (!inited) return;
    inited = false;
    // clear any intervals
    repeaters.forEach((id, btn) => clearInterval(id));
    repeaters.clear();
    // remove elements
    lrGroup?.remove();
    btnUp?.remove();
  }

  // the global fn
  return function() {
    if (localStorage.getItem('r-touch') === 'on') {
      makeControls();
    } else {
      removeControls();
    }
  };
})();


// ─────────────────────────────────────────────────────────────────
// 2) Auto‑init on full load & on toggle
// ─────────────────────────────────────────────────────────────────
function initRTouchPad() {
  if (typeof window.initializeTouchControls === 'function') {
    window.initializeTouchControls();
  }
}
window.addEventListener('load',           initRTouchPad);
window.addEventListener('r-touch-changed', initRTouchPad);