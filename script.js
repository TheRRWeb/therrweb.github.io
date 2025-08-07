// script.js
document.addEventListener("DOMContentLoaded", () => {
  // 0) First-time setup
  if (localStorage.getItem("r-touch") === null) {
    localStorage.setItem("r-touch", "on");
  }

  // 1) Firebase Initialization
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
    // 1.a) Force LOCAL persistence and protect all pages except public ones
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(console.error);

  // Define pages that DO NOT require auth:
  const publicPages = [
    "/",            // if your index is served at root
    "/index.html",
    "/login.html"
  ];

  const currentPath = window.location.pathname;
  // If this page is NOT in publicPages, enforce sign-in
  if (!publicPages.includes(currentPath)) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        // Not signed in → redirect to login page
        window.location.replace("/login.html");
      }
    });
  }
  const db = firebase.firestore();

  // 2) Membership view toggles (memshow/memhide) — unchanged from before
  let currentIsMember = false;
  function applyMembershipView(isMember) {
    document.querySelectorAll(".memshow")
      .forEach(el => el.style.display = isMember ? "block" : "none");
    document.querySelectorAll(".memhide")
      .forEach(el => el.style.display = isMember ? "none" : "block");
  }
  const userMembershipSpan = document.getElementById("user-membership");
  const userFullNameSpan   = document.getElementById("user-fullname");

  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      applyMembershipView(false);
      if (userMembershipSpan) userMembershipSpan.textContent = "";
      if (userFullNameSpan)   userFullNameSpan.textContent   = "";
      return;
    }
    let snap = await db.collection("membership").doc(user.uid).get().catch(() => null);
    if (!snap || !snap.exists) {
      snap = await db.collection("membership").doc(user.email).get().catch(() => null);
    }
    currentIsMember = snap && snap.exists && snap.data().membership === true;
    applyMembershipView(currentIsMember);
    if (userMembershipSpan) {
      userMembershipSpan.textContent = currentIsMember
        ? "You are a Membership User"
        : "";
    }
   // — NEW: show full name in HTML
    if (userFullNameSpan) {
      userFullNameSpan.textContent = user.displayName || "";
    }

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

  const tamperObserver = new MutationObserver(() => applyMembershipView(currentIsMember));
  document.querySelectorAll(".memshow, .memhide")
    .forEach(el => tamperObserver.observe(el, {
      attributes: true,
      attributeFilter: ["style","class"]
    }));

  // 3) Account-page logic
  const emailSigninInput    = document.querySelector(".email-signin");
  const passwordSigninInput = document.querySelector(".password-signin");
  const emailSignupInput    = document.querySelector(".email-signup");
  const passwordSignupInput = document.querySelector(".password-signup");
  const nameSignupInput    = document.querySelector(".name-signup");
  const newsletterCheckbox = document.querySelector(".newsletter-checkbox");

  const signInBtn           = document.querySelector(".sign-in-btn");
  const signUpBtn           = document.querySelector(".sign-up-btn");
  const forgotPasswordBtn   = document.querySelector(".forgot-password-btn");

  const errorLoginMsg       = document.querySelector(".flip-card__front .error-message");
  const errorSignupMsg      = document.querySelector(".flip-card__back .error-message");

  const changePasswordBtn   = document.getElementById("change-password");
  const deleteAccountBtn    = document.getElementById("delete-account");
  const saveBtn             = document.getElementById("save-game-data");
  const loadBtn             = document.getElementById("load-game-data");
  const signOutBtn          = document.getElementById("sign-out");
  const clearLocalBtn       = document.getElementById("clear-local-btn");
  const clearFirestoreBtn   = document.getElementById("clear-firestore-btn");

  if (emailSigninInput && signInBtn && signUpBtn) {
    // Sign In
    signInBtn.addEventListener("click", () => {
      const fullName = nameSignupInput.value.trim();
      const email = emailSigninInput.value.trim();
      const pwd   = passwordSigninInput.value;
      firebase.auth().signInWithEmailAndPassword(email, pwd)
        .catch(err => {
          if (["auth/invalid-email","auth/user-not-found","auth/wrong-password"]
              .includes(err.code)) {
            errorLoginMsg.textContent = "Incorrect email or password.";
          } else if (err.message.toLowerCase().includes("network error")) {
            errorLoginMsg.textContent = "There is a network issue, try again later.";
          } else {
            errorLoginMsg.textContent = err.message;
          }
        });
    });

    signUpBtn.addEventListener("click", () => {
        const fullName = nameSignupInput.value.trim();
        const email    = emailSignupInput.value.trim();
        const pwd      = passwordSignupInput.value;

        firebase.auth().createUserWithEmailAndPassword(email, pwd)
            .then((cred) => {
                // 1) set the Auth displayName
                return cred.user.updateProfile({ displayName: fullName })
                    .then(() => {
                        // 2) save fullName into your userdata doc
                        return db.collection("userdata").doc(cred.user.uid)
                            .set({ fullName: fullName }, { merge: true });
                    });
            })
            .then(async () => {
                // → NETLIFY PROXY: if checked, call our subscribe function
                if (newsletterCheckbox && newsletterCheckbox.checked) {
                    try {
                        const res = await fetch("/.netlify/functions/subscribe", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, fullName })
                        });
                        if (!res.ok) {
                            const errorText = await res.text();
                            console.error("Subscribe proxy failed:", res.status, errorText);
                        }
                    } catch (err) {
                        console.error("Proxy error:", err);
                    }
                }
                alert("Account created!");
                location.reload();
            })
            .catch(err => {
                if (err.code === "auth/email-already-in-use") {
                    errorSignupMsg.textContent = "Email already used.";
                } else if (err.message.toLowerCase().includes("network error")) {
                    errorSignupMsg.textContent = "There is a network issue, try again later.";
                } else {
                    errorSignupMsg.textContent = err.message;
                }
            });
    });

    // Forgot Password
    forgotPasswordBtn.addEventListener("click", () => {
      const email = emailSigninInput.value.trim();
      if (!email) {
        errorLoginMsg.textContent = "Enter your email to reset password.";
        return;
      }
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("Reset email sent."))
        .catch(() => {
          errorLoginMsg.textContent = "Network issue, try again later.";
        });
    });

    // Change Password
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", () => {
        const u = firebase.auth().currentUser;
        if (u) {
          firebase.auth().sendPasswordResetEmail(u.email)
            .then(() => alert("Reset email sent."))
            .catch(() => {
              errorLoginMsg.textContent = "Network issue, try again later.";
            });
        }
      });
    }

    // Delete Account
    if (deleteAccountBtn) {
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
    }

    // Save Game Data
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const u = firebase.auth().currentUser;
        if (!u) return alert("Sign in first.");
        try {
          await db.collection("userdata").doc(u.uid)
            .set(Object.fromEntries(Object.entries(localStorage)), { merge: true });
          alert("Data saved!");
        } catch {
          alert("Save failed, try again.");
        }
      });
    }

    // Load Game Data
    if (loadBtn) {
      loadBtn.addEventListener("click", async () => {
        const u = firebase.auth().currentUser;
        if (!u) return alert("Sign in first.");
        try {
          const snap = await db.collection("userdata").doc(u.uid).get();
          if (!snap.exists) throw new Error();
          localStorage.clear();
          Object.entries(snap.data()).forEach(([k,v]) =>
            localStorage.setItem(k, v)
          );
          alert("Data loaded!"); location.reload();
        } catch {
          alert("Load failed, try again.");
        }
      });
    }

    // Sign Out
    signOutBtn.addEventListener("click", () => {
      firebase.auth().signOut()
        .then(() => location.reload())
        .catch(e => { console.error(e); alert("Sign-out failed."); });
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
  };
  const faviconLink         = document.querySelector("link[rel='icon']");
  const shortcutFaviconLink = document.querySelector("link[rel='shortcut icon']");
  const defaultTitle        = document.title;
  const defaultIcon         = faviconLink?.href || "";

  const PRESETS = {
    none:   { title: defaultTitle, icon: defaultIcon },
    google: {
      title: "Google",
      icon:  "https://pensiontransferspecialist.co.uk/wp-content/uploads/2021/10/Google-Workspace-Logo.png"
    },
    teams: {
      title: "Microsoft Teams",
      icon:  "https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/teams_48x1.svg"
    }
  };

  function applyTheme(theme) {
    document.title = theme.title;
    if (faviconLink)         faviconLink.href         = theme.icon;
    if (shortcutFaviconLink) shortcutFaviconLink.href = theme.icon;
  }

  let savedTheme = {};
  try {
    savedTheme = JSON.parse(localStorage.getItem("siteTheme")) || {};
  } catch {
    savedTheme = {};
  }

  // Apply on load
  if (savedTheme.mode === "custom") {
    applyTheme({ title: savedTheme.title, icon: savedTheme.icon });
  } else if (savedTheme.mode) {
    applyTheme(PRESETS[savedTheme.mode] || PRESETS.none);
  } else {
    applyTheme(PRESETS.none);
  }

  // Wire up each disguise‑mode block
  document.querySelectorAll(".disguise-mode").forEach(block => {
    const radios     = block.querySelectorAll("input[name='siteTheme']");
    const customOpts = block.querySelector(".custom-options");
    const titleIn    = block.querySelector(".custom-title-input");
    const iconIn     = block.querySelector(".custom-icon-input");

    // Initialize UI
    if (savedTheme.mode) {
      const sel = block.querySelector(
        `input[name="siteTheme"][value="${savedTheme.mode}"]`
      );
      if (sel) sel.checked = true;
      customOpts.style.display = (savedTheme.mode === "custom") ? "block" : "none";
      if (savedTheme.mode === "custom") titleIn.value = savedTheme.title;
    }

    // Radio change handler
    radios.forEach(radio => radio.addEventListener("change", () => {
      const mode = radio.value;
      if (mode === "custom") {
        customOpts.style.display = "block";
        savedTheme = { mode:"custom", title: defaultTitle, icon: defaultIcon };
      } else {
        customOpts.style.display = "none";
        applyTheme(PRESETS[mode] || PRESETS.none);
        savedTheme = { mode };
      }
      localStorage.setItem("siteTheme", JSON.stringify(savedTheme));
    }));

    // Custom title live‑update
    titleIn.addEventListener("input", () => {
      if (block.querySelector('input[name="siteTheme"]:checked').value === "custom") {
        savedTheme.title = titleIn.value || defaultTitle;
        applyTheme({ title: savedTheme.title, icon: savedTheme.icon });
        localStorage.setItem("siteTheme", JSON.stringify(savedTheme));
      }
    });

    // Custom icon file handler
    iconIn.addEventListener("change", () => {
      if (
        block.querySelector('input[name="siteTheme"]:checked').value === "custom" &&
        iconIn.files.length
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          savedTheme.icon = reader.result;
          applyTheme({ title: savedTheme.title, icon: savedTheme.icon });
          localStorage.setItem("siteTheme", JSON.stringify(savedTheme));
        };
        reader.readAsDataURL(iconIn.files[0]);
      }
    });
  });
    // — R Touch toggles (multiple possible)
  const rtToggles = document.querySelectorAll(".r-touch-toggle");
  if (rtToggles.length) {
    // sync UI from storage
    function syncAllCheckboxes() {
      const on = localStorage.getItem("r-touch") === "on";
      rtToggles.forEach(cb => cb.checked = on);
    }
    // init state
    syncAllCheckboxes();

    // when any checkbox changes
    rtToggles.forEach(cb => {
      cb.addEventListener("change", () => {
        localStorage.setItem("r-touch", cb.checked ? "on" : "off");
        window.dispatchEvent(new Event("r-touch-changed"));
      });
    });

    // reflect toolbar‑side toggles back here
    window.addEventListener("r-touch-changed", syncAllCheckboxes);
  }

  // — Toolbar‑pos radios (multiple possible blocks)
  const toolbarRadios = document.querySelectorAll(".toolbar-selector input[name='toolbar-pos']");
  if (toolbarRadios.length) {
    function syncAllRadios() {
      const saved = localStorage.getItem("toolbar-pos") || "right";
      toolbarRadios.forEach(r => r.checked = (r.value === saved));
    }
    // init state
    syncAllRadios();

    // when any radio changes
    toolbarRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        localStorage.setItem("toolbar-pos", radio.value);
        window.dispatchEvent(new Event("toolbar-pos-changed"));
      });
    });

    // you can also re‑sync on change if needed:
    window.addEventListener("toolbar-pos-changed", syncAllRadios);
  }
}); // end DOMContentLoaded

function myFunction() {
    var x = document.getElementById("Navbar");
    if (x.className === "navbar") {
      x.className += " responsive";
    } else {
      x.className = "navbar";
    }
  }
