// Function to check if localStorage is available
function isLocalStorageAvailable() {
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        return true;
    } catch (e) {
        return false;
    }
}

// Check if cookies are allowed
function checkCookiesPermission() {
    if (!isLocalStorageAvailable()) {
        let userChoice = localStorage.getItem("cookiesAccepted");

        if (userChoice === null) {
            let confirmCookies = confirm("This site uses cookies to save your game progress. Enable cookies?");
            if (confirmCookies) {
                localStorage.setItem("cookiesAccepted", "true");
                if (!isLocalStorageAvailable()) {
                    alert("It looks like your browser is still blocking cookies. Please enable them in your browser settings for progress to be saved.");
                }
            } else {
                localStorage.setItem("cookiesAccepted", "false");
            }
        }
    }
}

// Run check on page load
checkCookiesPermission();

// Function to save game progress
function saveProgress(gameUrl) {
    if (!isLocalStorageAvailable()) {
        console.warn("Local storage is disabled. Progress will not be saved.");
        return;
    }

    localStorage.setItem("lastPlayedGame", gameUrl);
}

// Function to load last played game
function loadLastPlayedGame() {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    return localStorage.getItem("lastPlayedGame");
}

// Function to open game in fullscreen
function openFullscreen(url) {
    var container = document.getElementById('fullscreenContainer');
    var iframe = document.getElementById('fullscreenIframe');

    iframe.src = url;
    container.style.display = 'flex';

    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    }

    saveProgress(url);
}

// Function to close fullscreen
function closeFullscreen() {
    var container = document.getElementById('fullscreenContainer');
    container.style.display = 'none';
    document.getElementById('fullscreenIframe').src = "";

    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}
