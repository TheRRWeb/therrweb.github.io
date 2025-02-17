// Firebase authentication and Firestore initialization (done in HTML)
// Assuming you have imported Firebase SDK already in the HTML

const auth = getAuth();
const db = getFirestore();

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("User signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously: ", error);
    showToast("Error signing in anonymously: " + error.message); // Show error toast
  });

// Function to save progress (fullscreen state)
async function saveProgress(gameProgress) {
  try {
    const userId = auth.currentUser?.uid; // Get the current user's UID

    if (!userId) {
      throw new Error("User not signed in.");
    }

    // Reference to the user's document in Firestore
    const userRef = doc(db, "users", userId);

    // Save the game progress (fullscreen state)
    await setDoc(userRef, {
      progress: gameProgress
    }, { merge: true });

    console.log("Game progress saved successfully!");
  } catch (error) {
    console.error("Error saving progress: ", error);
    showToast("Error saving progress: " + error.message); // Show error toast
  }
}

// Function to open the game in fullscreen mode
async function openFullscreen(url) {
  try {
    // Reference to the fullscreen container and iframe
    const container = document.getElementById('fullscreenContainer');
    const iframe = document.getElementById('fullscreenIframe');

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
    await saveProgress({ fullscreen: true, gameUrl: url });
  } catch (error) {
    console.error("Error opening fullscreen: ", error);
    showToast("Error opening fullscreen: " + error.message); // Show error toast
  }
}

// Function to close the fullscreen mode
async function closeFullscreen() {
  try {
    const container = document.getElementById('fullscreenContainer');
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
    await saveProgress({ fullscreen: false });
  } catch (error) {
    console.error("Error closing fullscreen: ", error);
    showToast("Error closing fullscreen: " + error.message); // Show error toast
  }
}

// Toast notification function for error handling
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = 1000;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);  // Remove after 3 seconds
}