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

// —————— CONFIG ——————
const characters      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
const speed           = 40;  // ms between frames
const lettersPerTick  = 1;   // how many letters to add/reveal each frame
const extraScrambleFrames = 3; // extra full‑length scramble frames

let currentQuoteIndex = Math.floor(Math.random() * quotes.length);

const quoteDisplay   = document.getElementById('quote-display');
const allQuotesDiv   = document.getElementById('all-quotes');
const expandButton   = document.getElementById('expand-button');
const collapseButton = document.getElementById('collapse-button');


// —————— TRANSITION FUNCTION ——————
/**
 * Smoothly encrypts away the old text (growing or shrinking to
 * match the new length), then decrypts into the newText.
 *
 * @param {HTMLElement} el
 * @param {string}       newText
 */
async function transitionQuote(el, newText) {
  const oldText = el.innerText;
  const maxLen  = Math.max(oldText.length, newText.length);

  // — Encrypt (scramble & adjust length) —
  await new Promise(res => {
    let frameCount = 0;
    const growFrames = Math.ceil((maxLen - oldText.length) / lettersPerTick);
    const totalFrames = growFrames + extraScrambleFrames;

    function scrambleFrame() {
      frameCount++;
      // determine current length: start at oldText.length, grow up to maxLen
      const grown = Math.min(frameCount, growFrames) * lettersPerTick;
      const currLen = Math.min(oldText.length + grown, maxLen);

      // build a fully scrambled string of currLen random chars
      let out = '';
      for (let i = 0; i < currLen; i++) {
        out += characters[Math.floor(Math.random() * characters.length)];
      }
      el.innerText = out;

      if (frameCount < totalFrames) {
        setTimeout(scrambleFrame, speed);
      } else {
        el.innerText = ''; // clear before decrypt
        res();
      }
    }

    scrambleFrame();
  });

  // — Decrypt (reveal into newText) —
  await new Promise(res => {
    let revealed = 0;

    function decryptFrame() {
      let out = '';
      for (let i = 0; i < maxLen; i++) {
        if (i < revealed) {
          // reveal real character (or blank if newText shorter)
          out += newText[i] || '';
        } else if ((newText[i] || '') === ' ') {
          out += ' ';
        } else {
          // random placeholder
          out += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      el.innerText = out;

      revealed += lettersPerTick;
      if (revealed <= maxLen) {
        setTimeout(decryptFrame, speed);
      } else {
        el.innerText = newText; // clamp exactly
        res();
      }
    }

    decryptFrame();
  });
}


// —————— AUTO‑CYCLE LOOP ——————
async function startQuoteLoop() {
  // clear initially
  quoteDisplay.innerText = '';
  while (true) {
    // animate in the current quote
    await transitionQuote(quoteDisplay, quotes[currentQuoteIndex]);

    // pause 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    // advance index
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  }
}


// —————— SHOW ALL / COLLAPSE ——————
async function showAllQuotes() {
  quoteDisplay.style.display   = 'none';
  expandButton.style.display   = 'none';
  collapseButton.style.display = 'inline-block';

  allQuotesDiv.innerHTML     = quotes.map(_ => `<p></p>`).join('');
  allQuotesDiv.style.display = 'block';

  const ps = Array.from(allQuotesDiv.children);
  ps.forEach((p, i) => {
    p.innerText = '';
    // stagger them slightly if you like
    setTimeout(() => transitionQuote(p, quotes[i]), i * 80);
  });
}

async function collapseQuotes() {
  allQuotesDiv.style.display   = 'none';
  expandButton.style.display   = 'inline-block';
  collapseButton.style.display = 'none';
  quoteDisplay.style.display   = 'block';

  // re‑animate current main quote
  await transitionQuote(quoteDisplay, quotes[currentQuoteIndex]);
}


// —————— EVENT HOOKUP & INIT ——————
expandButton.addEventListener('click', showAllQuotes);
collapseButton.addEventListener('click', collapseQuotes);

document.addEventListener('DOMContentLoaded', () => {
  startQuoteLoop();
});