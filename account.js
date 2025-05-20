// 1) Initialize Firebase (v8 namespace)
const firebaseConfig = {
  apiKey: "AIzaSyD34uwp0C9IKdJKctW8-cK2MNjzQHp9uM4",
  authDomain: "the-rr-web-firebase.firebaseapp.com",
  projectId: "the-rr-web-firebase",
  storageBucket: "the-rr-web-firebase.firebasestorage.app",
  messagingSenderId: "346095124678",
  appId: "1:346095124678:web:76a493013394860afa17c7"
};
firebase.initializeApp(firebaseConfig);

// 2) Grab your elements
const emailInput        = document.getElementById("email");
const passwordInput     = document.getElementById("password");
const signInBtn         = document.getElementById("sign-in-btn");
const signUpBtn         = document.getElementById("sign-up-btn");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const errorMessageEl    = document.getElementById("error-message");
const signedOutView     = document.getElementById("auth-container");
const signedInView      = document.getElementById("user-controls");
const userEmailSpan     = document.getElementById("user-email");
const signOutBtn        = document.getElementById("sign-out");
const changePasswordBtn = document.getElementById("change-password");
const changeEmailBtn    = document.getElementById("change-email");
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
    userEmailSpan.textContent = user.email;
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
      // Simplify credential/network errors
      if (err.code === "auth/invalid-email" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password") {
        errorMessageEl.textContent = "Incorrect email or password.";
      } else if (err.message.toLowerCase().includes("network error")) {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      } else {
        errorMessageEl.textContent = err.message;
      }
    });
});

// 5) Sign Up
signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;
  firebase.auth().createUserWithEmailAndPassword(email, pwd)
    .then(() => {
      if (typeof umami !== "undefined") umami.track("user_sign_up", { email });
      alert("Account successfully created!");
      // no auto-refresh
    })
    .catch(err => {
      if (err.code === "auth/email-already-in-use") {
        errorMessageEl.textContent = "Email already used.";
      } else if (err.message.toLowerCase().includes("network error")) {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      } else {
        errorMessageEl.textContent = err.message;
      }
    });
});

// 6) Forgot Password
forgotPasswordBtn.addEventListener("click", () => {
  const email = emailInput.value;
  if (!email) {
    errorMessageEl.textContent = "Please enter your email to reset password.";
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent."))
    .catch(err => {
      errorMessageEl.textContent = "There is a network issue, try again later.";
    });
});

// 7) Sign Out
signOutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// 8) Change Password (send reset link)
changePasswordBtn.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().sendPasswordResetEmail(user.email)
      .then(() => alert("Password reset email sent."))
      .catch(err => {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      });
  }
});

// 9) Change Email (send verification link)
changeEmailBtn.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().currentUser.sendEmailVerification()
      .then(() => alert("Verification email sent."))
      .catch(err => {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      });
  }
});

// 10) Delete Account
deleteAccountBtn.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (user && confirm("Are you sure you want to delete your account?")) {
    user.delete()
      .then(() => {
        alert("Account deleted.");
        location.reload();
      })
      .catch(err => {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      });
  }
});

// 11) Save & Load (placeholders)
saveBtn.addEventListener("click", () => alert("Save game data clicked."));
loadBtn.addEventListener("click", () => alert("Load game data clicked."));