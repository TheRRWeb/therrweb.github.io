function myFunction() {
  var x = document.getElementById("Navbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}

function promptAddToHomeScreen() {
  alert('Make it EASY to open The RR Web and still get updates automatically by getting the app!\n\nTo add this app to your Home Screen:.\n1. Click on the share button.\n2. Select "Add to Home Screen."');
}