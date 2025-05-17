// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signOut, updateEmail, updatePassword, deleteUser } from 'https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js';

// Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyD34uwp0C9IKdJKctW8-cK2MNjzQHp9uM4',
  authDomain: 'the-rr-web-firebase.firebaseapp.com',
  projectId: 'the-rr-web-firebase',
  storageBucket: 'the-rr-web-firebase.appspot.com',
  messagingSenderId: '346095124678',
  appId: '1:346095124678:web:76a493013394860afa17c7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('sign-in-btn');
const signUpBtn = document.getElementById('sign-up-btn');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const errorMessage = document.getElementById('error-message');
const authContainer = document.getElementById('auth-container');
const userControls = document.getElementById('user-controls');
const userEmailDisplay = document.getElementById('user-email');

// Event Listeners
signInBtn.addEventListener('click', handleSignIn);
signUpBtn.addEventListener('click', handleSignUp);
forgotPasswordBtn.addEventListener('click', handleForgotPassword);

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    authContainer.style.display = 'none';
    userControls.style.display = 'block';
    userEmailDisplay.textContent = user.email;
  } else {
    // User is signed out
    authContainer.style.display = 'block';
    userControls.style.display = 'none';
  }
});

// Sign In Function
function handleSignIn() {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      errorMessage.textContent = getFirebaseErrorMessage(error.code);
    });
}

// Sign Up Function
function handleSignUp() {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      errorMessage.textContent = getFirebaseErrorMessage(error.code);
    });
}

// Forgot Password Function
function handleForgotPassword() {
  const email = emailInput.value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert('Password reset email sent!');
    })
    .catch((error) => {
      errorMessage.textContent = getFirebaseErrorMessage(error.code);
    });
}

// Firebase Error Messages
function getFirebaseErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'The email address is badly formatted.',
    'auth/user-disabled': 'The user account has been disabled.',
    'auth/user-not-found': 'No user found with this email address.',
    'auth/wrong-password': 'The password is incorrect.',
    'auth/email-already-in-use': 'The email address is already in use by another account.',
    'auth/weak-password': 'The password is too weak.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.',
    'auth/too-many-requests': 'Too many requests. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return errorMessages[errorCode] || 'An unexpected error occurred.';
}

// Sign Out Function
document.getElementById('sign-out').addEventListener('click', () => {
  signOut(auth).catch((error) => {
    errorMessage.textContent = getFirebaseErrorMessage(error.code);
  });
});

// Save Game Data Function
document.getElementById('save-game-data').addEventListener('click', () => {
  // Implement save game data logic here
});

// Load Game Data Function
document.getElementById('load-game-data').addEventListener('click', () => {
  // Implement load game data logic here
});

// Change Email Function
document.getElementById('change-email').addEventListener('click', () => {
  const newEmail = prompt('Enter new email address:');
  if (newEmail) {
    updateEmail(auth.currentUser, newEmail)
      .catch((error) => {
        errorMessage.textContent = getFirebaseErrorMessage(error.code);
      });
  }
});

// Change Password Function
document.getElementById('change-password').addEventListener('click', () => {
  const newPassword = prompt('Enter new password:');
  if (newPassword) {
    updatePassword(auth.currentUser, newPassword)
      .catch((error) => {
        errorMessage.textContent = getFirebaseErrorMessage(error.code);
      });
  }
});

// Delete Account Function
document.getElementById('delete-account').addEventListener('click', () => {
  const confirmation = confirm('Are you sure you want to delete your account?');
  if (confirmation) {
    deleteUser(auth.currentUser)
      .then(() => {
        alert('Your account has been deleted.');
      })
      .catch((error) => {
        errorMessage.textContent = getFirebaseErrorMessage(error.code);
      });
  }
});
