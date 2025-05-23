document.addEventListener("DOMContentLoaded", () => {
  // 1) Firebase init
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

  // 2) DOM refs
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

  // helper to toggle mem classes
  function applyMembershipView(isMember) {
    console.log("applyMembershipView:", isMember);
    document.querySelectorAll(".memshow")
      .forEach(el => el.style.display = isMember ? "" : "none");
    document.querySelectorAll(".memhide")
      .forEach(el => el.style.display = isMember ? "none" : "");
  }

  // 3) Auth listener
  firebase.auth().onAuthStateChanged(async user => {
    console.log("Auth state changed:", user ? user.email : null);
    if (!user) {
      // signed out
      signedOutView.style.display = "block";
      signedInView.style.display  = "none";
      applyMembershipView(false);
      return;
    }

    // signed in
    signedOutView.style.display = "none";
    signedInView.style.display  = "block";
    userEmailSpan.textContent   = user.email;

    // check membership
    let isMember = false;
    try {
      const doc = await db.collection("membership").doc(user.email).get();
      isMember = doc.exists && doc.data().membership === true;
      console.log("Membership doc exists:", doc.exists, "flag:", isMember);
    } catch (err) {
      console.error("Membership check error:", err);
    }

    applyMembershipView(isMember);
  });

  // 4) Sign In
  signInBtn.addEventListener("click", () => {
    const email = emailInput.value.trim(), pwd = passwordInput.value;
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

  // 5) Sign Up
  signUpBtn.addEventListener("click", () => {
    const email = emailInput.value.trim(), pwd = passwordInput.value;
    firebase.auth().createUserWithEmailAndPassword(email, pwd)
      .then(() => location.reload())
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
    const email = emailInput.value.trim();
    if (!email) return errorMessageEl.textContent = "Please enter your email to reset password.";
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => alert("Password reset email sent."))
      .catch(() => { errorMessageEl.textContent = "There is a network issue, try again later."; });
  });

  // 7) Sign Out
  signOutBtn.addEventListener("click", () => firebase.auth().signOut());

  // 8) Change Password
  changePasswordBtn.addEventListener("click", () => {
    const u = firebase.auth().currentUser;
    if (u) {
      firebase.auth().sendPasswordResetEmail(u.email)
        .then(() => alert("Password reset email sent."))
        .catch(() => { errorMessageEl.textContent = "There is a network issue, try again later."; });
    }
  });

  // 9) Delete Account
  deleteAccountBtn.addEventListener("click", () => {
    const u = firebase.auth().currentUser;
    if (u && confirm("Are you sure?")) {
      u.delete()
       .then(() => location.reload())
       .catch(err => {
         errorMessageEl.textContent = err.message.toLowerCase().includes("network error")
           ? "There is a network issue, try again later."
           : err.message;
       });
    }
  });

  // 10) Save localStorage
  saveBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return alert("Please sign in first.");
    try {
      await db.collection("userdata").doc(u.uid).set({ ...localStorage });
      alert("Game data saved!");
    } catch {
      alert("Failed to save data.");
    }
  });

  // 11) Load localStorage
  loadBtn.addEventListener("click", async () => {
    const u = firebase.auth().currentUser;
    if (!u) return alert("Please sign in first.");
    try {
      const snap = await db.collection("userdata").doc(u.uid).get();
      if (!snap.exists) return alert("No saved data found.");
      localStorage.clear();
      Object.entries(snap.data()).forEach(([k,v]) => localStorage.setItem(k,v));
      alert("Game data loaded!");
      location.reload();
    } catch {
      alert("Failed to load data.");
    }
  });
});