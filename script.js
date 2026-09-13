// =========================================
// PREMIUM NAVBAR
// =========================================

const navbar = document.querySelector(".navbar");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelectorAll("#nav a");


// =========================================
// MOBILE MENU
// =========================================

menuBtn.addEventListener("click", () => {

    nav.classList.toggle("open");

});


// Close menu after clicking a link

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        nav.classList.remove("open");

    });

});


// =========================================
// NAVBAR SCROLL EFFECT
// =========================================

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


// =========================================
// ACTIVE NAVIGATION LINK
// =========================================

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 180;

        if (window.scrollY >= sectionTop) {

            currentSection = section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {

            link.classList.add("active");

        }

    });

});


// =========================================
// CONTACT FORM VALIDATION
// =========================================
// Kept here for future contact-form functionality.

console.log("Portfolio loaded successfully 🚀");

// =========================================
// SCROLL REVEAL
// =========================================

const revealElements = document.querySelectorAll(
    ".section-label, .section-title, .about-text, .about-cards, .skills-intro, .skill, .project-card, .experience-card, .contact-wrapper"
);

revealElements.forEach((element, index) => {

    element.classList.add("reveal");

    if (index % 4 === 1) {
        element.classList.add("reveal-delay-1");
    }

    if (index % 4 === 2) {
        element.classList.add("reveal-delay-2");
    }

    if (index % 4 === 3) {
        element.classList.add("reveal-delay-3");
    }

});


const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach(element => {

    revealObserver.observe(element);

});