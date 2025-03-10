const quotes = [
    `"Just have fun here and download my digital merch" - RR`,
    `"ALIBABAEXPRESS" - AH`,
    `"In Africa, every day is 24 hrs" - Mike Cox`,
    `"Shut up, I'm not a frog" - Totallynotfrog`,
    `"RR is Benn's Cookie" - BCT`,
    `"Aritro likes gaming" - AR`,
    `"Roses are red, violets are blue, RR made this website, we made it for you" - MM`,
    `"Alex likes planes and this website :p" - AS`,
    `"Happiness starts with a smile and this website makes Ethan smile" - EW`,
    `"I am Asian" - HS`,
    `"I'm going to eat u" - QT`,
    `"Nico likes to play bus driver simulator" - AJP`,
    `"Buy my baby oil and see diddy.com" - P Diddi`,
    `"I'm going to touch the maker of this website" - RC`,
    `"With great responsibility comes great power... I'm not responsible" - JC`,
    `"If you don't wear next, you're not a jit" - PJ`,
    `"The quotes above me are cringe" - BZ`,
    `"Roses are red, violets are blue, this website is a cannon event for your life and tragedies too" - FT`,
    `"Whoever is reading this plays games in class" - EL`,
    `"Why did Benn have to leave me" - RA`,
    `"rr web free" - AM`,
    `"Helloooo I'm DYING in history" - LES`,
    `"I like year 5s" - DC`
  ];

  let currentQuoteIndex = 0;
  const quoteDisplay = document.getElementById('quote-display');
  const allQuotesDiv = document.getElementById('all-quotes');
  const expandButton = document.getElementById('expand-button');
  const collapseButton = document.getElementById('collapse-button');

  // Function to cycle quotes
  function showNextQuote() {
    quoteDisplay.innerText = quotes[currentQuoteIndex];
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