function myFunction() {
  var x = document.getElementById("Navbar");
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}

function promptAddToHomeScreen() {
  alert('To add this app to your Home Screen:\n1. Go to the home page (clicking on "Close" will do so).\n2. Click on the share button.\n3. Select "Add to Home Screen."');
  window.location.href = '/'; // Adjust the path to your home page as needed
}