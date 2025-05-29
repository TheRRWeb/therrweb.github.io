// touch-controls.js

(function() {
  // Create a container ref so we can remove it later
  let container = null;

  // 1) Inject touch‑button styles once
  const style = document.createElement('style');
  style.textContent = `
    .touch-controls {
      position: fixed;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      box-sizing: border-box;
      z-index: 1000;
    }
    .touch-button {
      width: 120px;
      height: 120px;
      font-size: 48px;
      color: white;
      border: none;
      border-radius: 20px;
      user-select: none;
      touch-action: none;
    }
    .left-button {
      background-color: #5cc93b;
    }
    .right-button {
      background-color: #4193c9;
    }
  `;
  document.head.appendChild(style);

  // 2) Build & show the buttons
  function showTouchControls() {
    if (container) return; // already shown
    container = document.createElement('div');
    container.className = 'touch-controls';

    const leftButton = document.createElement('button');
    leftButton.className = 'touch-button left-button';
    leftButton.textContent = '←';

    const rightButton = document.createElement('button');
    rightButton.className = 'touch-button right-button';
    rightButton.textContent = '→';

    container.append(leftButton, rightButton);
    document.body.append(container);

    // simulate arrow‑key events
    function simulateKeyEvent(key, type) {
      const code = key === 'ArrowLeft' ? 37 : 39;
      const evt = new KeyboardEvent(type, {
        key, code: key,
        keyCode: code, which: code,
        bubbles: true, cancelable: true
      });
      document.dispatchEvent(evt);
    }

    leftButton.addEventListener('touchstart', e => {
      e.preventDefault(); simulateKeyEvent('ArrowLeft','keydown');
    });
    leftButton.addEventListener('touchend',   e => {
      e.preventDefault(); simulateKeyEvent('ArrowLeft','keyup');
    });

    rightButton.addEventListener('touchstart', e => {
      e.preventDefault(); simulateKeyEvent('ArrowRight','keydown');
    });
    rightButton.addEventListener('touchend',   e => {
      e.preventDefault(); simulateKeyEvent('ArrowRight','keyup');
    });

    // dummy listener to enable passive touch
    document.addEventListener('touchstart', ()=>{}, true);
  }

  // 3) Remove the buttons
  function hideTouchControls() {
    if (!container) return;
    container.remove();
    container = null;
  }

  // 4) Check flag and show/hide accordingly
  function update() {
    if (localStorage.getItem('r-touch') === 'on') {
      showTouchControls();
    } else {
      hideTouchControls();
    }
  }

  // 5) Auto‑run on load
  document.addEventListener('DOMContentLoaded', update);

  // 6) Listen for changes
  window.addEventListener('r-touch-changed', update);
})();
