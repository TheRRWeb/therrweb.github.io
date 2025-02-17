// Function to check if localStorage is available
function isLocalStorageAvailable() {
  try {
    // Try to use localStorage and set a test item
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch (e) {
    return false; // Return false if an error occurs (indicating cookies/localStorage is blocked)
  }
}

// Check if cookies are enabled
function checkCookies() {
  if (isLocalStorageAvailable()) {
    // If cookies are enabled, save the preference and load the game progress
    localStorage.setItem("cookiesEnabled", "yes");
  } else {
    // Show an alert if cookies are disabled, ask the user to enable them
    alert("It looks like your browser is blocking cookies or localStorage. Please enable them for progress to be saved.");
  }
}

// Show the cookie prompt on page load if not yet set
window.onload = function() {
  const cookiesEnabled = localStorage.getItem("cookiesEnabled");
  
  if (!cookiesEnabled) {
    const userResponse = confirm("This website uses cookies to save your game progress. Do you allow cookies?");
    if (userResponse) {
      checkCookies();
    } else {
      // Inform the user that cookies are needed
      alert("Without cookies, progress will not be saved.");
    }
  }
};

// Now add the code to handle game progress saving, fullscreen state, etc., just like before
function saveProgress(gameProgress) {
  if (localStorage.getItem("cookiesEnabled") === "yes") {
    // Save the game progress
    const gameData = JSON.stringify(gameProgress);
    localStorage.setItem("gameProgress", gameData);
  } else {
    console.log("Cookies not enabled. Progress will not be saved.");
  }
}

// Example function to open fullscreen and save progress
function openFullscreen(url) {
  const container = document.getElementById('fullscreenContainer');
  const iframe = document.getElementById('fullscreenIframe');
  
  iframe.src = url;
  container.style.display = 'flex'; // Show the fullscreen container
  
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  }
  
  // Save progress when the game is opened
  saveProgress({ fullscreen: true, gameUrl: url });
}

function closeFullscreen() {
  const container = document.getElementById('fullscreenContainer');
  container.style.display = 'none'; // Hide the fullscreen container
  document.getElementById('fullscreenIframe').src = ""; // Clear iframe source
  
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  
  // Save progress when fullscreen is closed
  saveProgress({ fullscreen: false });
}