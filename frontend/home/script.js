
const buttons = document.querySelectorAll(".card button");

// Button click event
buttons.forEach(button => {

    button.addEventListener("click", () => {

        const link = button.getAttribute("data-link");

        
        if (!link) {

            alert("Page not found.");
            return;

        }

        // Java অথবা Python page এখনো না থাকলে
        if (
            link.includes("java") ||
            link.includes("python")
        ) {

            const go = confirm(
                "This compiler is under development.\n\nDo you want to continue?"
            );

            if (go) {

                window.location.href = link;

            }

            return;

        }

        // C অথবা C++ page
        window.location.href = link;

    });

});

// =====================================
// Card Hover Animation
// =====================================

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// =====================================
// Console Message
// =====================================

console.log("LexBridge Home Loaded Successfully.");