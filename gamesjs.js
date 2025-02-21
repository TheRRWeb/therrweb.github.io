// Function to open the game in fullscreen
function openFullscreen(gameUrl) {
  // Create an iframe to load the game in fullscreen
  const iframe = document.createElement('iframe');
  iframe.src = gameUrl;
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  iframe.style.backgroundColor = 'white';  // Optional: Add a background color

  // Append the iframe to the body
  document.body.appendChild(iframe);

  // Optionally, add a close button to remove the iframe
  const closeButton = document.createElement('button');
  closeButton.innerText = 'Close Game';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.zIndex = '10000';
  closeButton.style.padding = '10px 20px';
  closeButton.style.fontSize = '16px';

  closeButton.onclick = () => {
    iframe.remove();  // Remove the iframe
    closeButton.remove();  // Remove the close button
  };

  document.body.appendChild(closeButton);
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
    openFullscreen(gameUrl);    // Open the game in fullscreen within the same domain
  });
});

// Initialize by loading the last played game (this won't auto-open it)
loadGameProgress();