// Firebase authentication and Firestore initialization (done in HTML)
// Assuming you have imported Firebase SDK already in the HTML

const auth = getAuth();
const db = getFirestore();

// Wait for the authentication state to be initialized
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in anonymously");
  } else {
    console.log("No user signed in");
  }
});

// Function to save progress (fullscreen state)
async function saveProgress(gameProgress) {
  try {
    // Check if the user is authenticated
    if (!auth.currentUser) {
      throw new Error("User not signed in. Please try again later.");
    }

    const userId = auth.currentUser.uid; // Get the current user's UID

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
    container.style.display = 'none'; // Hide the fullscreen container
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

// Function to show toast notifications
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    document.body.appendChild(toastContainer);
  }

  // Create toast message
  const toastMessage = document.createElement("div");
  toastMessage.className = "toastMessage";
  toastMessage.textContent = message;
  
  // Add toast to container and show
  toastContainer.appendChild(toastMessage);
  
  // Set a timeout to remove the toast after 5 seconds
  setTimeout(() => {
    toastMessage.remove();
  }, 5000);
}

// Styles for the toast (added dynamically)
const style = document.createElement('style');
style.innerHTML = `
  #toastContainer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
  .toastMessage {
    background-color: #f44336;
    color: white;
    padding: 16px;
    margin-bottom: 10px;
    border-radius: 5px;
    font-size: 16px;
    opacity: 0.9;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    transition: opacity 0.5s ease;
  }
  .toastMessage.hide {
    opacity: 0;
  }
`;
document.head.appendChild(style);