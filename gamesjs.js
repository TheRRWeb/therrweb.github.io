function openFullscreen(gameUrl) {
    // Store the current URL so we can navigate back to the game gallery after
    let currentUrl = window.location.href;

    // Open the new game page in the same window
    window.location.href = gameUrl;

    // After the page loads, request fullscreen mode
    window.addEventListener('load', () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    });
}

