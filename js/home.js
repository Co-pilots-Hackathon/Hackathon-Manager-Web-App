document.addEventListener('DOMContentLoaded', () => {

    // ---- Session-aware navbar actions ----
    const navActions = document.getElementById('homeNavActions');
    if (navActions) {
        const session = JSON.parse(localStorage.getItem('hcSession') || 'null');
        if (session) {
            navActions.innerHTML = `
                <div class="nav-user">
                    <span class="nav-role-badge ${session.role}">${session.role}</span>
                    <span class="nav-username"><i class="fa-solid fa-circle-user"></i> ${session.name}</span>
                    <button class="btn-nav-logout" onclick="logoutFromHome()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
                </div>`;
        } else {
            navActions.innerHTML = `
                <div class="nav-auth-btns">
                    <a href="auth.html" class="btn-nav-login">Login</a>
                    <a href="auth.html?tab=signup" class="btn-nav-signup">Sign Up</a>
                </div>`;
        }
    }

    function logoutFromHome() {
        localStorage.removeItem('hcSession');
        window.location.reload();
    }
    window.logoutFromHome = logoutFromHome;


    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                let current = 0;
                const step = Math.max(1, Math.floor(target / 60));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current + (target > 100 ? '+' : (target > 10 ? '+' : ''));
                }, 25);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- Navbar scroll shadow ----
    const nav = document.querySelector('.home-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });

    // ---- Scroll reveal animation ----
    const revealEls = document.querySelectorAll('.about-card, .step-card, .timeline-card, .prize-card, .stat-item');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = entry.target.style.transform.replace('translateY(30px)', 'translateY(0)');
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transform = el.style.transform + ' translateY(30px)';
        revealObserver.observe(el);
    });

    // ---- Chatbot logic ----
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (chatToggleBtn && chatWindow) {
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.add('active');
            chatToggleBtn.style.transform = 'scale(0)';
        });

        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
            chatToggleBtn.style.transform = 'scale(1)';
        });

        const addMessage = (text, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${sender}`;
            msgDiv.textContent = text;
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        };

        const botAnswers = {
            'register': 'You can register by clicking the "Register Now" button or heading to index.html. Fill in your name, email, team and upload an ID proof!',
            'prize': 'The total prize pool is ₹5 Lakh+! Grand winner gets ₹2,00,000, 2nd place ₹75,000, and 3rd place ₹25,000.',
            'schedule': 'The hackathon runs March 15–17, 2026. Registration closes March 10. Check the Timeline section for full details!',
            'qr': 'Once your registration is verified by admin, you will receive a unique QR code on your Dashboard page. Use it to scan in at the venue.',
            'venue': 'The event is held at Innovation Hub, Tech City. More directions will be shared via email to registered participants.',
            'team': 'Teams can have up to 4 members. Register individually and you can form/join teams on the day of the event.',
        };

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const msg = chatInput.value.trim();
                if (msg) {
                    addMessage(msg, 'user');
                    chatInput.value = '';
                    setTimeout(() => {
                        const lower = msg.toLowerCase();
                        let response = "I'm here to help! Try asking about registration, prizes, schedule, or the QR pass system.";
                        for (const [key, ans] of Object.entries(botAnswers)) {
                            if (lower.includes(key)) { response = ans; break; }
                        }
                        addMessage(response, 'bot');
                    }, 900);
                }
            });
        }

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.textContent;
                addMessage(text, 'user');
                e.target.parentElement.style.display = 'none';
                setTimeout(() => {
                    const lower = text.toLowerCase();
                    let response = "Great question! Let me find that for you. (Mock integration — expand keyword matching in home.js)";
                    for (const [key, ans] of Object.entries(botAnswers)) {
                        if (lower.includes(key)) { response = ans; break; }
                    }
                    addMessage(response, 'bot');
                }, 800);
            });
        });
    }
});
