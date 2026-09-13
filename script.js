/**
 * ARIV R SHETTY — PORTFOLIO INTERACTION ENGINE (2026)
 * Features: Particle Canvas, Custom Cursor, Dynamic Typewriter,
 * 3D Tilt Physics, Animated Counters, Project Filters, Command Palette,
 * Web Audio FX, Toast Notifications, and Smooth Scroll Triggers.
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================
    // 1. STATE & AUDIO ENGINE (WEB AUDIO API)
    // =========================================================
    const state = {
        soundEnabled: localStorage.getItem("portfolio_sound") === "true",
        audioCtx: null
    };

    function initAudio() {
        if (!state.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                state.audioCtx = new AudioCtx();
            }
        }
    }

    function playTone(freq = 440, type = "sine", duration = 0.08, gainVal = 0.05) {
        if (!state.soundEnabled) return;
        try {
            initAudio();
            if (!state.audioCtx) return;
            if (state.audioCtx.state === "suspended") {
                state.audioCtx.resume();
            }

            const osc = state.audioCtx.createOscillator();
            const gainNode = state.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

            gainNode.gain.setValueAtTime(gainVal, state.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(state.audioCtx.destination);

            osc.start();
            osc.stop(state.audioCtx.currentTime + duration);
        } catch (e) {
            // Audio error silently ignored
        }
    }

    const soundFx = {
        click: () => playTone(600, "sine", 0.06, 0.04),
        hover: () => playTone(350, "triangle", 0.03, 0.015),
        success: () => {
            playTone(523.25, "sine", 0.08, 0.04);
            setTimeout(() => playTone(659.25, "sine", 0.1, 0.04), 60);
        },
        openModal: () => {
            playTone(400, "sine", 0.08, 0.03);
            setTimeout(() => playTone(800, "sine", 0.12, 0.03), 50);
        }
    };

    // Sound toggle button
    const soundToggle = document.getElementById("soundToggle");
    const soundIconOn = document.getElementById("soundIconOn");
    const soundIconOff = document.getElementById("soundIconOff");

    function updateSoundUI() {
        if (state.soundEnabled) {
            soundIconOn?.classList.remove("hidden");
            soundIconOff?.classList.add("hidden");
        } else {
            soundIconOn?.classList.add("hidden");
            soundIconOff?.classList.remove("hidden");
        }
    }
    updateSoundUI();

    soundToggle?.addEventListener("click", () => {
        initAudio();
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem("portfolio_sound", state.soundEnabled);
        updateSoundUI();
        if (state.soundEnabled) {
            soundFx.success();
            showToast("Sound FX Enabled 🔊");
        } else {
            showToast("Sound FX Muted 🔇");
        }
    });

    // =========================================================
    // 2. TOAST NOTIFICATION SYSTEM
    // =========================================================
    const toastContainer = document.getElementById("toastContainer");

    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span>✨</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // =========================================================
    // 3. COPY TO CLIPBOARD HANDLERS
    // =========================================================
    document.querySelectorAll("[data-copy]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const textToCopy = el.getAttribute("data-copy");
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                soundFx.success();
                showToast(`Copied "${textToCopy}" to clipboard!`);
            }).catch(() => {
                showToast(`Copied to clipboard!`);
            });
        });
    });

    // =========================================================
    // 4. INTERACTIVE PARTICLE CANVAS
    // =========================================================
    const canvas = document.getElementById("particleCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.6;
                this.baseX = this.x;
                this.baseY = this.y;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.color = Math.random() > 0.4 ? "rgba(0, 242, 254, " : "rgba(139, 92, 246, ";
                this.alpha = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Boundary bounce
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = mouse.radius;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * 1.5;
                        const directionY = forceDirectionY * force * 1.5;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                ctx.fillStyle = this.color + this.alpha + ")";
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 75);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            const maxDistance = 110;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.15;
                        ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener("mouseout", () => {
            mouse.x = null;
            mouse.y = null;
        });

        resizeCanvas();
        animateParticles();
    }

    // =========================================================
    // 5. CUSTOM SMOOTH CURSOR (DESKTOP)
    // =========================================================
    const cursorDot = document.getElementById("cursorDot");
    const cursorRing = document.getElementById("cursorRing");

    if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        function animateCursorRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursorRing);
        }
        animateCursorRing();

        // Hover expansions
        const interactiveElements = document.querySelectorAll("a, button, input, textarea, .tilt-target, .social-chip, .filter-tab");
        interactiveElements.forEach(el => {
            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover");
                soundFx.hover();
            });
            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover");
            });
        });
    }

    // =========================================================
    // 6. DYNAMIC TYPEWRITER HEADLINE
    // =========================================================
    const typewriterEl = document.getElementById("typewriter");
    if (typewriterEl) {
        const roles = [
            "Computer & Communication Engineer",
            "AI & Machine Learning Explorer",
            "Full-Stack Web Developer",
            "Creative Problem Solver",
            "Python & C++ Enthusiast"
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 85;

        function typeLoop() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 85;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                typingSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 400; // Pause before new word
            }

            setTimeout(typeLoop, typingSpeed);
        }
        typeLoop();
    }

    // =========================================================
    // 7. LIVE TIMEZONE CLOCK
    // =========================================================
    const liveClockEl = document.getElementById("liveClock");
    function updateClock() {
        if (!liveClockEl) return;
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        };
        const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
        liveClockEl.textContent = `${timeString} IST`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // =========================================================
    // 8. 3D CARD TILT EFFECT (MOUSEMOVE PHYSICS)
    // =========================================================
    const tiltTargets = document.querySelectorAll(".tilt-target, #heroAvatarCard");

    tiltTargets.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
        });
    });

    // =========================================================
    // 9. ANIMATED NUMBER COUNTERS
    // =========================================================
    const statNumbers = document.querySelectorAll(".stat-number");
    let statsAnimated = false;

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute("data-target"), 10);
            if (isNaN(target)) return;

            const duration = 1800;
            const start = 0;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out expo
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentVal = Math.floor(easeProgress * (target - start) + start);

                if (target < 10 && target > 0) {
                    stat.textContent = currentVal < 10 ? `0${currentVal}` : currentVal;
                } else {
                    stat.textContent = currentVal;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = target < 10 && target > 0 ? `0${target}` : target;
                }
            }

            requestAnimationFrame(update);
        });
    }

    const statsSection = document.querySelector(".hero-stats");
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsAnimated) {
                    statsAnimated = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    // =========================================================
    // 10. PROJECT & SKILL FILTER TABS
    // =========================================================
    function setupFilterTabs(tabsContainerId, gridContainerId, cardSelector) {
        const tabsContainer = document.getElementById(tabsContainerId);
        const gridContainer = document.getElementById(gridContainerId);
        if (!tabsContainer || !gridContainer) return;

        const tabs = tabsContainer.querySelectorAll(".filter-tab");
        const cards = gridContainer.querySelectorAll(cardSelector);

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                soundFx.click();
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const filterValue = tab.getAttribute("data-filter");

                cards.forEach(card => {
                    const cardCategory = card.getAttribute("data-category") || "";
                    if (filterValue === "all" || cardCategory.includes(filterValue)) {
                        card.style.display = "";
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "scale(1)";
                        }, 10);
                    } else {
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.95)";
                        setTimeout(() => {
                            card.style.display = "none";
                        }, 200);
                    }
                });
            });
        });
    }

    setupFilterTabs("projectFilterTabs", "projectsGrid", ".project-card");
    setupFilterTabs("skillFilterTabs", "skillsGrid", ".skill-card");

    // =========================================================
    // 11. COMMAND PALETTE (CTRL+K / CMD+K)
    // =========================================================
    const cmdPalette = document.getElementById("cmdPalette");
    const cmdLauncher = document.getElementById("cmdLauncher");
    const cmdCloseBtn = document.getElementById("cmdCloseBtn");
    const cmdInput = document.getElementById("cmdInput");
    const cmdItems = document.querySelectorAll(".cmd-item");

    function openCommandPalette() {
        if (!cmdPalette) return;
        cmdPalette.showModal();
        soundFx.openModal();
        cmdInput?.focus();
    }

    function closeCommandPalette() {
        if (!cmdPalette) return;
        cmdPalette.close();
        if (cmdInput) cmdInput.value = "";
        filterCmdItems("");
    }

    cmdLauncher?.addEventListener("click", openCommandPalette);
    cmdCloseBtn?.addEventListener("click", closeCommandPalette);

    cmdPalette?.addEventListener("click", (e) => {
        if (e.target === cmdPalette) closeCommandPalette();
    });

    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (cmdPalette?.hasAttribute("open")) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }
        if (e.key === "Escape" && cmdPalette?.hasAttribute("open")) {
            closeCommandPalette();
        }
    });

    function filterCmdItems(query) {
        const q = query.toLowerCase().trim();
        cmdItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (!q || text.includes(q)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        });
    }

    cmdInput?.addEventListener("input", (e) => {
        filterCmdItems(e.target.value);
    });

    cmdItems.forEach(item => {
        item.addEventListener("click", () => {
            soundFx.click();
            const action = item.getAttribute("data-action");

            if (action === "goto") {
                const target = item.getAttribute("data-target");
                const targetEl = document.querySelector(target);
                if (targetEl) {
                    closeCommandPalette();
                    targetEl.scrollIntoView({ behavior: "smooth" });
                }
            } else if (action === "copy") {
                const val = item.getAttribute("data-value");
                navigator.clipboard.writeText(val);
                closeCommandPalette();
                showToast(`Copied "${val}" to clipboard!`);
            } else if (action === "link") {
                const url = item.getAttribute("data-url");
                window.open(url, "_blank");
                closeCommandPalette();
            } else if (action === "toggle-sound") {
                soundToggle?.click();
                closeCommandPalette();
            }
        });
    });

    // =========================================================
    // 12. SCROLL PROGRESS RING & SCROLL TO TOP
    // =========================================================
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    const progressRingFill = document.getElementById("progressRingFill");
    const ringCircumference = 113.097; // 2 * PI * r (r=18)

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

        if (progressRingFill) {
            const offset = ringCircumference - (scrollPercent * ringCircumference);
            progressRingFill.style.strokeDashoffset = offset;
        }

        if (scrollTopBtn) {
            if (scrollTop > 250) {
                scrollTopBtn.classList.add("visible");
            } else {
                scrollTopBtn.classList.remove("visible");
            }
        }
    });

    scrollTopBtn?.addEventListener("click", () => {
        soundFx.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // =========================================================
    // 13. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHT
    // =========================================================
    const navbar = document.getElementById("navbar");
    const menuBtn = document.getElementById("menuBtn");
    const nav = document.getElementById("nav");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    // Mobile menu toggle
    menuBtn?.addEventListener("click", () => {
        soundFx.click();
        menuBtn.classList.toggle("open");
        nav?.classList.toggle("open");
        const isOpen = nav?.classList.contains("open");
        menuBtn.setAttribute("aria-expanded", isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            soundFx.click();
            menuBtn?.classList.remove("open");
            nav?.classList.remove("open");
        });
    });

    window.addEventListener("scroll", () => {
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }

        // Active link tracking
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // =========================================================
    // 14. INTERACTIVE CONTACT FORM HANDLER
    // =========================================================
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");

    contactForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        soundFx.click();

        const name = document.getElementById("formName")?.value || "";
        const email = document.getElementById("formEmail")?.value || "";
        const subject = document.getElementById("formSubject")?.value || "Portfolio Contact";
        const message = document.getElementById("formMessage")?.value || "";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span>`;
        }

        setTimeout(() => {
            soundFx.success();
            showToast("Opening email client with your message! ✉️");

            // Open mailto link
            const mailtoUrl = `mailto:arivshetty@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Ariv,\n\n${message}\n\nFrom: ${name} (${email})`)}`;
            window.location.href = mailtoUrl;

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Message Prepared ✓</span>`;
                setTimeout(() => {
                    submitBtn.innerHTML = `
                        <span>Send Message</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    `;
                }, 3000);
            }
            contactForm.reset();
        }, 600);
    });

    // =========================================================
    // 15. SCROLL REVEAL OBSERVER
    // =========================================================
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    console.log("%c🚀 ARIV R SHETTY PORTFOLIO READY", "color: #00f2fe; font-size: 14px; font-weight: bold;");
});