// Function to open the game in fullscreen or the desired format
function openFullscreen(gameUrl) {
  // Check if the gameUrl is valid
  if (gameUrl) {
    // Open the game URL in a new tab or in an iframe, based on how your site is structured
    window.open(gameUrl, '_blank');
  }
}

// Function to save the game progress when clicked
function saveGameProgress(gameUrl) {
  // Save the game URL to localStorage to track the last played game
  localStorage.setItem('lastPlayedGame', gameUrl);
}

// Function to load the saved game progress
function loadGameProgress() {
  // Retrieve the saved game URL from localStorage
  const lastPlayedGame = localStorage.getItem('lastPlayedGame');
  if (lastPlayedGame) {
    console.log('Last played game:', lastPlayedGame);
    // Here you could optionally show the saved game URL, but we won't open it automatically
    // You can also use this to show any information about the last played game
  }
}

// Add event listeners for game clicks, assuming you have game thumbnails or buttons
const gameElements = document.querySelectorAll('.game-thumbnail'); // Change this selector to match your HTML structure

gameElements.forEach(gameElement => {
  // Assuming the 'game-thumbnail' element has an 'onclick' attribute with the game URL
  const gameUrl = gameElement.getAttribute('onclick').match(/'([^']+)'/)[1]; // Extract the URL from the onclick attribute

  // When a user clicks on a game, save the progress and open the game
  gameElement.addEventListener('click', () => {
    saveGameProgress(gameUrl);  // Save the game progress
    openFullscreen(gameUrl);    // Open the game in fullscreen or the desired method
  });
});

// Initialize by loading the last played game (this won't auto-open it)
loadGameProgress();