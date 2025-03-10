 document.addEventListener("DOMContentLoaded", function() {
    const quotes = [
        `"Just have fun here and download my digital merch" - RR`,
        `"ALIBABAEXPRESS" - AH`,
        `"In Africa, every day is 24 hrs" - Mike Cox`,
        `"Shut up, im not a frog" - Totallynotfrog`,
        `"RR is Benn's Cookie" - BCT`,
        `"Aritro likes gaming" - AR`,
        `"Roses are red, violets are blue, RR made this website, we made it for you" - MM`,
        `"Alex likes planes and this website :p" - AS`,
        `"Happiness starts with a smile and this website makes Ethan smile" - EW`,
        `"I am Asian" - HS`,
        `"Im going to eat u" - QT`,
        `"Nico likes to play bus driver simulator" - AJP`,
        `"Buy my baby oil and see diddy.com" - P Diddi`,
        `"Im going to touch the maker of this website" - RC`,
        `"With great responsibility comes great power...im not responsible" - JC`,
        `"If you dont wear next, ur not a jit" - PJ`,
        `"The quotes above me are cringe" - BZ`,
        `"Roses are red violets are blue and this website is a cannon event for your life and tragedies too" - FT`,
        `"who ever is reading this plays games in class" - EL`,
        `"Why did Benn have to leave me" - RA`,
        `"rr web free" - AM`,
        `"Helloooo im DIEING in history" - LES`,
        `"I like year 5s" - DC`
    ];

    let currentQuoteIndex = 0;
    const quoteDisplay = document.getElementById("quote-display");
    const allQuotesDiv = document.getElementById("all-quotes");
    const expandButton = document.getElementById("expand-button");
    const collapseButton = document.getElementById("collapse-button");

    function showNextQuote() {
        quoteDisplay.textContent = quotes[currentQuoteIndex];
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length; // Reset when it reaches the end
    }

    let quoteInterval = setInterval(showNextQuote, 3500); // Quote changes every 3.5 seconds

    function showAllQuotes() {
        clearInterval(quoteInterval); // Stop cycling quotes

        allQuotesDiv.innerHTML = quotes.map(q => `<p>${q}</p>`).join('');
        allQuotesDiv.classList.add("show");
        expandButton.style.display = "none";
        collapseButton.style.display = "inline";
    }

    function collapseQuotes() {
        allQuotesDiv.classList.remove("show");

        setTimeout(() => {
            allQuotesDiv.innerHTML = ''; // Clear quotes after collapse
            collapseButton.style.display = "none";
            expandButton.style.display = "inline";
            currentQuoteIndex = 0; // Reset to start from the first quote
            showNextQuote(); // Show the next quote in the cycle
            quoteInterval = setInterval(showNextQuote, 3500); // Restart cycling quotes
        }, 500); // Match the CSS transition duration (if any)
    }

    // Initial quote display
    showNextQuote();

    // Attach functions to buttons
    window.showAllQuotes = showAllQuotes;
    window.collapseQuotes = collapseQuotes;
});
