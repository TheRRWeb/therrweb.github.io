const quotes = [
    `"Just have fun here and download my digital merch" - RR`,
    `"ALIBABAEXPRESS" - Ali Heiba`,
    `"In Africa, every day is 24 hrs" - Mike Cox`,
    `"Shut up, im not a frog" - Totallynotfrog`,
    `"RR is Benn's Cookie" - Benn Cern Tang`,
    `"My mom died when we couldn't remember her blood type. As she died, she kept telling us to be positive but it's hard without her." - Ben Lee Tang`,
    `"I like cats" - Aritro Roy`,
    `"Roses are red, violets are blue, RR made this website, we made it for you" - Murdoch Mackenzie`,
    `"Alex likes planes, cats and this website ;P :D" - Alex Stankov`,
    `"Happiness starts with a smile and this website makes Ethan smile" - Ethan Welch`,
    `"I am Asian" - Hani Shen`,
    `"Im going to eat u" - Quijun Tang`,
    `"Nico likes to play bus driver simulator" - Aditya Joseph Philip`,
    `"Buy my baby oil and see diddy.com" - P-ranil Diddi`,
    `"Im going to touch the maker of this website" - Rian Collins`,
    `"With great responsibility comes great power...im not responsible" - Jenson Cooper`,
    `"If you dont wear next, ur not a jit" - Paul Jones`,
    `"The quotes above me are cringe" - Bzzzzz`,
    `"Roses are red violets are blue and this website is a cannon event for your life and tragedies too" - Finn Tarmar`,
    `"who ever is reading this plays games in class" - Ethan Lai`,
    `"Why did Benn have to leave me" - idk the name pls resend the form to tell me`,
    `"rr web free" - same as above`,
    `"Helloooo im DIEING in history" - same as above`,
    `"I like year 5s" - Douglas Clow`,
    `"Better than Poki" - Dhruv Mondal`,
    `"Bob and Dennis' favorite website" - Anya Kumar`,
    `"Kick Paul Out!!!" - Spencer Samuel`,
    `"If you dont wear how did the floor taste boxers your not legit" - Ali Elnaggar`,
    `"I am officially tired of school" - Magdalena Slavkova`,
    `"RR is the GOAT" - anonymous`,
    `"Lil phoebeeeee" - Carl Deeb`,
    `"tihe" - Xitong Zhang`,
    `"Michaelsoft Binbows 95" - Agastyn Manivannan`,
    `"My husband left a note on the fridge that said, This isn't working. I'm not sure what he's talking about. I opened the fridge door, and it's working fine" - RR Web Helper`,
    `"I like stacking Tetris blocks & Tomb in masks" - RE`
];

let currentQuoteIndex = Math.floor(Math.random() * quotes.length); // Start at random index
const quoteDisplay = document.getElementById('quote-display');
const allQuotesDiv = document.getElementById('all-quotes');
const expandButton = document.getElementById('expand-button');
const collapseButton = document.getElementById('collapse-button');

// Function to show quotes with animation
function showNextQuote() {
    quoteDisplay.classList.remove('fade-up');
    void quoteDisplay.offsetWidth; // Restart animation
    quoteDisplay.innerText = quotes[currentQuoteIndex];
    quoteDisplay.classList.add('fade-up');
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
}

// Start the cycle when the page loads
document.addEventListener("DOMContentLoaded", () => {
    showNextQuote(); // Show the first quote immediately
    setInterval(showNextQuote, 3000); // Cycle every 3 seconds
});

// Function to show all quotes
function showAllQuotes() {
    allQuotesDiv.innerHTML = quotes.map(q => `<p>${q}</p>`).join('');
    allQuotesDiv.style.display = 'block';
    expandButton.style.display = 'none';
    collapseButton.style.display = 'inline-block';
    quoteDisplay.style.display = 'none';
}

// Function to collapse quotes back to cycle
function collapseQuotes() {
    allQuotesDiv.style.display = 'none';
    expandButton.style.display = 'inline-block';
    collapseButton.style.display = 'none';
    quoteDisplay.style.display = 'block';
}

// Attach the functions to the buttons
window.showAllQuotes = showAllQuotes;
window.collapseQuotes = collapseQuotes;