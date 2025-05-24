document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------
  // 1) Firebase Initialization (v8)
  // -----------------------------------
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

  // -----------------------------------
  // 2) Element References
  // -----------------------------------
  const emailInput         = document.getElementById("email");
  const passwordInput      = document.getElementById("password");
  const signInBtn          = document.getElementById("sign-in-btn");
  const signUpBtn          = document.getElementById("sign-up-btn");
  const forgotPasswordBtn  = document.getElementById("forgot-password-btn");
  const errorMessageEl     = document.getElementById("error-message");
  const signedOutView      = document.getElementById("auth-container");
  const signedInView       = document.getElementById("user-controls");
  const userEmailSpan      = document.getElementById("user-email");
  const userMembershipSpan = document.getElementById("user-membership");
  const userUidSpan        = document.getElementById("user-uid");
  const signOutBtn         = document.getElementById("sign-out");
  const changePasswordBtn  = document.getElementById("change-password");
  const deleteAccountBtn   = document.getElementById("delete-account");
  const saveBtn            = document.getElementById("save-game-data");
  const loadBtn            = document.getElementById("load-game-data");
  const clearLocalBtn      = document.getElementById("clear-local-btn");
  const clearFirestoreBtn  = document.getElementById("clear-firestore-btn");

  // -----------------------------------
  // 3) Membership View Toggle
  // -----------------------------------
  let currentIsMember = false;
  function applyMembershipView(isMember) {
    document.querySelectorAll(".memshow")
      .forEach(el => el.style.display = isMember ? "block" : "none");
    document.querySelectorAll(".memhide")
      .forEach(el => el.style.display = isMember ? "none" : "block");
  }

  // -----------------------------------
  // 4) Auth State Listener
  // -----------------------------------
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      signedOutView.style.display  = "block";
      signedInView.style.display   = "none";
      userEmailSpan.textContent      = "";
      userMembershipSpan.textContent = "";
      userUidSpan.textContent        = "";
      applyMembershipView(false);
      return;
    }

    signedOutView.style.display = "none";
    signedInView.style.display  = "block";
    userEmailSpan.textContent   = user.email;
    userUidSpan.textContent     = user.uid;

    try {
      const docSnap = await db.collection("membership").doc(user.email).get();
      currentIsMember = docSnap.exists && docSnap.data().membership === true;
    } catch {
      currentIsMember = false;
    }
    userMembershipSpan.textContent = currentIsMember ? "Membership" : "";
    applyMembershipView(currentIsMember);
  });

  // -----------------------------------
  // 5) MutationObserver to enforce memshow/memhide
  // -----------------------------------
  const observer = new MutationObserver(() => {
    applyMembershipView(currentIsMember);
  });
  function observeToggles() {
    document.querySelectorAll(".memshow, .memhide")
      .forEach(el =>
        observer.observe(el, { attributes: true, attributeFilter: ["style","class"] })
      );
  }
  observeToggles();

  // -----------------------------------
  // 6) Sign In Handler
  // -----------------------------------
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

  // -----------------------------------
  // 7) Sign Up Handler
  // -----------------------------------
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

  // -----------------------------------
  // 8) Forgot Password Handler
  // -----------------------------------
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

  // -----------------------------------
  // 9) Change Password (reset link)
  // -----------------------------------
  changePasswordBtn.addEventListener("click", () => {
    const u = firebase.auth().currentUser;
    if (u) {
      firebase.auth().sendPasswordResetEmail(u.email)
        .then(() => alert("Password reset email sent."))
        .catch(() => {
          errorMessageEl.textContent = "There is a network issue, try again later.";
        });
    }
  });

  // -----------------------------------
  // 10) Delete Account + Firestore Cleanup
  // -----------------------------------
  deleteAccountBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return;
    if (!confirm("Really delete your account AND all your cloud‑stored data?")) return;
    try {
      await db.collection("userdata").doc(u.uid).delete();
      await db.collection("membership").doc(u.email).delete().catch(() => {});
      await u.delete();
      alert("Your account and all associated cloud data have been deleted.");
      location.reload();
    } catch (err) {
      console.error("Error deleting account or data:", err);
      alert("Failed to delete account or data: " + err.message);
    }
  });

  // -----------------------------------
  // 11) Save LocalStorage → Firestore
  // -----------------------------------
  saveBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return alert("Please sign in first.");
    try {
      await db.collection("userdata").doc(u.uid).set({ ...localStorage });
      alert("Game data saved to Firestore!");
    } catch {
      alert("Failed to save data. Try again.");
    }
  });

  // -----------------------------------
  // 12) Load Firestore → LocalStorage
  // -----------------------------------
  loadBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return alert("Please sign in first.");
    try {
      const snap = await db.collection("userdata").doc(u.uid).get();
      if (!snap.exists) return alert("No saved data found.");
      localStorage.clear();
      Object.entries(snap.data()).forEach(([k, v]) => localStorage.setItem(k, v));
      alert("Game data loaded from Firestore!");
      location.reload();
    } catch {
      alert("Failed to load data. Try again.");
    }
  });

  // -----------------------------------
  // 13) Sign Out Handler
  // -----------------------------------
  signOutBtn.addEventListener("click", () => {
    firebase.auth().signOut()
      .then(() => location.reload())
      .catch(err => {
        console.error("Sign‑out error:", err);
        alert("Failed to sign out. Try again.");
      });
  });

  // -----------------------------------
  // 14) Clear Local Storage Button
  // -----------------------------------
  clearLocalBtn.addEventListener("click", () => {
    if (confirm("Clear all localStorage data?")) {
      localStorage.clear();
      alert("Local storage cleared.");
    }
  });

  // -----------------------------------
  // 15) Clear Firestore Data Button
  // -----------------------------------
  clearFirestoreBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return alert("Sign in first to clear cloud data.");
    if (!confirm("Delete your saved game data from the cloud?")) return;
    try {
      await db.collection("userdata").doc(u.uid).delete();
      alert("Cloud data cleared.");
    } catch {
      alert("Failed to clear cloud data.");
    }
  });
});