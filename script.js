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
    "/account/login.html"
  ];

  const currentPath = window.location.pathname;
  // If this page is NOT in publicPages, enforce sign-in
  if (!publicPages.includes(currentPath)) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        // preserve where the user wanted to go
        const target = window.location.pathname + window.location.search + window.location.hash;
        const redirectUrl = "/account/login.html?redirect=" + encodeURIComponent(target);
        window.location.replace(redirectUrl);
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

  // ---------- Unified auth handlers (replaces previous onAuthStateChanged) ----------
  async function handleSignedIn(user) {
    try {
      // membership check (same logic you had)
      let snap = await db.collection("membership").doc(user.uid).get().catch(() => null);
      if (!snap || !snap.exists) {
        snap = await db.collection("membership").doc(user.email).get().catch(() => null);
      }
      currentIsMember = snap && snap.exists && snap.data().membership === true;
      applyMembershipView(currentIsMember);
      if (userMembershipSpan) {
        userMembershipSpan.textContent = currentIsMember ? "You are a Membership User" : "";
      }

      // show full name and signed-in controls
      if (userFullNameSpan) userFullNameSpan.textContent = user.displayName || "";
      const signedOutView = document.getElementById("auth-container");
      const signedInView  = document.getElementById("user-controls");
      const userEmailSpan = document.getElementById("user-email");
      const userUidSpan   = document.getElementById("user-uid");
      if (signedOutView && signedInView) {
        signedOutView.style.display = "none";
        signedInView.style.display  = "block";
      }
      if (userEmailSpan) userEmailSpan.textContent = user.email;
      if (userUidSpan)   userUidSpan.textContent   = user.uid;
    } catch (err) {
      console.error("handleSignedIn error:", err);
      // fallback to signed out UI on error (no redirect here)
      handleSignedOut();
    }
  }

  function handleSignedOut() {
    currentIsMember = false;
    applyMembershipView(false);
    if (userMembershipSpan) userMembershipSpan.textContent = "";
    if (userFullNameSpan)   userFullNameSpan.textContent   = "";

    const signedOutView = document.getElementById("auth-container");
    const signedInView  = document.getElementById("user-controls");
    if (signedOutView && signedInView) {
      signedOutView.style.display = "block";
      signedInView.style.display  = "none";
    }

    // NOTE: Redirecting is handled by the uncommented protection block above,
    // so we do NOT redirect here to avoid duplicate redirects/flicker.
  }

  // Call immediately if currentUser is available (avoids flicker)
  const immediateUser = firebase.auth().currentUser;
  if (immediateUser) {
    handleSignedIn(immediateUser);
  } else {
    // show signed-out placeholder until onAuthStateChanged fires
    handleSignedOut();
  }

  // ------------ auth state handling (paste in place of existing onAuthStateChanged) ------------
