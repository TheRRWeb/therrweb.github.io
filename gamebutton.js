console.log("Gamebutton script loaded!");
// Only run in subfolder index.html, not root
if (window.location.pathname !== "/games/" && window.location.pathname.endsWith("index.html")) {
    // Step 1: Dynamically add your CSS file (if it's not already loaded)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/gamebutton.css";  // Your actual path
    document.head.appendChild(link);

    // Step 2: Dynamically create the button using JavaScript (no HTML)
    const button = document.createElement("button");
    button.id = "closeButton";
    button.textContent = "🎮";
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "20px";  // Make sure this matches your CSS
    button.style.cursor = "pointer";
    document.body.appendChild(button);

    // Step 3: Add click functionality to go to /games/index.html
    button.onclick = () => {
        window.location.href = "/games/index.html";
    };
}
console.log("Gamebutton script finished!");
