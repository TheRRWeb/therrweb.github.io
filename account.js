// ─── 1. Firebase Init ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD34uwp0C9IKdJKctW8-cK2MNjzQHp9uM4",
  authDomain: "the-rr-web-firebase.firebaseapp.com",
  projectId: "the-rr-web-firebase",
  storageBucket: "the-rr-web-firebase.firebasestorage.app",
  messagingSenderId: "346095124678",
  appId: "1:346095124678:web:76a493013394860afa17c7"
};
firebase.initializeApp(firebaseConfig);

// ─── 2. Element References ────────────────────────────────────────────────────
const authForm        = document.getElementById("authForm");
const emailInput      = document.getElementById("email");
const passwordInput   = document.getElementById("password");
const errorMessage    = document.getElementById("errorMessage");
const signedOutView   = document.getElementById("signedOutView");
const signedInView    = document.getElementById("signedInView");

const saveBtn         = document.getElementById("saveBtn");
const loadBtn         = document.getElementById("loadBtn");
const signOutBtn      = document.getElementById("signOutBtn");
const changeEmailBtn  = document.getElementById("changeEmailBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const resetPasswordBtn  = document.getElementById("resetPasswordBtn");
const signUpBtn       = document.getElementById("signUpBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

// ─── 3. Auth State Listener ───────────────────────────────────────────────────
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    signedOutView.style.display = "none";
    signedInView.style.display  = "block";
    // toggle membership elements
    document.querySelectorAll('.memshow').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.memhide').forEach(el => el.style.display = 'none');
  } else {
    signedOutView.style.display = "block";
    signedInView.style.display  = "none";
    document.querySelectorAll('.memshow').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.memhide').forEach(el => el.style.display = 'block');
  }
});

// ─── 4. Sign In ───────────────────────────────────────────────────────────────
authForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = emailInput.value;
  const pwd   = passwordInput.value;
  firebase.auth().signInWithEmailAndPassword(email, pwd)
    .then(() => {
      if (typeof umami !== 'undefined') {
        umami.track('user_sign_in', { email });
      }
    })
    .catch(err => {
      errorMessage.textContent = getFriendlyError(err);
    });
});

// ─── 5. Sign Up ───────────────────────────────────────────────────────────────
signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;
  firebase.auth().createUserWithEmailAndPassword(email, pwd)
    .then(() => {
      if (typeof umami !== 'undefined') {
        umami.track('user_sign_up', { email });
      }
      alert("Account created successfully.");
    })
    .catch(err => {
      errorMessage.textContent = getFriendlyError(err);
    });
});

// ─── 6. Password Reset ────────────────────────────────────────────────────────
resetPasswordBtn.addEventListener("click", () => {
  const email = emailInput.value;
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent."))
    .catch(err => errorMessage.textContent = getFriendlyError(err));
});

// ─── 7. Sign Out ─────────────────────────────────────────────────────────────
signOutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// ─── 8. Change Email ─────────────────────────────────────────────────────────
changeEmailBtn.addEventListener("click", () => {
  const newEmail = prompt("Enter your new email:");
  if (!newEmail) return;
  firebase.auth().currentUser.updateEmail(newEmail)
    .then(() => firebase.auth().currentUser.sendEmailVerification())
    .then(() => alert("Verification email sent to your new address."))
    .catch(err => alert(getFriendlyError(err)));
});

// ─── 9. Change Password ───────────────────────────────────────────────────────
changePasswordBtn.addEventListener("click", () => {
  const newPwd = prompt("Enter your new password:");
  if (!newPwd) return;
  firebase.auth().currentUser.updatePassword(newPwd)
    .then(() => alert("Password updated!"))
    .catch(err => alert(getFriendlyError(err)));
});

// ─── 10. Delete Account ───────────────────────────────────────────────────────
deleteAccountBtn.addEventListener("click", () => {
  if (!confirm("Are you sure? This cannot be undone.")) return;
  firebase.auth().currentUser.delete()
    .then(() => alert("Account deleted."))
    .catch(err => alert("Error deleting account: " + err.message));
});

// ─── 11. Save & Load Placeholders ─────────────────────────────────────────────
saveBtn.addEventListener("click", () => {
  alert("Save game data clicked.");
});
loadBtn.addEventListener("click", () => {
  alert("Load game data clicked.");
});

// ─── 12. Friendly Error Mapper ────────────────────────────────────────────────
function getFriendlyError(err) {
  switch (err.code) {
    case "auth/invalid-email":           return "Invalid email address.";
    case "auth/user-not-found":          return "No account with that email.";
    case "auth/wrong-password":          return "Incorrect password.";
    case "auth/email-already-in-use":    return "Email is already registered.";
    case "auth/weak-password":           return "Password is too weak.";
    default:                             return "Error: " + err.message;
  }
}