firebase.auth().onAuthStateChanged(async (user) => {
  // If no user, behave as signed out
  if (!user) {
    handleSignedOut();
    return;
  }

  // Ensure we have the freshest user info (updates emailVerified)
  try {
    await user.reload();
  } catch (e) {
    console.warn("user.reload() failed:", e);
  }

  // If user exists but is NOT verified, decide what to do:
  const justSignedUp = sessionStorage.getItem("rr_just_signed_up") === "1";

  if (!user.emailVerified) {
    // If the user just signed up in this tab (short window), allow staying signed in
    // so the verification UI/polling can run.
    if (justSignedUp) {
      // let the normal signed-in flow continue (show verify UI etc.)
      await handleSignedIn(user);
      return;
    }

    // Otherwise (not just-signed-up), prevent auto sign-in: sign out immediately
    // so the user must either verify or sign in consciously.
    try {
      await firebase.auth().signOut();
    } catch (e) {
      console.error("Auto sign-out failed:", e);
    }
    // ensure UI shows signed-out state
    handleSignedOut();
    return;
  }

  // user is verified → normal flow
  await handleSignedIn(user);
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

  // Sign-in & Sign-up listeners (only attach when sign-in form exists)
  if (emailSigninInput && signInBtn && signUpBtn) {
    /* ---------------- SIGN IN handler ---------------- */
signInBtn.removeEventListener && signInBtn.removeEventListener("click", null);
signInBtn.addEventListener("click", async () => {
  const email = emailSigninInput.value.trim();
  const pwd   = passwordSigninInput.value;
  errorLoginMsg.textContent = "";

  try {
    // Attempt sign-in
    const cred = await firebase.auth().signInWithEmailAndPassword(email, pwd);
    const user = cred.user;

    // Force fresh state (important for emailVerified)
    await user.reload();

    if (!user.emailVerified) {
      // User exists but is unverified.
      // Send verification link (best-effort), allow a short window for the page to keep user signed-in
      try { await user.sendEmailVerification(); } catch (e) { console.error("sendEmailVerification:", e); }

      // Mark a short session flag so onAuthStateChanged won't immediately sign them out (10s)
      sessionStorage.setItem("rr_just_signed_up", "1");
      setTimeout(() => sessionStorage.removeItem("rr_just_signed_up"), 10000);

      // Show verification UI, hide wrapper
      const wrapper = document.querySelector(".wrapper");
      if (wrapper) wrapper.style.display = "none";
      const ev = document.getElementById("email-verify");
      if (ev) ev.style.display = "block";
      const evEmail = document.getElementById("ev-email");
      if (evEmail) evEmail.textContent = email;
      const evStatus = document.getElementById("ev-status");
      if (evStatus) evStatus.textContent = "Verification email sent. Check your inbox.";

      // Start the verify flow (resend/cancel/poll) — helper defined below
      setupVerifyFlow(user);
      return; // block normal app access until verified
    }

    // Verified user — proceed to target page
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      try { window.location.replace(decodeURIComponent(redirect)); }
      catch (e) { window.location.href = "/"; }
    } else {
      window.location.href = "/";
    }

  } catch (err) {
    console.error("Sign in error:", err);
    if (["auth/invalid-email","auth/user-not-found","auth/wrong-password"].includes(err.code)) {
      errorLoginMsg.textContent = "Incorrect email or password.";
    } else if (err.code === "auth/user-disabled") {
      errorLoginMsg.textContent = "Account disabled. Contact support.";
    } else if (err.message && err.message.toLowerCase().includes("network error")) {
      errorLoginMsg.textContent = "There is a network issue, try again later.";
    } else {
      errorLoginMsg.textContent = err.message || "Sign-in failed.";
    }
  }
});


/* ---------------- SIGN UP handler ---------------- */
signUpBtn.removeEventListener && signUpBtn.removeEventListener("click", null);
signUpBtn.addEventListener("click", async () => {
  const fullName = (nameSignupInput && nameSignupInput.value || "").trim();
  const email    = (emailSignupInput && emailSignupInput.value || "").trim();
  const pwd      = (passwordSignupInput && passwordSignupInput.value || "");
  errorSignupMsg.textContent = "";

  if (!fullName || !email || !pwd) {
    errorSignupMsg.textContent = "Enter name, email and password.";
    return;
  }

  try {
    // Create account (this signs them in)
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pwd);

    // Set displayName and save userdata
    await cred.user.updateProfile({ displayName: fullName });
    await db.collection("userdata").doc(cred.user.uid)
      .set({ fullName: fullName }, { merge: true });

    // Optional: call your Netlify subscribe proxy if checked (keep as you had)
    if (newsletterCheckbox && newsletterCheckbox.checked) {
      try {
        const res = await fetch("/.netlify/functions/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName })
        });
        if (!res.ok) {
          const txt = await res.text().catch(()=>"");
          console.error("Subscribe proxy failed:", res.status, txt);
        }
      } catch (e) {
        console.error("Subscribe proxy error:", e);
      }
    }

    // Send verification email (best-effort)
    try { await cred.user.sendEmailVerification(); } catch (e) { console.error("sendEmailVerification:", e); }

    // Allow this tab a short signup window so verification UI/polling works (10s)
    sessionStorage.setItem("rr_just_signed_up", "1");
    setTimeout(() => sessionStorage.removeItem("rr_just_signed_up"), 10000);

    // Show verification UI (hide wrapper)
    const wrapper = document.querySelector(".wrapper");
    if (wrapper) wrapper.style.display = "none";
    const ev = document.getElementById("email-verify");
    if (ev) ev.style.display = "block";
    const evEmail = document.getElementById("ev-email");
    if (evEmail) evEmail.textContent = email;
    const evStatus = document.getElementById("ev-status");
    if (evStatus) evStatus.textContent = "Verification email sent. Check your inbox.";

    // Start the verify flow (resend/cancel/poll)
    setupVerifyFlow(cred.user);

  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === "auth/email-already-in-use") {
      // custom message you requested
      errorSignupMsg.textContent = "Email already used, try to Sign IN";
    } else if (err.message && err.message.toLowerCase().includes("network error")) {
      errorSignupMsg.textContent = "There is a network issue, try again later.";
    } else {
      errorSignupMsg.textContent = err.message || "Signup failed.";
    }
  }
});


