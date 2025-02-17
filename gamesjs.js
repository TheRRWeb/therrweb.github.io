const auth = getAuth();
const db = getFirestore();

// Function to save progress (fullscreen state)
function saveProgress(gameProgress) {
  if (auth.currentUser) {
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
      showToast("Error saving progress");
    });
  } else {
    console.log("User is not signed in");
  }
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

  // Save fullscreen state to Firestore (after user is authenticated)
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

// Wait for the auth state to be fully initialized before proceeding
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in: ", user.uid);
    // You can now call functions that depend on the authenticated user
    // No need to add additional checks inside the fullscreen functions anymore
  } else {
    console.log("User is not signed in");
  }
});

// Show toast notification
function showToast(message) {
  // Create a new toast element
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;

  // Append it to the body
  document.body.appendChild(toast);

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// CSS styles for the toast (you can place it in the same JS)
const style = document.createElement('style');
style.innerHTML = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    z-index: 1000;
  }
`;
document.head.appendChild(style);