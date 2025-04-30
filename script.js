function myFunction() {
  var x = document.getElementById("Navbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyDnLY_bS5z2yG6kwfES597fUq_8n5rl5HU",
  authDomain: "the-rr-web.firebaseapp.com",
  projectId: "the-rr-web",
  storageBucket: "the-rr-web.appspot.com",
  messagingSenderId: "164968568706",
  appId: "1:164968568706:web:1de6a6e34ab866bacd219b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
