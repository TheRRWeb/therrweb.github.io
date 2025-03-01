function sendKey(key) {
    const iframe = document.getElementById('fullscreenIframe'); // Get game iframe
    if (!iframe || !iframe.contentWindow) return;

    // Create and dispatch a keydown event
    const keyEvent = new KeyboardEvent('keydown', {
        key: key.length === 1 ? key : undefined, // Set key if single character
        code: key,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true
    });

    // Send event to the game inside the iframe
    iframe.contentWindow.dispatchEvent(keyEvent);
}

// Toggle keyboard visibility
function toggleKeyboard() {
    const keyboard = document.getElementById('virtualKeyboard');
    const toggleButton = document.getElementById('toggleKeyboard');

    if (keyboard.style.display === 'none') {
        keyboard.style.display = 'flex';
        toggleButton.textContent = 'Hide Keyboard';
    } else {
        keyboard.style.display = 'none';
        toggleButton.textContent = 'Show Keyboard';
    }
}