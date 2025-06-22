// enhancedCelebration.js

// 1. Set the exact date/time when effects should start:
//    June 27, 2025 at 12:00:00 PM (local time)
const targetDate = new Date(2025, 5, 26, 15, 0, 0, 0); // month is zero-based (5 = June)

(function() {
  // 2. Wait until the page’s DOM is fully loaded
  document.addEventListener('DOMContentLoaded', scheduleEffects);

  function scheduleEffects() {
    const now = new Date();
    const delay = targetDate.getTime() - now.getTime();

    if (delay <= 0) {
      // If the target time has already passed (or is right now), start immediately
      startEffects();
    } else {
      // Otherwise, wait until the target time
      setTimeout(startEffects, delay);
    }
  }

  // 3. This function injects all CSS/HTML/JS needed for confetti, spotlights, etc.
  function startEffects() {
    // --- A. Inject CSS for animations and styling ---
    const style = document.createElement('style');
    style.innerHTML = `
      /* === FULLSCREEN OVERLAY === */
      .decor-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none; /* Let clicks pass through */
        overflow: hidden;
        z-index: 10000;
      }

      /* === RADIAL SPOTLIGHTS (CIRCULAR CENTER) === */
      .spotlight {
        position: absolute;
        width: 30vw;
        height: 30vw;
        border-radius: 50%;
        background: radial-gradient(
          circle at 50% 50%,
          rgba(92, 201, 59, 0.5) 0%,
          transparent 60%
        );
        filter: blur(20px);
        animation: moveSpotlight 5s infinite ease-in-out;
      }
      .spotlight.blue {
        background: radial-gradient(
          circle at 50% 50%,
          rgba(65, 147, 201, 0.5) 0%,
          transparent 60%
        );
        animation-direction: alternate;
      }
      @keyframes moveSpotlight {
        0%   { transform: translate(-30vw, -30vw); }
        25%  { transform: translate(120vw, -30vw); }
        50%  { transform: translate(120vw, 120vw); }
        75%  { transform: translate(-30vw, 120vw); }
        100% { transform: translate(-30vw, -30vw); }
      }

      /* === FLASH EFFECT (STROBE WITH COLOR VARIATION) === */
      .flash {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.08s ease-in-out;
      }

      /* === MOVING LOGOS: FLOATING === */
      @keyframes floatLogo {
        0%   { top: 5%;  left: 5%;  }
        25%  { top: 5%;  left: 85%; }
        50%  { top: 85%; left: 85%; }
        75%  { top: 85%; left: 5%;  }
        100% { top: 5%;  left: 5%;  }
      }
      .logo-floating {
        position: absolute;
        width: 100px;
        height: auto;
        animation: floatLogo 10s infinite ease-in-out;
        pointer-events: none;
        z-index: 10001;
      }

      /* === MOVING LOGOS: DVD-STYLE BOUNCE === */
      .logo-dvd {
        position: absolute;
        width: 80px;
        height: auto;
        pointer-events: none;
        z-index: 10002;
      }

      /* === TWINKLING STARS === */
      .star {
        position: absolute;
        background: #dedede;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        animation: twinkle 2s infinite ease-in-out;
      }
      @keyframes twinkle {
        0%, 100% { opacity: 0; }
        50%      { opacity: 1; }
      }

      /* === FALLING LOGO (to mix with confetti) === */
      .logo-fall {
        position: absolute;
        width: 30px;
        height: auto;
        pointer-events: none;
        opacity: 0.9;
        animation: fallLogo 3s linear forwards;
      }
      @keyframes fallLogo {
        0%   { transform: translateY(-40px) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    // --- B. Create the overlay container that holds everything ---
    const container = document.createElement('div');
    container.className = 'decor-overlay';
    document.body.appendChild(container);

    // --- C. ADD RADIAL SPOTLIGHTS ---
    const spotlight1 = document.createElement('div');
    spotlight1.className = 'spotlight';
    container.appendChild(spotlight1);

    const spotlight2 = document.createElement('div');
    spotlight2.className = 'spotlight blue';
    container.appendChild(spotlight2);

    // --- D. ADD FLASH (STROBE) ELEMENT WITH COLOR VARIATION ---
    const flashEl = document.createElement('div');
    flashEl.className = 'flash';
    container.appendChild(flashEl);
    // Every 1.5 seconds, show a quick flash in either white, green, or blue
    setInterval(() => {
      const rand = Math.random();
      if (rand < 0.33) {
        flashEl.style.background = '#ffffff';
      } else if (rand < 0.66) {
        flashEl.style.background = 'rgba(92, 201, 59, 0.8)';
      } else {
        flashEl.style.background = 'rgba(65, 147, 201, 0.8)';
      }
      flashEl.style.opacity = '0.8';
      setTimeout(() => { flashEl.style.opacity = '0'; }, 80);
    }, 1500);

    // --- E. ADD MOVING LOGOS: FLOATING ===
    const floatingCount = 3;
    for (let i = 0; i < floatingCount; i++) {
      const logoF = document.createElement('img');
      logoF.src = '/logos/RRlogo12.png';
      logoF.className = 'logo-floating';
      // Stagger animation start times
      logoF.style.animationDelay = (i * 1.5) + 's';
      container.appendChild(logoF);
    }

    // --- F. ADD MOVING LOGOS: DVD-STYLE BOUNCE ===
    const dvdLogos = [];
    const dvdCount = 4;
    for (let i = 0; i < dvdCount; i++) {
      const logoD = document.createElement('img');
      logoD.src = '/logos/RRlogo12.png';
      logoD.className = 'logo-dvd';
      // Random starting position within the viewport
      const startX = Math.random() * (window.innerWidth - 80);
      const startY = Math.random() * (window.innerHeight - 80);
      logoD.style.left = startX + 'px';
      logoD.style.top = startY + 'px';
      container.appendChild(logoD);

      // Give each logo a random velocity between 1 and 3 px per frame
      const velocity = {
        x: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
        y: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1)
      };
      dvdLogos.push({ el: logoD, vx: velocity.x, vy: velocity.y });
    }

    // Start the bouncing animation loop for DVD logos
    function bounceDVD() {
      dvdLogos.forEach(obj => {
        const el = obj.el;
        let x = parseFloat(el.style.left);
        let y = parseFloat(el.style.top);

        x += obj.vx;
        y += obj.vy;

        // Bounce off left/right edges
        if (x <= 0) {
          x = 0;
          obj.vx *= -1;
        } else if (x + el.offsetWidth >= window.innerWidth) {
          x = window.innerWidth - el.offsetWidth;
          obj.vx *= -1;
        }
        // Bounce off top/bottom edges
        if (y <= 0) {
          y = 0;
          obj.vy *= -1;
        } else if (y + el.offsetHeight >= window.innerHeight) {
          y = window.innerHeight - el.offsetHeight;
          obj.vy *= -1;
        }

        el.style.left = x + 'px';
        el.style.top = y + 'px';
      });
      requestAnimationFrame(bounceDVD);
    }
    requestAnimationFrame(bounceDVD);

    // --- G. ADD TWINKLING STARS ===
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 3 + 2; // 2px–5px
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.animationDelay = (Math.random() * 2) + 's';
      container.appendChild(star);
    }

    // --- H. LOAD CANVAS-CONFETTI LIBRARY AND START CONFETTI + FALLING LOGOS ---
    const confettiScript = document.createElement('script');
    confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
    confettiScript.onload = () => {
      // Create a full-screen canvas for confetti
      const canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      container.appendChild(canvas);

      // Keep the canvas sized to the viewport
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });

      // Initialize confetti on that canvas
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

      // Launch a confetti burst + occasional falling logos every 500 ms
      setInterval(() => {
        // Confetti burst
        myConfetti({
          particleCount: 40,
          spread: 80,
          startVelocity: 40,
          colors: ['#5cc93b', '#4193c9', '#dedede', '#2a2a2a']
        });

        // Create a falling logo element
        const falling = document.createElement('img');
        falling.src = '/logos/RRlogo12.png';
        falling.className = 'logo-fall';
        // Random horizontal start position
        falling.style.left = (Math.random() * (window.innerWidth - 30)) + 'px';
        // Insert into container
        container.appendChild(falling);
        // Remove the element after animation ends (3s)
        setTimeout(() => {
          if (falling.parentElement) {
            falling.parentElement.removeChild(falling);
          }
        }, 3100);
      }, 500);
    };
    document.body.appendChild(confettiScript);
  }
})();
