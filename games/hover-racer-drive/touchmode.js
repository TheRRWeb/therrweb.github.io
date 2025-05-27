// touch-controls.js

// Expose a global initializer—does NOT auto-run
window.initializeTouchControls = function() {
  // 1) Inject touch‑button styles
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

  // 2) Create the control container + buttons
  const container = document.createElement('div');
  container.className = 'touch-controls';

  const leftButton = document.createElement('button');
  leftButton.className = 'touch-button left-button';
  leftButton.textContent = '<';

  const rightButton = document.createElement('button');
  rightButton.className = 'touch-button right-button';
  rightButton.textContent = '>';

  container.append(leftButton, rightButton);
  document.body.append(container);

  // 3) Key‑event simulator
  function simulateKeyEvent(key, type) {
    const code = key === 'ArrowLeft' ? 37 : 39;
    const evt = new KeyboardEvent(type, {
      key, code: key,
      keyCode: code, which: code,
      bubbles: true, cancelable: true
    });
    document.dispatchEvent(evt);
  }

  // 4) Touch listeners
  leftButton.addEventListener('touchstart', e => {
    e.preventDefault();
    simulateKeyEvent('ArrowLeft','keydown');
  });
  leftButton.addEventListener('touchend', e => {
    e.preventDefault();
    simulateKeyEvent('ArrowLeft','keyup');
  });

  rightButton.addEventListener('touchstart', e => {
    e.preventDefault();
    simulateKeyEvent('ArrowRight','keydown');
  });
  rightButton.addEventListener('touchend', e => {
    e.preventDefault();
    simulateKeyEvent('ArrowRight','keyup');
  });

  // 5) Dummy listener to activate passive touch handling
  document.addEventListener('touchstart', () => {}, true);
};