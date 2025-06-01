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
    `"Papa Glenn" - Noah Fazal, Zak Flitti`,
    `"A man who doesn't love fishing is not a man" - Sergio Christodoulou (The one who banned the web)`,
    `"When she calls me passionate, unique, successful, special and youthful" - Louis Jack`,
    `"Papas wingeria" - Oliver Wheeler`,
    `"I pray on their success" - Abdulaziz Alayaseh`,
    `"Lebroooooooooon" - Alexander Akidil`
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
