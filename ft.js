const quotes = [
    `"Just have fun here and download my digital merch" - RR`,
    `"ALIBABAEXPRESS" - Ali Heiba`,
    `"In Africa, every day is 24 hrs" - Mike Cox`,
    `"Shut up, im not a frog" - Totallynotfrog`,
    `"RR is Benn's Cookie" - Benn Cern Tang`,
    `"I like cats" - Aritro Roy`,
    `"Roses are red, violets are blue, RR made this website, we made it for you" - Murdoch Mackenzie`,
    `"Alex likes planes, cats and this website" - Alex Stankov`,
    `"Still hungry" - Y.`,
    `"Happiness starts with a smile and this website makes Ethan smile" - Ethan Welch`,
    `"I am Asian" - Hani Shen`,
    `"Im going to eat u" - Quijun Tang`,
    `"Ronan" - Ronan Bingham`,
    `"Hippitie hoppitie, this website is amazing for my property!" - Nico Smit`,
    `"Nico likes to play bus driver simulator" - Aditya Joseph Philip`,
    `"Buy my baby oil and see diddy.com" - Pranil Diddi`,
    `"With great power comes great responsibility...im not responsible" - Jenson Cooper`,
    `"Roses are red violets are blue and this website is a cannon event for your life and 9,11 too" - Finn Tarmar`,
    `"who ever is reading this plays games in class" - Ethan Lai`,
    `"Why did Benn have to leave me" - Rayyan Asif`,
    `"I like year 5s" - Douglas Clow`,
    `"Better than Poki" - Dhruv Mondal`,
    `"Bob and Dennis' favorite website" - Anya Kumar`,
    `"Kick Paul Out!!!" - Spencer Samuel`,
    `"If you dont wear how did the floor taste boxers your not legit" - Ali Elnaggar`,
    `"I am officially tired of school" - Magdalena Slavkova`,
    `"Lil phoebeeeee" - Carl Deeb`,
    `"tihe" - Xitong Zhang`,
    `"Michaelsoft Binbows 95" - Agastyn Manivannan`,
    `"I like stacking Tetris blocks & Tomb in masks" - RE`,
    `"Hatta Rules" - Aiden from TAC`,
    `"I am the greatest - LeBron" - Enbo Zeus`,
    `"King" - Izak - Michael Zinn`,
    `"Chicken Jockey" - Jack Black`,
    `"It’s crazy how everyone in Year 8 plays on this website now" - HD`,
    `"A man who doesn't love fishing is not a man" - Sergio Christodoulou (The one who banned the web)`,
    `"When she calls me passionate, unique, successful, special and youthful" - Louis Jack`,
    `"Papas wingeria" - Oliver Wheeler`,
    `"I pray on their success" - Abdulaziz Alayaseh`,
    `"Lebroooooooooon" - Alexander Akidil`
];

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
let currentQuoteIndex = Math.floor(Math.random() * quotes.length);

const quoteDisplay   = document.getElementById('quote-display');
const allQuotesDiv   = document.getElementById('all-quotes');
const expandButton   = document.getElementById('expand-button');
const collapseButton = document.getElementById('collapse-button');

const speed = 40;        // ms per frame
const lettersPerTick = 1; // how many new letters to reveal each frame

/**
 * Animate encryption → clearing, then decryption → finalText,
 * on element `el`, smoothly handling length changes.
 */
async function transitionQuote(el, newText) {
  const oldText = el.innerText;
  const maxLen  = Math.max(oldText.length, newText.length);
  
  // --- ENCRYPT PHASE ---
  // Quickly scramble everything, then clear
  await new Promise(res => {
    let iter = 0;
    const scrambleInterval = setInterval(() => {
      let scrambled = '';
      for (let i = 0; i < maxLen; i++) {
        scrambled += (newText[i] === ' ')
          ? ' '
          : characters[Math.floor(Math.random() * characters.length)];
      }
      el.innerText = scrambled;
      if (++iter >= 5) {          // only 5 frames of scramble
        clearInterval(scrambleInterval);
        el.innerText = '';
        res();
      }
    }, speed);
  });

  // --- DECRYPT PHASE ---
  await new Promise(res => {
    let revealed = 0;
    function frame() {
      let display = '';
      for (let i = 0; i < maxLen; i++) {
        if (i < revealed) {
          display += newText[i] || '';
        } else if ((newText[i] || '') === ' ') {
          display += ' ';
        } else {
          display += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      el.innerText = display;
      revealed += lettersPerTick;
      if (revealed <= maxLen) {
        setTimeout(frame, speed);
      } else {
        el.innerText = newText; // clamp
        res();
      }
    }
    frame();
  });
}

// --- AUTO‑CYCLE LOOP ---
async function startQuoteLoop() {
  while (true) {
    // transition to the **current** quote
    await transitionQuote(quoteDisplay, quotes[currentQuoteIndex]);

    // wait 3s before next
    await new Promise(r => setTimeout(r, 3000));

    // advance index
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  }
}

// --- SHOW ALL / COLLAPSE ---
async function showAllQuotes() {
  quoteDisplay.style.display   = 'none';
  expandButton.style.display   = 'none';
  collapseButton.style.display = 'inline-block';

  allQuotesDiv.innerHTML     = quotes.map(_ => `<p></p>`).join('');
  allQuotesDiv.style.display = 'block';

  const ps = Array.from(allQuotesDiv.children);
  // decrypt each in parallel (stagger start if you like)
  ps.forEach((p, i) => {
    p.innerText = '';
    setTimeout(() => transitionQuote(p, quotes[i]), i * 80);
  });
}

async function collapseQuotes() {
  allQuotesDiv.style.display    = 'none';
  expandButton.style.display    = 'inline-block';
  collapseButton.style.display  = 'none';
  quoteDisplay.style.display    = 'block';

  // re‑decrypt current main quote
  await transitionQuote(quoteDisplay, quotes[currentQuoteIndex]);
}

// --- EVENT HOOKUP & INIT ---
expandButton.addEventListener('click', showAllQuotes);
collapseButton.addEventListener('click', collapseQuotes);

document.addEventListener("DOMContentLoaded", () => {
  // start empty then run the loop
  quoteDisplay.innerText = '';
  startQuoteLoop();
});