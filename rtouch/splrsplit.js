// arrowkeyt.js

// ─────────────────────────────────────────────────────────────────
// 1) Expose the pad‑injection function
// ─────────────────────────────────────────────────────────────────
window.initializeTouchControls = (function() {
  let btnLeft, btnRight, btnUp;
  const repeaters = new Map();

  function sendKey(type, keyName, codeName, keyCode) {
    const ev = new KeyboardEvent(type, {
      key: keyName,
      code: codeName,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(ev);
  }

  function startHold(btn, downArgs) {
    sendKey('keydown', ...downArgs);
    const id = setInterval(() => sendKey('keydown', ...downArgs), 100);
    repeaters.set(btn, id);
  }

  function endHold(btn, upArgs) {
    const id = repeaters.get(btn);
    if (id) clearInterval(id);
    repeaters.delete(btn);
    sendKey('keyup', ...upArgs);
  }

  function makeControls() {
    if (btnLeft) return; // already created

    // --- Inject CSS ---
    const style = document.createElement('style');
    style.textContent = `
      .rt-touch-btn {
        position: fixed;
        width: 120px; height: 120px;
        font-size: 48px; color: white;
        border: none; border-radius: 20px;
        background: #000;
        cursor: pointer; 
        user-select: none; /* disable text selection */
        touch-action: none;
        display: flex; align-items: center; justify-content: center;
        z-index: 2000;
      }
      /* left/right at bottom-left */
      .rt-touch-left  { left:  20px; bottom: 20px; background: #5cc93b; }
      .rt-touch-right { left: 150px; bottom: 20px; background: #5cc93b; }
      /* up (space) at bottom-right */
      .rt-touch-up    { right: 20px; bottom: 20px; background: #4193c9; }
    `;
    document.head.appendChild(style);

    // --- Create buttons ---
    btnLeft = document.createElement('button');
    btnLeft.className = 'rt-touch-btn rt-touch-left';
    btnLeft.textContent = '←';

    btnRight = document.createElement('button');
    btnRight.className = 'rt-touch-btn rt-touch-right';
    btnRight.textContent = '→';

    btnUp = document.createElement('button');
    btnUp.className = 'rt-touch-btn rt-touch-up';
    btnUp.textContent = '↑';

    document.body.append(btnLeft, btnRight, btnUp);

    // --- Wire press‑and‑hold behavior ---
    [
      [btnLeft,  ['ArrowLeft','ArrowLeft',37], ['ArrowLeft','ArrowLeft',37]],
      [btnRight, ['ArrowRight','ArrowRight',39], ['ArrowRight','ArrowRight',39]],
      [btnUp,    [' ','Space',32],             [' ','Space',32]]
    ].forEach(([btn, downArgs, upArgs]) => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        startHold(btn, downArgs);
      });
      ['pointerup','pointercancel','pointerleave'].forEach(evtName => {
        btn.addEventListener(evtName, e => {
          e.preventDefault();
          endHold(btn, upArgs);
        });
      });
    });

   