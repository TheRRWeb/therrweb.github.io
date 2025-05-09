(function() {
  // Function to detect touch support
  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  }

  // Only proceed if touch is supported
  if (isTouchDevice()) {
    // Create and append styles
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
      .up-button {
        background-color: #4193c9;
      }
      .button-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .up-button {
        margin-bottom: 10px;
      }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.className = 'touch-controls';

    // Create left button
    const leftButton = document.createElement('button');
    leftButton.className = 'touch-button left-button';
    leftButton.textContent = '<';

    // Create right button
    const rightButton = document.createElement('button');
    rightButton.className = 'touch-button right-button';
    rightButton.textContent = '>';

    // Create up button
    const upButton = document.createElement('button');
    upButton.className = 'touch-button up-button';
    upButton.textContent = '^';

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(upButton);
    buttonContainer.appendChild(rightButton);

    // Append buttons to container
    container.appendChild(leftButton);
    container.appendChild(buttonContainer);
    document.body.appendChild(container);

    // Function to simulate key events
    function simulateKeyEvent(key, type) {
      const event = new KeyboardEvent(type, {
        key: key,
        code: key,
        keyCode: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 38,
        which: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 38,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    }

    // Add touch event listeners
    leftButton.addEventListener('touchstart', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowLeft', 'keydown');
    });
    leftButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowLeft', 'keyup');
    });

    rightButton.addEventListener('touchstart', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowRight', 'keydown');
    });
    rightButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowRight', 'keyup');
    });

    upButton.addEventListener('touchstart', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowUp', 'keydown');
    });
    upButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      simulateKeyEvent('ArrowUp', 'keyup');
    });
  }
})();
