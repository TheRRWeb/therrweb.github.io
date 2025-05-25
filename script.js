// script.js
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 0) Firebase Initialization
  // -----------------------------
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

  // ------------------------------------------------
  // 1) Site‑wide: membership toggles (memshow/hide)
  // ------------------------------------------------
  let currentIsMember = false;
  function applyMembershipView(isMember) {
    document.querySelectorAll(".memshow")
      .forEach(el => el.style.display = isMember ? "block" : "none");
    document.querySelectorAll(".memhide")
      .forEach(el => el.style.display = isMember ? "none" : "block");
  }

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      applyMembershipView(false);
      return;
    }
    // check membership flag in Firestore
    try {
      const snap = await db.collection("membership").doc(user.email).get();
      currentIsMember = snap.exists && snap.data().membership === true;
    } catch {
      currentIsMember = false;
    }
    applyMembershipView(currentIsMember);
  });

  // Prevent manual tampering
  const observer = new MutationObserver(() => applyMembershipView(currentIsMember));
  document.querySelectorAll(".memshow, .memhide").forEach(el =>
    observer.observe(el, { attributes: true, attributeFilter: ["style","class"] })
  );

  // -------------------------------
  // 2) Account‑page logic (guarded)
  // -------------------------------
  const emailInput        = document.getElementById("email");
  const passwordInput     = document.getElementById("password");
  const signInBtn         = document.getElementById("sign-in-btn");
  const signUpBtn         = document.getElementById("sign-up-btn");
  const forgotPasswordBtn = document.getElementById("forgot-password-btn");
  const errorMessageEl    = document.getElementById("error-message");
  const signedOutView     = document.getElementById("auth-container");
  const signedInView      = document.getElementById("user-controls");
  const userEmailSpan     = document.getElementById("user-email");
  const userMembershipSpan= document.getElementById("user-membership");
  const userUidSpan       = document.getElementById("user-uid");
  const signOutBtn        = document.getElementById("sign-out");
  const changePasswordBtn = document.getElementById("change-password");
  const deleteAccountBtn  = document.getElementById("delete-account");
  const saveBtn           = document.getElementById("save-game-data");
  const loadBtn           = document.getElementById("load-game-data");
  const clearLocalBtn     = document.getElementById("clear-local-btn");
  const clearFirestoreBtn = document.getElementById("clear-firestore-btn");

  // Only run this block if we're on account.html
  if (emailInput && signInBtn && signUpBtn) {
    // Show/hide the signed‑in vs signed‑out views
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        signedOutView.style.display = "block";
        signedInView .style.display = "none";
        userEmailSpan.textContent      = "";
        userMembershipSpan.textContent = "";
        userUidSpan.textContent        = "";
      } else {
        signedOutView.style.display = "none";
        signedInView .style.display = "block";
        userEmailSpan.textContent   = user.email;
        userUidSpan.textContent     = user.uid;
      }
    });

    // Sign In
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

    // Sign Up
    signUpBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      const pwd   = passwordInput.value;
      firebase.auth().createUserWithEmailAndPassword(email, pwd)
        .then(() => { alert("Account created!"); location.reload(); })
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

    // Forgot Password
    forgotPasswordBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      if (!email) {
        errorMessageEl.textContent = "Enter your email to reset password.";
        return;
      }
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("Reset email sent."))
        .catch(() => {
          errorMessageEl.textContent = "Network issue, try again later.";
        });
    });

    // Change Password (Reset Link)
    changePasswordBtn.addEventListener("click", () => {
      const u = firebase.auth().currentUser;
      if (u) {
        firebase.auth().sendPasswordResetEmail(u.email)
          .then(() => alert("Reset email sent."))
          .catch(() => {
            errorMessageEl.textContent = "Network issue, try again later.";
          });
      }
    });

    // Delete Account + Firestore Cleanup
    deleteAccountBtn.addEventListener("click", async () => {
      const u = firebase.auth().currentUser;
      if (!u || !confirm("Delete account AND all your cloud data?")) return;
      try {
        await db.collection("userdata").doc(u.uid).delete();
        await db.collection("membership").doc(u.email).delete().catch(()=>{});
        await u.delete();
        alert("Account & data deleted.");
        location.reload();
      } catch (e) {
        console.error(e);
        alert("Error deleting: " + e.message);
      }
    });

    // Save LocalStorage → Firestore
    saveBtn.addEventListener("click", async () => {
      const u = firebase.auth().currentUser;
      if (!u) return alert("Sign in first.");
      try {
        await db.collection("userdata").doc(u.uid).set({ ...localStorage });
        alert("Data saved!");
      } catch {
        alert("Save failed, try again.");
      }
    });

    // Load Firestore → LocalStorage
    loadBtn.addEventListener("click", async () => {
      const u = firebase.auth().currentUser;
      if (!u) return alert("Sign in first.");
      try {
        const snap = await db.collection("userdata").doc(u.uid).get();
        if (!snap.exists) return alert("No data found.");
        localStorage.clear();
        Object.entries(snap.data()).forEach(([k,v]) => localStorage.setItem(k, v));
        alert("Data loaded!"); location.reload();
      } catch {
        alert("Load failed, try again.");
      }
    });

    // Sign Out
    signOutBtn.addEventListener("click", () => {
      firebase.auth().signOut()
        .then(() => location.reload())
        .catch(e => { console.error(e); alert("Sign‑out failed."); });
    });

    // Clear Local Storage
    clearLocalBtn.addEventListener("click", () => {
      if (confirm("Clear all localStorage?")) { localStorage.clear(); alert("Cleared."); }
    });

    // Clear Firestore Data
    clearFirestoreBtn.addEventListener("click", async () => {
      const u = firebase.auth().currentUser;
      if (!u) return alert("Sign in first.");
      if (!confirm("Delete cloud data?")) return;
      try {
        await db.collection("userdata").doc(u.uid).delete();
        alert("Cloud data deleted.");
      } catch {
        alert("Delete failed.");
      }
    });
  }
});
function myFunction() {
  var x = document.getElementById("Navbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}