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

const speed = 50;         // ms between frames
const maxIterations = 10; // how many scrambles before done

// **Encrypt**: scramble current text then clear it
function encryptText(el) {
  return new Promise(resolve => {
    let iter = 0;
    const original = el.innerText;
    const interval = setInterval(() => {
      // build a fully scrambled string
      const scrambled = original
        .split('')
        .map(c => c === ' ' ? ' ' : characters[Math.floor(Math.random() * characters.length)])
        .join('');
      el.innerText = scrambled;
      iter++;
      if (iter >= maxIterations) {
        clearInterval(interval);
        el.innerText = '';   // clear for next quote
        resolve();
      }
    }, speed);
  });
}

// **Decrypt**: from blank → reveal real text one letter at a time (sequentially)
function decryptText(el, finalText) {
  return new Promise(resolve => {
    let iter = 0;
    let revealed = new Set();
    const interval = setInterval(() => {
      // build display each frame
      const display = finalText
        .split('')
        .map((c,i) => {
          if (c === ' ') return ' ';
          return revealed.has(i)
            ? c
            : characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      el.innerText = display;

      // reveal one more letter
      if (iter < maxIterations && iter < finalText.length) {
        revealed.add(iter);
      } else {
        clearInterval(interval);
        el.innerText = finalText;
        resolve();
      }
      iter++;
    }, speed);
  });
}

// Cycle: encrypt old → advance index → decrypt new
async function showNextQuote() {
  await encryptText(quoteDisplay);
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  await decryptText(quoteDisplay, quotes[currentQuoteIndex]);
}

// “See All” flow: show and decrypt every quote at once
async function showAllQuotes() {
  // build the list
  allQuotesDiv.innerHTML = quotes.map(q => `<p></p>`).join('');
  const ps = Array.from(allQuotesDiv.children);
  quoteDisplay.style.display = 'none';
  expandButton.style.display = 'none';
  collapseButton.style.display = 'inline-block';
  allQuotesDiv.style.display = 'block';

  // decrypt each <p> in sequence (or in parallel if you like)
  for (let i = 0; i < ps.length; i++) {
    await decryptText(ps[i], quotes[i]);
  }
}

// “Collapse” flow: hide all → decrypt main quote
async function collapseQuotes() {
  allQuotesDiv.style.display    = 'none';
  expandButton.style.display    = 'inline-block';
  collapseButton.style.display  = 'none';
  quoteDisplay.style.display    = 'block';
  await decryptText(quoteDisplay, quotes[currentQuoteIndex]);
}

// Attach handlers
expandButton.addEventListener('click', showAllQuotes);
collapseButton.addEventListener('click', collapseQuotes);

// Start it all on load
document.addEventListener("DOMContentLoaded", async () => {
  // decrypt the first randomly chosen quote
  await decryptText(quoteDisplay, quotes[currentQuoteIndex]);
  // then every 3s, swap with encrypt/decrypt
  setInterval(showNextQuote, 3000);
});