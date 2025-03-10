document.addEventListener("DOMContentLoaded", function() {
    const quotes = [
        `"Just have fun here and download my digital merch" - RR`,
        `"ALIBABAEXPRESS" - Ali Heiba`,
        `"In Africa, every day is 24 hrs" - Mike Cox`,
        `"Shut up, im not a frog" - Totallynotfrog`,
        `"RR is Benn's Cookie" - Benn Cern Tang`,
        `"Aritro likes cats" - Aritro Roy`,
        `"Roses are red, violets are blue, RR made this website, we made it for you" - Murdoch Mackenzie`,
        `"Alex likes planes and this website :p" - Alex Stankov`,
        `"Happiness starts with a smile and this website makes Ethan smile" - Ethan Welch`,
        `"I am Asian" - HaninShen`,
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
        `"Bob and Dennis' favorite website" - Anya Kumar`
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
