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

const speed = 40;  // ms between frames
// How many letters to reveal per tick (1 = slowest; up to, say, 3 for faster)
const lettersPerTick = 1;

/**
 * Smoothly transition from whatever is currently in `quoteDisplay`
 * to `newText`, revealing `lettersPerTick` new chars per frame,
 * and filling the rest with random characters.
 */
function transitionQuote(newText) {
  return new Promise(resolve => {
    const oldText = quoteDisplay.innerText;
    const maxLen  = Math.max(oldText.length, newText.length);
    let revealedCount = 0;

    const frame = () => {
      let display = '';
      for (let i = 0; i < maxLen; i++) {
        if (i < revealedCount) {
          // reveal actual char (or blank if newText too short)
          display += newText[i] || '';
        } else {
          // show random placeholder char (or space if target is a space)
          const targetChar = newText[i] || '';
          display += targetChar === ' '
            ? ' '
            : characters[Math.floor(Math.random() * characters.length)];
        }
      }
      quoteDisplay.innerText = display;

      revealedCount += lettersPerTick;
      if (revealedCount <= maxLen) {
        setTimeout(frame, speed);
      } else {
        // finally clamp to exact newText
        quoteDisplay.innerText = newText;
        resolve();
      }
    };

    frame();
  });
}

// Cycle: transition to next quote
async function showNextQuote() {
  const nextIndex = (currentQuoteIndex + 1) % quotes.length;
  await transitionQuote(quotes[nextIndex]);
  currentQuoteIndex = nextIndex;
}

// Show all quotes: build the <p> elements, then decrypt each in parallel
async function showAllQuotes() {
  // hide main, show list
  quoteDisplay.style.display   = 'none';
  expandButton.style.display   = 'none';
  collapseButton.style.display = 'inline-block';
  allQuotesDiv.innerHTML       = quotes.map(_ => `<p></p>`).join('');
  allQuotesDiv.style.display   = 'block';

  // decrypt each paragraph at its own pace
  const ps = Array.from(allQuotesDiv.children);
  ps.forEach((p, i) => {
    // start each with empty
    p.innerText = '';
    // stagger start times a bit if you like:
    setTimeout(() => transitionQuote.call({ quoteDisplay: p }, quotes[i]), i * 80);
  });
}

// Collapse back: hide list, show main quote (re-decrypt)
async function collapseQuotes() {
  allQuotesDiv.style.display    = 'none';
  expandButton.style.display    = 'inline-block';
  collapseButton.style.display  = 'none';
  quoteDisplay.style.display    = 'block';
  // re‑decrypt the current main quote
  await transitionQuote(quotes[currentQuoteIndex]);
}

// Attach handlers
expandButton.addEventListener('click', showAllQuotes);
collapseButton.addEventListener('click', collapseQuotes);

// Initialize on load
document.addEventListener("DOMContentLoaded", async () => {
  // start with empty and decrypt your first random quote
  quoteDisplay.innerText = '';
  await transitionQuote(quotes[currentQuoteIndex]);
  // then every 3s, flip to the next
  setInterval(showNextQuote, 3000);
});