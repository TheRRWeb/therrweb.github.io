// Initialize Firebase Authentication and Firestore
const auth = getAuth();
const db = getFirestore();

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("User signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously: ", error);
  });

// Function to save progress (fullscreen state)
function saveProgress(gameProgress) {
  const userId = auth.currentUser.uid; // Get the current user's UID

  // Reference to the user's document in Firestore
  const userRef = doc(db, "users", userId);

  // Save the game progress (fullscreen state)
  setDoc(userRef, {
    progress: gameProgress
  })
  .then(() => {
    console.log("Game progress saved successfully!");
  })
  .catch((error) => {
    console.error("Error saving progress: ", error);
  });
}

// Function to open the game in fullscreen mode
function openFullscreen(url) {
  // Reference to the fullscreen container and iframe
  var container = document.getElementById('fullscreenContainer');
  var iframe = document.getElementById('fullscreenIframe');

  iframe.src = url;
  container.style.display = 'flex';  // Show the fullscreen container

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

  // Save fullscreen state to Firestore
  saveProgress({ fullscreen: true, gameUrl: url });
}

// Function to close the fullscreen mode
function closeFullscreen() {
  var container = document.getElementById('fullscreenContainer');
  container.style.display = 'none';  // Hide the fullscreen container
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

  // Save fullscreen state to Firestore (indicating that fullscreen was exited)
  saveProgress({ fullscreen: false });
}