/* ---------------- Shared verification UI helpers ----------------
   - setupVerifyFlow(user) prepares:
     * a 60s resend cooldown
     * Cancel button that deletes the (unverified) client-side account
     * a poll that reloads the user every 3s and redirects when emailVerified becomes true
*/
let __verifyPoll = null;
let __resendTimer = null;

function clearVerifyTimers() {
  if (__verifyPoll) { clearInterval(__verifyPoll); __verifyPoll = null; }
  if (__resendTimer) { clearInterval(__resendTimer); __resendTimer = null; }
}

function setupVerifyFlow(user) {
  clearVerifyTimers();
  const ev = document.getElementById("email-verify");
  const wrapper = document.querySelector(".wrapper");
  const resendBtn = document.getElementById("ev-resend");
  const cancelBtn = document.getElementById("ev-cancel");
  const evStatus = document.getElementById("ev-status");

  // Resend cooldown 60s
  let countdown = 60;
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend (${countdown})`;
    __resendTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(__resendTimer); __resendTimer = null;
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend";
      } else {
        resendBtn.textContent = `Resend (${countdown})`;
      }
    }, 1000);

    // resend handler
    resendBtn.onclick = async () => {
      try {
        // if currentUser is available, use it; otherwise use the supplied user object
        const cur = firebase.auth().currentUser || user;
        if (cur) {
          await cur.sendEmailVerification();
          if (evStatus) evStatus.textContent = "Verification email resent.";
        }
      } catch (e) {
        console.error("Resend failed:", e);
        if (evStatus) evStatus.textContent = "Resend failed — try again later.";
      }
      // restart cooldown
      countdown = 60;
      if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend (${countdown})`;
        if (__resendTimer) clearInterval(__resendTimer);
        __resendTimer = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(__resendTimer); __resendTimer = null;
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend";
          } else {
            resendBtn.textContent = `Resend (${countdown})`;
          }
        }, 1000);
      }
    };
  }

  // Cancel button: delete the unverified account (client-side delete)
  if (cancelBtn) {
    cancelBtn.onclick = async () => {
      try {
        const cur = firebase.auth().currentUser || user;
        if (!cur) {
          if (ev) ev.style.display = "none";
          if (wrapper) wrapper.style.display = "block";
          clearVerifyTimers();
          return;
        }
        // Try to delete client-side (should succeed if credentials are recent)
        await cur.delete();
        if (ev) ev.style.display = "none";
        if (wrapper) wrapper.style.display = "block";
        if (evStatus) evStatus.textContent = "Account deleted.";
        clearVerifyTimers();
        return;
      } catch (err) {
        console.error("Client delete failed:", err);
        // Fallback: sign out and return to wrapper (you said no server functions right now)
        try { await firebase.auth().signOut(); } catch(e){/*ignore*/ }
        if (ev) ev.style.display = "none";
        if (wrapper) wrapper.style.display = "block";
        if (evStatus) evStatus.textContent = "Delete failed — please contact support.";
        clearVerifyTimers();
        return;
      }
    };
  }

  // Poll for verification every 3s (stops after ~6 minutes)
  let checks = 0;
  const maxChecks = 120;
  __verifyPoll = setInterval(async () => {
    checks++;
    try {
      const cur = firebase.auth().currentUser || user;
      if (!cur) return;
      await cur.reload();
      if (cur.emailVerified) {
        clearVerifyTimers();
        // redirect to original target (if any)
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          try { window.location.replace(decodeURIComponent(redirect)); } catch (e) { window.location.href = "/"; }
        } else {
          window.location.href = "/";
        }
      } else if (checks >= maxChecks) {
        clearVerifyTimers();
        if (evStatus) evStatus.textContent = "Still waiting for verification. You can resend or cancel.";
      }
    } catch (err) {
      console.error("Verification poll error:", err);
    }
  }, 3000);
}
// ---------- Shared helpers for verification UI flow ----------
let __verifyPoll = null;
let __resendTimer = null;

