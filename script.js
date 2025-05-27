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
  const userMembershipSpan = document.getElementById("user-membership");

  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      applyMembershipView(false);
      if (userMembershipSpan) userMembershipSpan.textContent = "";
      return;
    }
    // check membership by UID then email
    let snap = await db.collection("membership").doc(user.uid).get().catch(() => null);
    if (!snap || !snap.exists) {
      snap = await db.collection("membership").doc(user.email).get().catch(() => null);
    }
    currentIsMember = snap && snap.exists && snap.data().membership === true;

    applyMembershipView(currentIsMember);
    if (userMembershipSpan) {
      userMembershipSpan.textContent = currentIsMember ? "Membership" : "";
    }

    // toggle account‑page views
    const signedOutView = document.getElementById("auth-container");
    const signedInView  = document.getElementById("user-controls");
    const userEmailSpan = document.getElementById("user-email");
    const userUidSpan   = document.getElementById("user-uid");
    if (signedOutView && signedInView) {
      signedOutView.style.display = user ? "none" : "block";
      signedInView .style.display = user ? "block" : "none";
    }
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (userUidSpan)   userUidSpan.textContent   = user.uid;
  });

  // prevent DOM‑tampering
  const tamperObserver = new MutationObserver(() => applyMembershipView(currentIsMember));
  document.querySelectorAll(".memshow, .memhide")
    .forEach(el => tamperObserver.observe(el, {
      attributes: true,
      attributeFilter: ["style","class"]
    }));

  // -----------------------------------
  // 2) Account‑page only logic (guarded)
  // -----------------------------------
  const emailInput        = document.getElementById("email");
  const passwordInput     = document.getElementById("password");
  const signInBtn         = document.getElementById("sign-in-btn");
  const signUpBtn         = document.getElementById("sign-up-btn");
  const forgotPasswordBtn = document.getElementById("forgot-password-btn");
  const errorMessageEl    = document.getElementById("error-message");
  const changePasswordBtn = document.getElementById("change-password");
  const deleteAccountBtn  = document.getElementById("delete-account");
  const saveBtn           = document.getElementById("save-game-data");
  const loadBtn           = document.getElementById("load-game-data");
  const signOutBtn        = document.getElementById("sign-out");
  const clearLocalBtn     = document.getElementById("clear-local-btn");
  const clearFirestoreBtn = document.getElementById("clear-firestore-btn");

  if (emailInput && signInBtn && signUpBtn) {
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

    // Change Password (reset link)
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

    // Delete Account + cleanup
    deleteAccountBtn.addEventListener("click", async () => {
      const u = firebase.auth().currentUser;
      if (!u || !confirm("Delete account AND all your cloud data?")) return;
      try {
        await db.collection("userdata").doc(u.uid).delete();
        await db.collection("membership").doc(u.uid).delete().catch(() => {});
        await u.delete();
        alert("Deleted account & data."); location.reload();
      } catch (e) {
        console.error(e);
        alert("Error deleting: " + e.message);
      }
    });

    // Save → Firestore
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

    // Load ← Firestore
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

    // Clear LocalStorage
    clearLocalBtn.addEventListener("click", () => {
      if (confirm("Clear all localStorage?")) { localStorage.clear(); alert("Cleared."); }
    });

    // Clear Firestore data
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

  function myFunction() {
    var x = document.getElementById("Navbar");
    if (x.className === "navbar") {
      x.className += " responsive";
    } else {
      x.className = "navbar";
    }
  }

  // ──────────────────────────────────────────────────
  // 4) Title & Favicon Selector (clean)
  // ──────────────────────────────────────────────────

  // 4.1) Grab favicon links and defaults
  const faviconLink         = document.getElementById("favicon");
  const shortcutFaviconLink = document.querySelector("link[rel='shortcut icon']");
  const defaultTitle        = document.title;
  const defaultIcon         = faviconLink ? faviconLink.href : "";

  // 4.2) Bail if no favicon link
  if (faviconLink) {
    // 4.3) Presets (to change icons, edit these URLs)
    const PRESETS = {
      none:   { title: defaultTitle, icon: defaultIcon },
      google: {
        title: "Google",
        icon:  "https://www.gstatic.com/classroom/icongrayscale/teacher/48dp.png"
      },
      teams: {
        title: "Microsoft Teams",
        icon:  "https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/teams_48x1.svg"
      }
    };

    // 4.4) applyTheme helper updates both links
    function applyTheme(theme) {
      document.title = theme.title;
      faviconLink.href = theme.icon;
      if (shortcutFaviconLink) shortcutFaviconLink.href = theme.icon;
    }

    // 4.5) Load saved or default
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("siteTheme")) || {}; }
    catch(_) {}
    if (saved.mode) {
      if (saved.mode === "custom") {
        applyTheme({ title: saved.title||defaultTitle, icon: saved.icon||defaultIcon });
      } else {
        applyTheme(PRESETS[saved.mode]||PRESETS.none);
      }
    } else {
      // first visit: preselect none & restore defaults
      const noneRadio = document.querySelector('input[name="siteTheme"][value="none"]');
      if (noneRadio) noneRadio.checked = true;
      applyTheme(PRESETS.none);
    }

    // 4.6) Wire up controls if present
    const radios        = document.querySelectorAll('input[name="siteTheme"]');
    const customOptions = document.getElementById("custom-options");
    const customTitleIn = document.getElementById("custom-title-input");
    const customIconIn  = document.getElementById("custom-icon-input");

    if (radios.length && customOptions && customTitleIn && customIconIn) {
      // radio change
      radios.forEach(radio => radio.addEventListener("change", () => {
        const mode = radio.value;
        if (mode === "custom") {
          customOptions.style.display = "block";
          saved = { mode:"custom", title: defaultTitle, icon: defaultIcon };
          localStorage.setItem("siteTheme", JSON.stringify(saved));
        } else {
          customOptions.style.display = "none";
          applyTheme(PRESETS[mode]||PRESETS.none);
          localStorage.setItem("siteTheme", JSON.stringify({ mode }));
        }
      }));

      // custom title live update
      customTitleIn.addEventListener("input", () => {
        if (document.querySelector('input[name="siteTheme"]:checked').value === "custom") {
          const title = customTitleIn.value || defaultTitle;
          applyTheme({ title, icon: saved.icon||defaultIcon });
          saved = { mode:"custom", title, icon: saved.icon||defaultIcon };
          localStorage.setItem("siteTheme", JSON.stringify(saved));
        }
      });

      // custom favicon file handler
      customIconIn.addEventListener("change", () => {
        if (
          document.querySelector('input[name="siteTheme"]:checked').value === "custom" &&
          customIconIn.files.length
        ) {
          const reader = new FileReader();
          reader.onload = () => {
            const iconData = reader.result;
            const title = customTitleIn.value || defaultTitle;
            applyTheme({ title, icon: iconData });
            saved = { mode:"custom", title, icon: iconData };
            localStorage.setItem("siteTheme", JSON.stringify(saved));
          };
          reader.readAsDataURL(customIconIn.files[0]);
        }
      });
    }
  }
 const rtToggle = document.getElementById("r-touch-toggle");
  if (rtToggle) {
    // init from localStorage
    const isOn = localStorage.getItem("r-touch")==="on";
    rtToggle.checked = isOn;
    rtToggle.addEventListener("change", () => {
      if (rtToggle.checked) localStorage.setItem("r-touch","on");
      else                  localStorage.removeItem("r-touch");
      window.dispatchEvent(new Event("r-touch-changed"));
    });
  }
  const posSelect = document.getElementById("toolbar-pos-select");
  if (posSelect) {
    // Initialize from localStorage
    posSelect.value = localStorage.getItem("toolbar-pos") || "right";

    posSelect.addEventListener("change", () => {
      localStorage.setItem("toolbar-pos", posSelect.value);
      // inform toolbar script if it’s loaded
      window.dispatchEvent(new Event("toolbar-pos-changed"));
    });
  }
}); // end DOMContentLoaded
