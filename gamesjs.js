function openFullscreen(url) {
  // Save the game URL to localStorage
  let playedGames = JSON.parse(localStorage.getItem('playedGames')) || [];

  // Check if the game has already been added to the list
  if (!playedGames.includes(url)) {
    playedGames.push(url);
    localStorage.setItem('playedGames', JSON.stringify(playedGames));
  }

  // Call your original openFullscreen function to open the game in fullscreen
  var container = document.getElementById('fullscreenContainer');
  var iframe = document.getElementById('fullscreenIframe');

  iframe.src = url;
  container.style.display = 'flex';

  // Request Full-Screen Mode
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.mozRequestFullScreen) { // Firefox
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) { // Chrome, Safari, Opera
    container.webkitRequestFullscreen();
  } else if (container.msRequestFullscreen) { // IE/Edge
    container.msRequestFullscreen();
  }
}

function closeFullscreen() {
  var container = document.getElementById('fullscreenContainer');
  container.style.display = 'none';
  document.getElementById('fullscreenIframe').src = ""; // Clear iframe source

  // Exit Full-Screen Mode
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen();
  }
}

localStorage.setItem('test', 'Hello, World!');
alert(localStorage.getItem('test'));