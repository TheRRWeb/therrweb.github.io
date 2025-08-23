// ----------------- auth + sign-up / sign-in (cleaned) -----------------
document.addEventListener("DOMContentLoaded", () => {
  // 0) first-time setup
  if (localStorage.getItem("r-touch") === null) localStorage.setItem("r-touch", "on");

  // 1) Firebase init (keep your config)
  const firebaseConfig = {
    apiKey: "AIzaSyB1OXqvU6bi9cp-aPs6AGNnCaTGwHtkuUs",
    authDomain: "therrweb.firebaseapp.com",
    projectId: "therrweb",
    storageBucket: "therrweb.firebasestorage.app",
    messagingSenderId: "77162554401",
    appId: "1:77162554401:web:4462bfcbbee40167b9af60",
    measurementId: "G-WC9WXR0CY5"
  };
  if (!(window.firebase && firebase.apps && firebase.apps.length)) {
    firebase.initializeApp(firebaseConfig);
  }

  // 1.a) persistence
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

  // public pages (no auth required)
  const publicPages = ["/", "/index.html", "/account/login.html"];
  const currentPath = window.location.pathname;

  const db = firebase.firestore();

  // UI helper elements
  const userMembershipSpan = document.getElementById("user-membership");
  const userFullNameSpan   = document.getElementById("user-fullname");

  // MEMBERSHIP / UI helpers
  let currentIsMember = false;
  function applyMembershipView(isMember) {
    document.querySelectorAll(".memshow").forEach(el => el.style.display = isMember ? "block" : "none");
    document.querySelectorAll(".memhide").forEach(el => el.style.display = isMember ? "none" : "block");
  }

  async function handleSignedIn(user) {
    try {
      // membership lookup
      let snap = await db.collection("membership").doc(user.uid).get().catch(()=>null);
      if (!snap || !snap.exists) snap = await db.collection("membership").doc(user.email).get().catch(()=>null);
      currentIsMember = !!(snap && snap.exists && snap.data().membership === true);
      applyMembershipView(currentIsMember);
      if (userMembershipSpan) userMembershipSpan.textContent = currentIsMember ? "You are a Membership User" : "";
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
    } catch (e) {
      console.error("handleSignedIn error", e);
      handleSignedOut();
    }
  }

  function handleSignedOut() {
    currentIsMember = false;
    applyMembershipView(false);
    if (userMembershipSpan) userMembershipSpan.textContent = "";
    if (userFullNameSpan) userFullNameSpan.textContent = "";
    const signedOutView = document.getElementById("auth-container");
    const signedInView  = document.getElementById("user-controls");
    if (signedOutView && signedInView) {
      signedOutView.style.display = "block";
      signedInView.style.display  = "none";
    }
  }

  // Unified auth-state handling
  async function unifiedAuthHandler(user) {
    if (!user) {
      handleSignedOut();
      if (!publicPages.includes(currentPath)) {
        const target = window.location.pathname + window.location.search + window.location.hash;
        window.location.replace("/account/login.html?redirect=" + encodeURIComponent(target));
      }
      return;
    }

    // refresh to get latest emailVerified
    try { await user.reload(); } catch(e) { console.warn("user.reload failed", e); }

    const justSignedUp = sessionStorage.getItem("rr_just_signed_up") === "1";

    // If user is not verified, block access unless they just signed up in this tab temporarily
    if (!user.emailVerified) {
      if (justSignedUp) {
        // allow the short-lived verification UI flow to continue (signup/signin handlers open that UI)
        // but do not persist access for long-term; protected pages are still guarded by redirect below
        handleSignedOut(); // keep main app blocked (we'll show verify UI separately)
        return;
      }
      // Not just-signed-up -> sign out immediately and redirect if needed.
      try { await firebase.auth().signOut(); } catch(e){ console.warn("signOut failed", e); }
      handleSignedOut();
      if (!publicPages.includes(currentPath)) {
        const target = window.location.pathname + window.location.search + window.location.hash;
        window.location.replace("/account/login.html?redirect=" + encodeURIComponent(target));
      }
      return;
    }

    // user is verified => normal signed-in UI
    await handleSignedIn(user);
  }

  firebase.auth().onAuthStateChanged(async u => {
    try { await unifiedAuthHandler(u); } catch (e) { console.error("auth handler", e); handleSignedOut(); }
  });

  // Observe memshow / memhide tampering (keep)
  const tamperObserver = new MutationObserver(()=> applyMembershipView(currentIsMember));
  document.querySelectorAll(".memshow, .memhide")
    .forEach(el => tamperObserver.observe(el, { attributes: true, attributeFilter: ["style","class"] }));

  // ------ Account page elements ------
  const emailSigninInput    = document.querySelector(".email-signin");
  const passwordSigninInput = document.querySelector(".password-signin");
  const emailSignupInput    = document.querySelector(".email-signup");
  const passwordSignupInput = document.querySelector(".password-signup");
  const nameSignupInput     = document.querySelector(".name-signup");
  const newsletterCheckbox  = document.querySelector(".newsletter-checkbox");

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

  // only attach handlers if UI present
  if (emailSigninInput && signInBtn && signUpBtn) {

    // verification UI helpers (single set)
    let verifyPoll = null;
    let resendTimer = null;
    function clearVerifyTimers() {
      if (verifyPoll) { clearInterval(verifyPoll); verifyPoll = null; }
      if (resendTimer) { clearInterval(resendTimer); resendTimer = null; }
    }

    function setupVerifyUI(userObj) {
      clearVerifyTimers();
      const wrapper = document.querySelector(".wrapper");
      const ev = document.getElementById("email-verify");
      const evEmail = document.getElementById("ev-email");
      const evStatus = document.getElementById("ev-status");
      const resendBtn = document.getElementById("ev-resend");
      const cancelBtn = document.getElementById("ev-cancel");

      if (wrapper) wrapper.style.display = "none";
      if (ev) ev.style.display = "block";
      if (evEmail) evEmail.textContent = (userObj && userObj.email) || "";

      if (evStatus) evStatus.textContent = "Verification email sent. Check your inbox.";

      // resend cooldown 60s
      let secs = 60;
      if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend (${secs})`;
        resendTimer = setInterval(() => {
          secs--;
          if (secs <= 0) { clearInterval(resendTimer); resendTimer = null; resendBtn.disabled = false; resendBtn.textContent = "Resend"; }
          else resendBtn.textContent = `Resend (${secs})`;
        }, 1000);

        resendBtn.onclick = async () => {
          try {
            const cur = firebase.auth().currentUser || userObj;
            if (cur) await cur.sendEmailVerification();
            if (evStatus) evStatus.textContent = "Verification email resent.";
          } catch (e) {
            console.error("resend failed", e);
            if (evStatus) evStatus.textContent = "Resend failed — try again later.";
          }
          // restart cooldown
          secs = 60;
          resendBtn.disabled = true;
          resendBtn.textContent = `Resend (${secs})`;
          if (resendTimer) clearInterval(resendTimer);
          resendTimer = setInterval(() => {
            secs--;
            if (secs <= 0) { clearInterval(resendTimer); resendTimer = null; resendBtn.disabled = false; resendBtn.textContent = "Resend"; }
            else resendBtn.textContent = `Resend (${secs})`;
          }, 1000);
        };
      }

      // cancel -> delete unverified account (client-only)
      if (cancelBtn) {
        cancelBtn.onclick = async () => {
          try {
            const cur = firebase.auth().currentUser || userObj;
            if (cur) {
              await cur.delete(); // should succeed right after signup/signin
            }
          } catch (e) {
            console.warn("client delete failed", e);
            try { await firebase.auth().signOut(); } catch(_) {}
          } finally {
            // restore wrapper UI
            if (ev) ev.style.display = "none";
            if (wrapper) wrapper.style.display = "block";
            clearVerifyTimers();
            // clear pending session items
            sessionStorage.removeItem("rr_pending_fullName");
            sessionStorage.removeItem("rr_pending_news");
            sessionStorage.removeItem("rr_just_signed_up");
          }
        };
      }

      // poll for verification (every 3s - ~6 minutes max)
      let checks = 0;
      const maxChecks = 120;
      verifyPoll = setInterval(async () => {
        checks++;
        try {
          const cur = firebase.auth().currentUser || userObj;
          if (!cur) return;
          await cur.reload();
          if (cur.emailVerified) {
            // verified -> perform post-verification actions:
            clearVerifyTimers();
            // 1) set displayName and userdata if we have pending info
            const pendingName = sessionStorage.getItem("rr_pending_fullName");
            const pendingNews = sessionStorage.getItem("rr_pending_news") === "1";
            try {
              if (pendingName) {
                await cur.updateProfile({ displayName: pendingName });
                // save to userdata
                await db.collection("userdata").doc(cur.uid).set({ fullName: pendingName }, { merge: true });
              }
              // subscribe if requested (keep using your existing Netlify proxy)
              if (pendingNews) {
                try {
                  await fetch("/.netlify/functions/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: cur.email, fullName: pendingName || "" })
                  });
                } catch (err) {
                  console.warn("subscribe proxy failed", err);
                }
              }
            } catch (postErr) {
              console.error("post-verification actions failed", postErr);
            } finally {
              // clear pending keys
              sessionStorage.removeItem("rr_pending_fullName");
              sessionStorage.removeItem("rr_pending_news");
              sessionStorage.removeItem("rr_just_signed_up");
            }

            // Now show signed-in UI (do not navigate away — user stays on page)
            try { await handleSignedIn(cur); } catch(e){ console.warn(e); }

            // done
            clearVerifyTimers();
          } else if (checks >= maxChecks) {
            clearVerifyTimers();
            const evStatus = document.getElementById("ev-status");
            if (evStatus) evStatus.textContent = "Still waiting for verification. You can resend or cancel.";
          }
        } catch (err) {
          console.error("verification poll error", err);
        }
      }, 3000);
    } // end setupVerifyUI

    // ---------- SIGN UP ----------
    signUpBtn.removeEventListener && signUpBtn.removeEventListener("click", null);
    signUpBtn.addEventListener("click", async () => {
      const fullName = (nameSignupInput && nameSignupInput.value || "").trim();
      const email = (emailSignupInput && emailSignupInput.value || "").trim();
      const pwd = (passwordSignupInput && passwordSignupInput.value) || "";
      if (errorSignupMsg) errorSignupMsg.textContent = "";

      if (!fullName || !email || !pwd) {
        if (errorSignupMsg) errorSignupMsg.textContent = "Enter name, email and password.";
        return;
      }

      try {
        // create the account (account exists on Firebase now)
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, pwd);

        // store pending info in sessionStorage while the tab is open
        sessionStorage.setItem("rr_pending_fullName", fullName);
        sessionStorage.setItem("rr_pending_news", (newsletterCheckbox && newsletterCheckbox.checked) ? "1" : "0");

        // send verification email
        try { await cred.user.sendEmailVerification(); } catch (e) { console.warn("sendEmailVerification:", e); }

        // short window to keep the auth alive for verification UI
        sessionStorage.setItem("rr_just_signed_up", "1");
        setTimeout(() => sessionStorage.removeItem("rr_just_signed_up"), 10000);

        // show verification UI and start polling
        setupVerifyUI(cred.user);

      } catch (err) {
        console.error("signup error", err);
        if (errorSignupMsg) {
          if (err.code === "auth/email-already-in-use") {
            errorSignupMsg.textContent = "Email already used, try to Sign IN";
          } else if (err.message && err.message.toLowerCase().includes("network error")) {
            errorSignupMsg.textContent = "There is a network issue, try again later.";
          } else {
            errorSignupMsg.textContent = err.message || "Signup failed.";
          }
        }
      }
    });

    // ---------- SIGN IN ----------
    signInBtn.removeEventListener && signInBtn.removeEventListener("click", null);
    signInBtn.addEventListener("click", async () => {
      const email = (emailSigninInput && emailSigninInput.value || "").trim();
      const pwd = (passwordSigninInput && passwordSigninInput.value) || "";
      if (errorLoginMsg) errorLoginMsg.textContent = "";

      try {
        const cred = await firebase.auth().signInWithEmailAndPassword(email, pwd);
        const user = cred.user;
        await user.reload();

        if (!user.emailVerified) {
          // send verification and show verify UI (block access)
          try { await user.sendEmailVerification(); } catch (e) { console.warn("sendEmailVerification:", e); }

          // allow a short window so unified handler doesn't immediately sign them out
          sessionStorage.setItem("rr_just_signed_up", "1");
          setTimeout(() => sessionStorage.removeItem("rr_just_signed_up"), 10000);

          setupVerifyUI(user);
          return;
        }

        // verified -> show signed-in UI
        await handleSignedIn(user);

      } catch (err) {
        console.error("signin error", err);
        if (errorLoginMsg) {
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
      }
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
