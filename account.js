// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB1OXqvU6bi9cp-aPs6AGNnCaTGwHtkuUs",
  authDomain: "therrweb.firebaseapp.com",
  projectId: "therrweb",
  storageBucket: "therrweb.firebasestorage.app",
  messagingSenderId: "77162554401",
  appId: "1:77162554401:web:4462bfcbbee40167b9af60",
  measurementId: "G-WC9WXR0CY5"
};

const auth = firebase.auth();
const db = firebase.firestore();

// ========== SIGN UP ==========
document.getElementById("signup-btn")?.addEventListener("click", () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Account created successfully.");
      location.reload();
    })
    .catch((error) => {
      if (error.code === 'auth/network-request-failed') {
        alert("There is a network issue, try again later.");
      } else {
        alert("Incorrect email or password");
      }
    });
});

// ========== SIGN IN ==========
document.getElementById("signin-btn")?.addEventListener("click", () => {
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signed in successfully.");
    })
    .catch((error) => {
      if (error.code === 'auth/network-request-failed') {
        alert("There is a network issue, try again later.");
      } else {
        alert("Incorrect email or password");
      }
    });
});

// ========== SAVE LOCAL STORAGE ==========
document.getElementById("save-data-btn")?.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Please sign in first.");
  const data = JSON.stringify(localStorage);
  db.collection("userdata").doc(user.uid).set({ data })
    .then(() => alert("Data saved to cloud."))
    .catch(() => alert("Error saving data."));
});

// ========== LOAD LOCAL STORAGE ==========
document.getElementById("load-data-btn")?.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Please sign in first.");
  db.collection("userdata").doc(user.uid).get()
    .then((doc) => {
      if (doc.exists) {
        localStorage.clear();
        const data = JSON.parse(doc.data().data);
        for (const key in data) {
          localStorage.setItem(key, data[key]);
        }
        alert("Data loaded from cloud.");
      } else {
        alert("No saved data found.");
      }
    })
    .catch(() => alert("Error loading data."));
});

// ========== CHECK MEMBERSHIP ==========
auth.onAuthStateChanged((user) => {
  if (!user) return;

  db.collection("membership").doc(user.uid).get()
    .then((doc) => {
      const isMember = doc.exists && doc.data().membership === true;
      toggleMembershipContent(isMember);
    })
    .catch(() => toggleMembershipContent(false));
});

function toggleMembershipContent(isMember) {
  const memElems = document.querySelectorAll(".memshow, .memhide");

  memElems.forEach(elem => {
    if (elem.classList.contains("memshow")) {
      if (isMember) elem.style.display = "";
      else elem.style.display = "none";
    } else if (elem.classList.contains("memhide")) {
      if (isMember) elem.style.display = "none";
      else elem.style.display = "";
    }
  });

  // Extra protection: observer to block DevTools tampering
  const observer = new MutationObserver(() => toggleMembershipContent(isMember));
  memElems.forEach(elem => observer.observe(elem, { attributes: true, attributeFilter: ["style", "class"] }));
}