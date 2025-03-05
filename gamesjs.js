let siteUrl = "therrweb.vercel.app"; // Change this only once

function openFullscreen(gameUrl) {
    let gameWindow = window.open(gameUrl, '_blank');

    if (!gameWindow) {
        alert("Please allow pop-ups for this site.");
    } else {
        gameWindow.focus();
    }
}

// Handle Android back button (for better user experience)
window.addEventListener('popstate', function () {
    window.location.href = siteUrl;
});
