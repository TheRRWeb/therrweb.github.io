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
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's UID
  if (!userId) {
    showToast("User not authenticated", "error");
    return;
  }

  // Reference to the user's document in Firestore
  const userRef = doc(db, "users", userId);

  // Save the game progress (fullscreen state)
  setDoc(userRef, {
    progress: gameProgress
  })
  .then(() => {
    showToast("Game progress saved successfully!", "success"); // Success message
  })
  .catch((error) => {
    console.error("Error saving progress: ", error);
    showToast("Error saving progress: " + error.message, "error"); // Error message
  });
}

// Function to open the game in fullscreen mode
function openFullscreen(url) {
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

// Function to show a toast message (success or error)
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3500);
}