function myFunction() {
  var x = document.getElementById("Navbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}

function promptAddToHomeScreen() {
  alert('To add this app to your Home Screen:.\n1. Click on the share button.\n2. Select "Add to Home Screen."');
}