function clearVerifyTimers() {
  if (__verifyPoll) { clearInterval(__verifyPoll); __verifyPoll = null; }
  if (__resendTimer) { clearInterval(__resendTimer); __resendTimer = null; }
}

// setupVerifyFlow(user) prepares resend button, cancel-delete and poll to check verification
function setupVerifyFlow(user) {
  clearVerifyTimers();
  const ev = document.getElementById("email-verify");
  const wrapper = document.querySelector(".wrapper");
  const resendBtn = document.getElementById("ev-resend");
  const cancelBtn = document.getElementById("ev-cancel");
  const evStatus = document.getElementById("ev-status");

  // Initialize resend cooldown (60s)
  let countdown = 60;
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend (${countdown})`;
    __resendTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(__resendTimer);
        __resendTimer = null;
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend";
      } else {
        resendBtn.textContent = `Resend (${countdown})`;
      }
    }, 1000);

    // attach resend handler (ensure single attachment)
    resendBtn.onclick = async () => {
      try {
        const current = firebase.auth().currentUser;
        if (current) {
          await current.sendEmailVerification();
        } else {
          // fallback: try using provided user object
          await user.sendEmailVerification();
        }
        if (evStatus) evStatus.textContent = "Verification email resent.";
      } catch (e) {
        console.error("Resend failed:", e);
        if (evStatus) evStatus.textContent = "Resend failed — try again later.";
      }
      // restart cooldown immediately
      if (resendBtn) {
        resendBtn.disabled = true;
        countdown = 60;
        resendBtn.textContent = `Resend (${countdown})`;
        if (__resendTimer) clearInterval(__resendTimer);
        __resendTimer = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(__resendTimer); __resendTimer = null;
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend";
          } else {
            resendBtn.textContent = `Resend (${countdown})`;
          }
        }, 1000);
      }
    };
  }

  // Cancel button deletes the unverified account client-side and returns to wrapper
  if (cancelBtn) {
    cancelBtn.onclick = async () => {
      try {
        const cur = firebase.auth().currentUser;
        if (!cur) {
          // nothing to delete: hide verify UI and show wrapper
          if (ev) ev.style.display = "none";
          if (wrapper) wrapper.style.display = "block";
          clearVerifyTimers();
          return;
        }
        // Attempt client-side delete (should succeed immediately after signup/signin)
        await cur.delete();
        // after deletion, return to wrapper
        if (ev) ev.style.display = "none";
        if (wrapper) wrapper.style.display = "block";
        if (evStatus) evStatus.textContent = "Account deleted.";
        clearVerifyTimers();
      } catch (err) {
        console.error("Client delete failed:", err);
        // If delete fails (requires recent re-auth), sign user out and show wrapper as fallback
        try { await firebase.auth().signOut(); } catch(e){/*ignore*/ }
        if (ev) ev.style.display = "none";
        if (wrapper) wrapper.style.display = "block";
        if (evStatus) evStatus.textContent = "Delete failed — try again.";
        clearVerifyTimers();
      }
    };
  }

  // Poll for verification every 3s (stop after ~6 minutes)
  let checks = 0;
  const maxChecks = 120;
  __verifyPoll = setInterval(async () => {
    checks++;
    try {
      // reload user record
      const current = firebase.auth().currentUser || user;
      if (!current) return;
      await current.reload();
      if (current.emailVerified) {
        // Verified — redirect to original target or home
        clearVerifyTimers();
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          try { window.location.replace(decodeURIComponent(redirect)); }
          catch (e) { window.location.href = "/"; }
        } else {
          window.location.href = "/";
        }
      } else if (checks >= maxChecks) {
        clearVerifyTimers();
        if (evStatus) evStatus.textContent = "Still waiting for verification. You can resend or cancel.";
      }
    } catch (err) {
      console.error("Verification poll error:", err);
    }
  }, 3000);
}

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

    // Change Password (this is only attached when changePasswordBtn exists, but inside sign-in block to keep parity)
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
  }

  // --- Attach core user-action listeners unconditionally (if elements exist) ---
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

  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      firebase.auth().signOut()
        .then(() => location.reload())
        .catch(e => { console.error(e); alert("Sign-out failed."); });
    });
  }

  if (clearLocalBtn) {
    clearLocalBtn.addEventListener("click", () => {
      if (confirm("Clear all localStorage?")) { localStorage.clear(); alert("Cleared."); }
    });
  }

  if (clearFirestoreBtn) {
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
