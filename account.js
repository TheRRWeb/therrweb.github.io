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

// 2) Initialize Firestore
const db = firebase.firestore();

// 3) Grab your elements
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
const deleteAccountBtn  = document.getElementById("delete-account");
const saveBtn           = document.getElementById("save-game-data");
const loadBtn           = document.getElementById("load-game-data");

// 4) Auth state listener
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

// 5) Sign In
signInBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;
  firebase.auth().signInWithEmailAndPassword(email, pwd)
    .catch(err => {
      if (
        err.code === "auth/invalid-email" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessageEl.textContent = "Incorrect email or password.";
      } else if (err.message.toLowerCase().includes("network error")) {
        errorMessageEl.textContent = "There is a network issue, try again later.";
      } else {
        errorMessageEl.textContent = err.message;
      }
    });
});

// 6) Sign Up
signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const pwd   = passwordInput.value;
  firebase.auth().createUserWithEmailAndPassword(email, pwd)
    .then(() => {
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

// 7) Forgot Password
forgotPasswordBtn.addEventListener("click", () => {
  const email = emailInput.value;
  if (!email) {
    errorMessageEl.textContent = "Please enter your email to reset password.";
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent."))
    .catch(() => {
      errorMessageEl.textContent = "There is a network issue, try again later.";
    });
});

// 8) Sign Out
signOutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// 9) Change Password (send reset link)
changePasswordBtn.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().sendPasswordResetEmail(user.email)
      .then(() => alert("Password reset email sent."))
      .catch(() => {
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
        if (err.message.toLowerCase().includes("network error")) {
          errorMessageEl.textContent = "There is a network issue, try again later.";
        } else {
          errorMessageEl.textContent = err.message;
        }
      });
  }
});

// 11) Save localStorage → Firestore
saveBtn.addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Please sign in first.");
    return;
  }
  const data = { ...localStorage };
  try {
    await db.collection("userdata").doc(user.uid).set(data);
    alert("Game data saved to Firestore!");
  } catch (e) {
    console.error(e);
    alert("Failed to save data. Try again.");
  }
});

// 12) Load Firestore → localStorage
loadBtn.addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Please sign in first.");
    return;
  }
  try {
    const snap = await db.collection("userdata").doc(user.uid).get();
    if (!snap.exists) {
      alert("No saved data found.");
      return;
    }
    localStorage.clear();
    const obj = snap.data();
    for (let key in obj) {
      localStorage.setItem(key, obj[key]);
    }
    alert("Game data loaded from Firestore!");
    location.reload();
  } catch (e) {
    console.error(e);
    alert("Failed to load data. Try again.");
  }
});