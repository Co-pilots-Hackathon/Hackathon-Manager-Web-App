// ============================================================
//  HackConnect — Auth Logic (auth.js)
// ============================================================

const ADMIN_CREDENTIALS = {
    email: 'admin@hackconnect.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
};

// ---- TAB SWITCHING (global so onclick= attrs can reach it) ----
function switchTab(tab) {
    const loginPanel = document.getElementById('loginPanel');
    const signupPanel = document.getElementById('signupPanel');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    if (!loginPanel) return;

    if (tab === 'login') {
        loginPanel.classList.remove('hidden');
        signupPanel.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        signupPanel.classList.remove('hidden');
        loginPanel.classList.add('hidden');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

// ---- PASSWORD TOGGLE (global) ----
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

// ---- FILE UPLOAD CLEAR (global, called from onclick in HTML) ----
function clearSignupFile() {
    const signupIdProof = document.getElementById('signupIdProof');
    const signupFileArea = document.getElementById('signupFileArea');
    const signupFilePreview = document.getElementById('signupFilePreview');
    if (signupIdProof) signupIdProof.value = '';
    if (signupFileArea) signupFileArea.style.display = '';
    if (signupFilePreview) signupFilePreview.style.display = 'none';
}

// =====================================================================
//  ALL FORM LOGIC: inside DOMContentLoaded so DOM is ready AND so
//  event listeners are attached BEFORE the redirect-check at the end.
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {

    // ---- ROLE SELECTOR CARDS ----
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // ---- FILE UPLOAD (Signup) ----
    const signupFileArea = document.getElementById('signupFileArea');
    const signupIdProof = document.getElementById('signupIdProof');
    const signupFilePreview = document.getElementById('signupFilePreview');
    const signupFileName = document.getElementById('signupFileName');

    function showFilePreview(name) {
        if (signupFileName) signupFileName.textContent = name;
        if (signupFileArea) signupFileArea.style.display = 'none';
        if (signupFilePreview) signupFilePreview.style.display = 'flex';
    }

    if (signupFileArea && signupIdProof) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt =>
            signupFileArea.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }));
        ['dragenter', 'dragover'].forEach(evt =>
            signupFileArea.addEventListener(evt, () => signupFileArea.classList.add('is-active')));
        ['dragleave', 'drop'].forEach(evt =>
            signupFileArea.addEventListener(evt, () => signupFileArea.classList.remove('is-active')));
        signupFileArea.addEventListener('drop', e => {
            if (e.dataTransfer.files.length) showFilePreview(e.dataTransfer.files[0].name);
        });
        signupIdProof.addEventListener('change', function () {
            if (this.files.length) showFilePreview(this.files[0].name);
        });
    }

    // ---- LOGIN FORM ----
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    function showLoginError(msg) {
        if (!loginError) return;
        const span = loginError.querySelector('span');
        if (span) span.textContent = msg;
        loginError.classList.remove('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const roleEl = document.querySelector('input[name="loginRole"]:checked');
            const role = roleEl ? roleEl.value : 'participant';

            loginError.classList.add('hidden');

            const btn = document.getElementById('loginBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
            btn.disabled = true;

            setTimeout(() => {
                if (role === 'admin') {
                    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                        localStorage.setItem('hcSession', JSON.stringify({ name: 'Admin', email, role: 'admin' }));
                        window.location.href = 'admin.html';
                    } else {
                        showLoginError('Invalid admin credentials. Use: admin@hackconnect.com / admin123');
                        btn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right"></i>';
                        btn.disabled = false;
                    }
                    return;
                }

                // Participant login
                let storedUser = null;
                try { storedUser = JSON.parse(localStorage.getItem('hackathonUser') || 'null'); } catch (_) { }

                if (storedUser && storedUser.email && storedUser.email.toLowerCase() === email && storedUser.password === password) {
                    localStorage.setItem('hcSession', JSON.stringify({ name: storedUser.name, email: storedUser.email, role: 'participant' }));
                    window.location.href = 'dashboard.html';
                } else {
                    showLoginError("Invalid email or password. Don't have an account? Use the Sign Up tab.");
                    btn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right"></i>';
                    btn.disabled = false;
                }
            }, 700);
        });
    }

    // ---- SIGNUP FORM ----
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const signupErrorMsg = document.getElementById('signupErrorMsg');

    if (signupForm) {
        signupForm.addEventListener('submit', e => {
            e.preventDefault();

            const name = document.getElementById('signupName').value.trim();
            const teamEl = document.getElementById('signupTeam');
            const team = teamEl ? teamEl.value.trim() : '';
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value;

            if (signupError) signupError.classList.add('hidden');

            if (!name || !email || !password) {
                if (signupErrorMsg) signupErrorMsg.textContent = 'Please fill in Name, Email, and Password.';
                if (signupError) signupError.classList.remove('hidden');
                return;
            }
            if (password.length < 6) {
                if (signupErrorMsg) signupErrorMsg.textContent = 'Password must be at least 6 characters.';
                if (signupError) signupError.classList.remove('hidden');
                return;
            }

            let existing = null;
            try { existing = JSON.parse(localStorage.getItem('hackathonUser') || 'null'); } catch (_) { }
            if (existing && existing.email && existing.email.toLowerCase() === email) {
                if (signupErrorMsg) signupErrorMsg.textContent = 'Email already registered. Please use the Login tab.';
                if (signupError) signupError.classList.remove('hidden');
                return;
            }

            const btn = document.getElementById('signupBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
            btn.disabled = true;

            setTimeout(() => {
                const user = { name, email, team, password, role: 'participant', status: 'pending' };
                localStorage.setItem('hackathonUser', JSON.stringify(user));
                localStorage.setItem('hcSession', JSON.stringify({ name, email, role: 'participant' }));
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }

    // ---- Handle ?tab=signup in URL ----
    if (window.location.search.includes('tab=signup')) {
        switchTab('signup');
    }

    // ---- Auto-redirect if already logged in ----
    // Runs LAST (inside DOMContentLoaded, after all listeners), so forms
    // work even if a redirect triggers on the same tick.
    try {
        const session = JSON.parse(localStorage.getItem('hcSession') || 'null');
        if (session && session.role) {
            window.location.href = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
        }
    } catch (_) {
        localStorage.removeItem('hcSession');
    }
});
