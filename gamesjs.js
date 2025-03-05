// Function to open the game in fullscreen or the desired format
function openFullscreen(url) {
  var container = document.getElementById('fullscreenContainer');
  var iframe = document.getElementById('fullscreenIframe');

  // Save the game URL to localStorage to track the last played game
  let playedGames = JSON.parse(localStorage.getItem('playedGames')) || [];

  // Check if the game has already been added to the list
  if (!playedGames.includes(url)) {
    playedGames.push(url);
    localStorage.setItem('playedGames', JSON.stringify(playedGames));
  }

  // Set the game URL in the iframe and display the fullscreen container
  iframe.src = url;
  container.style.display = 'flex';
}

// Function to close the fullscreen and stop the game
function closeFullscreen() {
  var container = document.getElementById('fullscreenContainer');
  container.style.display = 'none';
  document.getElementById('fullscreenIframe').src = ""; // Clear iframe source

  // Save the game URL to localStorage when the game is closed
  let playedGames = JSON.parse(localStorage.getItem('playedGames')) || [];
  // You can save more specific game progress here if needed
  localStorage.setItem('playedGames', JSON.stringify(playedGames));
}

// Function to load the saved game progress when the page loads
function loadGameProgress() {
  // Retrieve the saved games from localStorage
  const playedGames = JSON.parse(localStorage.getItem('playedGames')) || [];
  
  if (playedGames.length > 0) {
    console.log('Last played games:', playedGames);
    // Optionally show the last played games or let users continue from there
    // You can modify this based on how you want to display the data
  }
}

// Call loadGameProgress when the page loads to show previous progress (if needed)
loadGameProgress();
