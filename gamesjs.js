// Initialize Firebase services
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

// Function to save progress (fullscreen state and game URL) to Firestore
function saveProgress(gameProgress) {
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's UID
  if (!userId) {
    console.error("User not authenticated");
    return;
  }

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

// Function to load progress (fullscreen state and game URL) from Firestore
function loadProgress() {
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's UID
  if (!userId) {
    console.error("User not authenticated");
    return;
  }

  // Reference to the user's document in Firestore
  const userRef = doc(db, "users", userId);

  // Load the game progress
  getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const progress = data.progress;

        // Check if fullscreen was previously enabled and load that state
        if (progress && progress.fullscreen) {
          openFullscreen(progress.gameUrl);
        }
      } else {
        console.log("No progress data found");
      }
    })
    .catch((error) => {
      console.error("Error loading progress: ", error);
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

  // Save fullscreen state and game URL to Firestore
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

// Load progress when the page is loaded (check if the game was previously played)
window.onload = function () {
  loadProgress();  // Load saved progress from Firestore
}