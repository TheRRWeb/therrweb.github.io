// Only run in subfolder index.html, not root
if (window.location.pathname !== "/games/" && window.location.pathname.endsWith("index.html")) {
    // Step 1: Dynamically add your CSS file
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/gamebutton.css";  // ✅ your actual path
    document.head.appendChild(link);

    // Step 2: Create the 🎮 button
    const button = document.createElement("button");
    button.id = "closeButton";
    button.textContent = "🎮";
    document.body.appendChild(button);

    // Step 3: Navigate to /games/index.html on click
    button.onclick = () => {
        window.location.href = "/games/index.html";
    };

    // Step 4: Make the button draggable
    let isDragging = false;
    let offsetX, offsetY;

    button.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - button.offsetLeft;
        offsetY = e.clientY - button.offsetTop;
        button.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            button.style.left = (e.clientX - offsetX) + "px";
            button.style.top = (e.clientY - offsetY) + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        button.style.cursor = "pointer";
    });

    // Touch support
    button.addEventListener("touchstart", (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - button.offsetLeft;
        offsetY = touch.clientY - button.offsetTop;
    });

    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            button.style.left = (touch.clientX - offsetX) + "px";
            button.style.top = (touch.clientY - offsetY) + "px";
        }
    });

    document.addEventListener("touchend", () => {
        isDragging = false;
    });
}
