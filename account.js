// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD34uwp0C9IKdJKctW8-cK2MNjzQHp9uM4",
  authDomain: "the-rr-web-firebase.firebaseapp.com",
  projectId: "the-rr-web-firebase",
  storageBucket: "the-rr-web-firebase.firebasestorage.app",
  messagingSenderId: "346095124678",
  appId: "1:346095124678:web:76a493013394860afa17c7"
};
firebase.initializeApp(firebaseConfig);

// DOM Elements
const signInForm = document.getElementById("signInForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const signedOutView = document.getElementById("signedOutView");
const signedInView = document.getElementById("signedInView");

const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const signOutBtn = document.getElementById("signOutBtn");
const changeEmailBtn = document.getElementById("changeEmailBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const signUpBtn = document.getElementById("signUpBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

// Monitor authentication state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    signedOutView.style.display = "none";
    signedInView.style.display = "block";

    // Show membership features
    document.querySelectorAll('.memshow').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.memhide').forEach(el => el.style.display = 'none');
  } else {
    signedOutView.style.display = "block";
    signedInView.style.display = "none";

    // Hide membership features
    document.querySelectorAll('.memshow').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.memhide').forEach(el => el.style.display = 'block');
  }
});

// Sign In
signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      if (typeof umami !== 'undefined') {
        umami.track('user_sign_in', { email: email });
      }
    })
    .catch((error) => {
      errorMessage.textContent = getFriendlyError(error);
    });
});

// Sign Up
signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      if (typeof umami !== 'undefined') {
        umami.track('user_sign_up', { email: email });
      }
      alert("Account created successfully.");
    })
    .catch((error) => {
      errorMessage.textContent = getFriendlyError(error);
    });
});

// Forgot Password
resetPasswordBtn.addEventListener("click", () => {
  const email = emailInput.value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent.");
    })
    .catch((error) => {
      errorMessage.textContent = getFriendlyError(error);
    });
});

// Sign Out
signOutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// Change Email
changeEmailBtn.addEventListener("click", () => {
  const newEmail = prompt("Enter your new email:");
  if (newEmail) {
    firebase.auth().currentUser.updateEmail(newEmail)
      .then(() => {
        return firebase.auth().currentUser.sendEmailVerification();
      })
      .then(() => {
        alert("Verification email sent to your new address.");
      })
      .catch((error) => {
        alert(getFriendlyError(error));
      });
  }
});

// Change Password
changePasswordBtn.addEventListener("click", () => {
  const newPassword = prompt("Enter your new password:");
  if (newPassword) {
    firebase.auth().currentUser.updatePassword(newPassword)
      .then(() => {
        alert("Password updated!");
      })
      .catch((error) => {
        alert(getFriendlyError(error));
      });
  }
});

// Delete Account
deleteAccountBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
    firebase.auth().currentUser.delete()
      .then(() => {
        alert("Your account has been deleted.");
      })
      .catch((error) => {
        alert("Error deleting account: " + error.message);
      });
  }
});

// Placeholder: Add your save and load functions
saveBtn.addEventListener("click", () => {
  alert("Save game data clicked.");
});
loadBtn.addEventListener("click", () => {
  alert("Load game data clicked.");
});

// Helper function for user-friendly error messages
function getFriendlyError(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
      return "No user found with that email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "Email is already in use.";
    case "auth/weak-password":
      return "Password is too weak.";
    default:
      return "Error: " + error.message;
  }
}