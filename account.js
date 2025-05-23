document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // 1) Firebase Initialization
  // ---------------------------
  const firebaseConfig = {
    apiKey: "AIzaSyB1OXqvU6bi9cp-aPs6AGNnCaTGwHtkuUs",
    authDomain: "therrweb.firebaseapp.com",
    projectId: "therrweb",
    storageBucket: "therrweb.firebasestorage.app",
    messagingSenderId: "77162554401",
    appId: "1:77162554401:web:4462bfcbbee40167b9af60",
    measurementId: "G-WC9WXR0CY5"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // ---------------------------
  // 2) Element References
  // ---------------------------
  const emailInput         = document.getElementById("email");
  const passwordInput      = document.getElementById("password");
  const signInBtn          = document.getElementById("sign-in-btn");
  const signUpBtn          = document.getElementById("sign-up-btn");
  const forgotPasswordBtn  = document.getElementById("forgot-password-btn");
  const errorMessageEl     = document.getElementById("error-message");
  const signedOutView      = document.getElementById("auth-container");
  const signedInView       = document.getElementById("user-controls");
  const userEmailSpan      = document.getElementById("user-email");
  const signOutBtn         = document.getElementById("sign-out");
  const changePasswordBtn  = document.getElementById("change-password");
  const deleteAccountBtn   = document.getElementById("delete-account");
  const saveBtn            = document.getElementById("save-game-data");
  const loadBtn            = document.getElementById("load-game-data");

  // ---------------------------
  // 3) Auth State Listener
  // ---------------------------
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      // Signed out: hide everything
      signedOutView.style.display  = "block";
      signedInView.style.display   = "none";
      document.querySelectorAll(".memshow").forEach(el => el.style.display = "none");
      document.querySelectorAll(".memhide").forEach(el => el.style.display = "none");
      return;
    }

    // Signed in: show account UI
    signedOutView.style.display = "none";
    signedInView.style.display  = "block";
    userEmailSpan.textContent   = user.email;

    // Check membership by email in "membership" collection
    let isMember = false;
    try {
      const memberDoc = await db.collection("membership").doc(user.email).get();
      isMember = memberDoc.exists && memberDoc.data().membership === true;
    } catch (e) {
      console.error("Error checking membership:", e);
    }

    // Toggle memshow/memhide elements
    document.querySelectorAll(".memshow")
      .forEach(el => el.style.display = isMember ? "" : "none");
    document.querySelectorAll(".memhide")
      .forEach(el => el.style.display = isMember ? "none" : "");

    // Protect against DevTools toggling
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".memshow")
        .forEach(el => el.style.display = isMember ? "" : "none");
      document.querySelectorAll(".memhide")
        .forEach(el => el.style.display = isMember ? "none" : "");
    });
    document.querySelectorAll(".memshow, .memhide")
      .forEach(el => observer.observe(el, { attributes: true, attributeFilter: ["style", "class"] }));
  });

  // ---------------------------
  // 4) Sign In
  // ---------------------------
  signInBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const pwd   = passwordInput.value;
    firebase.auth().signInWithEmailAndPassword(email, pwd)
      .catch(err => {
        if (["auth/invalid-email","auth/user-not-found","auth/wrong-password"].includes(err.code)) {
          errorMessageEl.textContent = "Incorrect email or password.";
        } else if (err.message.toLowerCase().includes("network error")) {
          errorMessageEl.textContent = "There is a network issue, try again later.";
        } else {
          errorMessageEl.textContent = err.message;
        }
      });
  });

  // ---------------------------
  // 5) Sign Up
  // ---------------------------
  signUpBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const pwd   = passwordInput.value;
    firebase.auth().createUserWithEmailAndPassword(email, pwd)
      .then(() => {
        alert("Account successfully created!");
        location.reload();
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

  // ---------------------------
  // 6) Forgot Password
  // ---------------------------
  forgotPasswordBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
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

  // ---------------------------
  // 7) Sign Out
  // ---------------------------
  signOutBtn.addEventListener("click", () => {
    firebase.auth().signOut();
  });

  // ---------------------------
  // 8) Change Password (reset link)
  // ---------------------------
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

  // ---------------------------
  // 9) Delete Account
  // ---------------------------
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

  // ---------------------------
  // 10) Save localStorage → Firestore
  // ---------------------------
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

  // ---------------------------
  // 11) Load Firestore → localStorage
  // ---------------------------
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
});