// ============================================================
//  HackSphere — Shared Navbar Logic (nav.js)
//  Renders the correct nav state based on session
// ============================================================

(function renderNav() {
    const session = JSON.parse(localStorage.getItem('hcSession') || 'null');
    const navEl = document.getElementById('mainNav');
    if (!navEl) return;

    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    // Build nav items — role-aware
    const isAdmin = session && session.role === 'admin';

    const navItems = [
        { href: 'home.html', icon: 'fa-house', label: 'Home' },
    ];

    if (isAdmin) {
        // Admin sees Team Dashboard (relabeled "Dashboard") + Admin Center — NOT participant dashboard
        navItems.push({ href: 'admin-dashboard.html', icon: 'fa-users-line', label: 'Dashboard' });
        navItems.push({ href: 'admin.html', icon: 'fa-chart-line', label: 'Admin Center' });
    } else {
        // Participant sees their own dashboard
        navItems.push({ href: 'dashboard.html', icon: 'fa-qrcode', label: 'Dashboard' });
    }

    // Judge Panel is visible to everyone
    navItems.push({ href: 'judge.html', icon: 'fa-gavel', label: 'Judge Panel' });

    const linksHtml = navItems.map(item => {
        const active = currentPage === item.href ? 'class="active"' : '';
        return `<li ${active}><a href="${item.href}"><i class="fa-solid ${item.icon}"></i> ${item.label}</a></li>`;
    }).join('');

    // Right side: show user info + logout if logged in, else Login/Signup buttons
    let rightHtml = '';
    if (session) {
        const roleLabel = session.role === 'admin'
            ? '<span class="nav-role-badge admin">Admin</span>'
            : '<span class="nav-role-badge participant">Participant</span>';
        rightHtml = `
            <div class="nav-user">
                ${roleLabel}
                <span class="nav-username"><i class="fa-solid fa-circle-user"></i> ${session.name}</span>
                <button class="btn-nav-logout" onclick="logoutUser()">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
        `;
    } else {
        rightHtml = `
            <div class="nav-auth-btns">
                <a href="auth.html" class="btn-nav-login">Login</a>
                <a href="auth.html?tab=signup" class="btn-nav-signup">Sign Up</a>
            </div>
        `;
    }

    navEl.innerHTML = `
        <div class="logo">
            <a href="home.html" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;color:inherit;">
                <i class="fa-solid fa-code"></i>
                <span>HackSphere</span>
            </a>
        </div>
        <ul class="nav-links">${linksHtml}</ul>
        ${rightHtml}
    `;
})();

// ---- LOGOUT ----
function logoutUser() {
    localStorage.removeItem('hcSession');
    window.location.href = 'auth.html?logout=1';
}

// ---- ROUTE GUARD ----
// Call this on protected pages
function requireAuth(allowedRole) {
    const session = JSON.parse(localStorage.getItem('hcSession') || 'null');
    if (!session) {
        window.location.href = 'auth.html';
        return false;
    }
    if (allowedRole && session.role !== allowedRole) {
        // Wrong role — redirect to appropriate page
        window.location.href = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
        return false;
    }
    return true;
}

// ---- IF on auth.html, check for tab param ----
if (window.location.search.includes('tab=signup')) {
    const fn = window.switchTab;
    if (typeof fn === 'function') fn('signup');
    else window.addEventListener('load', () => window.switchTab && window.switchTab('signup'));
}
