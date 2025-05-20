// 1) Firebase init (v8 namespace)
const firebaseConfig = {
  apiKey: "AIzaSyD34uwp0C9IKdJKctW8-cK2MNjzQHp9uM4",
  authDomain: "the-rr-web-firebase.firebaseapp.com",
  projectId: "the-rr-web-firebase",
  storageBucket: "the-rr-web-firebase.firebasestorage.app",
  messagingSenderId: "346095124678",
  appId: "1:346095124678:web:76a493013394860afa17c7"
};
firebase.initializeApp(firebaseConfig);

// 2) Element references
const emailInput        = document.getElementById("email");
const passwordInput     = document.getElementById("password");
const signInBtn         = document.getElementById("sign-in-btn");
const signUpBtn         = document.getElementById("sign-up-btn");
const resetBtn          = document.getElementById("forgot-password-btn");
const errorMessageEl    = document.getElementById("error-message");
const signedOutView     = document.getElementById("auth-container");
const signedInView      = document.getElementById("user-controls");
const signOutBtn        = document.getElementById("sign-out");
const changeEmailBtn    = document.getElementById("change-email");
const changePasswordBtn = document.getElementById("change-password");
const deleteAccountBtn  = document.getElementById("delete-account");
const saveBtn           = document.getElementById("save-game-data");
const loadBtn           = document.getElementById("load-game-data");

// 3) Auth state listener
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    signedOutView.style.display = "none";
    signedInView.style.display  = "block";
    document.querySelectorAll(".memshow").forEach(el => el.style.display = "block");
    document.querySelectorAll(".memhide").forEach(el => el.style.display = "none");
    document.getElementById("user-email").textContent = user.email;
  } else {
    signedOutView.style.display = "block";
    signedInView.style.display  = "none";
    document.querySelectorAll(".memshow").forEach(el => el.style.display = "none");
    document.querySelectorAll(".memhide").forEach(el => el.style.display = "block");
  }
});

// 4) Sign In
signInBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;

  firebase.auth().signInWithEmailAndPassword(email, pwd)
    .then(() => {
      if (typeof umami !== "undefined") umami.track("user_sign_in", { email });
    })
    .catch(err => {
      errorMessageEl.textContent = err.code
        ? friendlyError(err)
        : "Incorrect email or password.";
    });
});

// 5) Sign Up (reload on success)
signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;

  firebase.auth().createUserWithEmailAndPassword(email, pwd)
    .then(() => {
      if (typeof umami !== "undefined") umami.track("user_sign_up", { email });
      location.reload();
    })
    .catch(err => {
      errorMessageEl.textContent = friendlyError(err);
    });
});

// 6) Password Reset
resetBtn.addEventListener("click", () => {
  const email = emailInput.value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent."))
    .catch(err => {
      errorMessageEl.textContent = friendlyError(err);
    });
});

// 7) Sign Out
signOutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// 8) Change Email
changeEmailBtn.addEventListener("click", () => {
  const newEmail = prompt("Enter your new email:");
  if (!newEmail) return;

  firebase.auth().currentUser.updateEmail(newEmail)
    .then(() => firebase.auth().currentUser.sendEmailVerification())
    .then(() => alert("Verification email sent."))
    .catch(err => alert(friendlyError(err)));
});

// 9) Change Password
changePasswordBtn.addEventListener("click", () => {
  const newPwd = prompt("Enter your new password:");
  if (!newPwd) return;

  firebase.auth().currentUser.updatePassword(newPwd)
    .then(() => alert("Password updated!"))
    .catch(err => alert(friendlyError(err)));
});

// 10) Delete Account
deleteAccountBtn.addEventListener("click", () => {
  if (!confirm("Are you sure? This cannot be undone.")) return;
  firebase.auth().currentUser.delete()
    .then(() => alert("Account deleted."))
    .catch(err => alert("Error deleting account: " + err.message));
});

// 11) Save & Load Game Data (placeholders)
saveBtn.addEventListener("click", () => alert("Save game data clicked."));
loadBtn.addEventListener("click", () => alert("Load game data clicked."));

// Helper: user‐friendly error messages
function friendlyError(err) {
  switch (err.code) {
    case "auth/invalid-email":        return "Invalid email.";
    case "auth/user-not-found":       return "No account with that email.";
    case "auth/wrong-password":       return "Wrong password.";
    case "auth/email-already-in-use": return "Email already used.";
    case "auth/weak-password":        return "Password too weak.";
    default:                          return "Error: " + err.message;
  }
}