document.addEventListener('DOMContentLoaded', () => {

    // File Upload handling for Registration Page
    const fileInput = document.getElementById('idProof');
    const fileDropArea = document.getElementById('fileDropArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const removeFileBtn = document.getElementById('removeFile');

    if (fileInput) {
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.add('is-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.remove('is-active');
            });
        });

        fileDropArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            handleFiles(files);
        }

        fileInput.addEventListener('change', function () {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                fileName.textContent = files[0].name;
                fileDropArea.classList.add('hidden');
                filePreview.classList.remove('hidden');
            }
        }

        removeFileBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileDropArea.classList.remove('hidden');
            filePreview.classList.add('hidden');
        });

        // Form submission handling
        const registrationForm = document.getElementById('registrationForm');
        const successState = document.getElementById('successState');

        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Validate file
                if (!fileInput.files.length && filePreview.classList.contains('hidden')) {
                    alert('Please upload an ID proof.');
                    return;
                }

                // Simulate saving user data
                const user = {
                    name: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    team: document.getElementById('teamName').value,
                    status: 'pending' // Initial status
                };
                localStorage.setItem('hackathonUser', JSON.stringify(user));

                // Show success state
                registrationForm.style.display = 'none';
                successState.classList.remove('hidden');
            });
        }
    }

    // Dashboard handling
    const dashName = document.getElementById('dashName');
    const dashBadge = document.getElementById('dashBadge');
    const dashMsg = document.getElementById('dashMsg');
    const qrSection = document.getElementById('qrSection');
    const qrCodeImg = document.getElementById('qrCodeImg');

    if (dashName) {
        const storedUser = localStorage.getItem('hackathonUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            dashName.textContent = user.name || 'Participant';

            if (user.status === 'verified') {
                dashBadge.className = 'status-badge verified';
                dashBadge.textContent = 'Verified & Shortlisted';
                dashMsg.textContent = 'Congratulations! Your application has been approved. Please use the QR code below for venue entry.';

                qrSection.classList.remove('hidden');
                // Generate simple mock QR code based on user data
                const qrData = encodeURIComponent(`Hackathon2026_${user.name}_Verified`);
                qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
            } else {
                dashBadge.className = 'status-badge pending';
                dashBadge.textContent = 'Pending Verification';
                dashMsg.textContent = 'Your ID proof is currently being reviewed. Your entry QR code will be generated once verified and shortlisted.';
            }
        }
    }

    // Judge Panel Handling
    const teamSelect = document.getElementById('teamSelect');
    const scoringPanel = document.getElementById('scoringPanel');
    const evalTeamName = document.getElementById('evalTeamName');
    const scoreForm = document.getElementById('scoreForm');

    if (teamSelect) {
        teamSelect.addEventListener('change', (e) => {
            const team = e.target.options[e.target.selectedIndex].text;
            evalTeamName.textContent = team.split(' - ')[0];
            scoringPanel.classList.remove('hidden');

            // Re-calc score when changing team to reset or load existing
            calculateTotal();
        });

        const sliders = document.querySelectorAll('.slider');
        const totalScoreText = document.getElementById('totalScoreText');

        function calculateTotal() {
            let total = 0;
            sliders.forEach(slider => {
                total += parseInt(slider.value);
            });
            totalScoreText.textContent = `${total}/40`;
        }

        sliders.forEach(slider => {
            slider.addEventListener('input', calculateTotal);
        });

        scoreForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect scores
            const teamId = teamSelect.value;
            const teamName = teamSelect.options[teamSelect.selectedIndex].text.split(' - ')[0];
            const scores = {};
            let total = 0;
            sliders.forEach(slider => {
                scores[slider.id] = parseInt(slider.value);
                total += parseInt(slider.value);
            });
            const notes = document.getElementById('feedbackNotes') ? document.getElementById('feedbackNotes').value : '';

            // Save to localStorage
            let hcScores = [];
            try { hcScores = JSON.parse(localStorage.getItem('hcScores') || '[]'); } catch (_) { }
            // Replace if already scored
            const existing = hcScores.findIndex(s => s.teamId === teamId);
            const entry = { teamId, teamName, total, scores, notes, timestamp: new Date().toISOString() };
            if (existing >= 0) hcScores[existing] = entry;
            else hcScores.push(entry);
            localStorage.setItem('hcScores', JSON.stringify(hcScores));

            alert(`Evaluation for "${teamName}" submitted! Total: ${total}/40`);
            scoreForm.reset();
            sliders.forEach(slider => {
                const id = slider.id.replace('score', 'val');
                const el = document.getElementById(id);
                if (el) el.innerText = '0/10';
            });
            calculateTotal();
            scoringPanel.classList.add('hidden');
            teamSelect.value = '';
        });

        // Mock scanner
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => {
                scanBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning...';
                setTimeout(() => {
                    scanBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Scan QR Code';
                    teamSelect.value = 'team1';
                    teamSelect.dispatchEvent(new Event('change'));
                }, 1000);
            });
        }
    }


    // Admin Panel Handling
    const adminTableBody = document.getElementById('adminTableBody');
    if (adminTableBody) {
        const storedUser = localStorage.getItem('hackathonUser');
        const defaultAdminRow = document.getElementById('defaultAdminRow');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.status === 'pending') {
                if (defaultAdminRow) defaultAdminRow.style.display = 'none';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.team || 'N/A'}</td>
                    <td><a href="#" class="id-link"><i class="fa-solid fa-file-image"></i> uploaded_id_proof</a></td>
                    <td><span class="status-badge pending">Pending</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon success" onclick="approveUser(this)"><i class="fa-solid fa-check"></i></button>
                            <button class="btn-icon danger" onclick="this.closest('tr').remove();"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </td>
                `;
                // Insert at the top
                adminTableBody.insertBefore(tr, adminTableBody.firstChild);
            }
        }

        // Globally accessible function for inline onclick
        window.approveUser = function (btn) {
            let user = JSON.parse(localStorage.getItem('hackathonUser'));

            if (user) {
                user.status = 'verified';
                localStorage.setItem('hackathonUser', JSON.stringify(user));
            }

            const tr = btn.closest('tr');
            const statusCell = tr.querySelector('.status-badge');
            statusCell.className = 'status-badge verified';
            statusCell.textContent = 'Verified';
            tr.querySelector('.action-btns').innerHTML = '<span class="text-success"><i class="fa-solid fa-check-double"></i> Approved</span>';

            // update mock counts
            const pendingCount = document.getElementById('pendingCount');
            if (pendingCount) {
                pendingCount.textContent = Math.max(0, parseInt(pendingCount.textContent) - 1);
            }
        }
    }

    // Chatbot functionality
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (chatToggleBtn && chatWindow) {

        // Setup toggle open/close
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.add('active');
            chatToggleBtn.style.transform = 'scale(0)';
        });

        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
            chatToggleBtn.style.transform = 'scale(1)';
        });

        // Add user message
        const addMessage = (text, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${sender}`;
            msgDiv.textContent = text;
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        };

        // Form submission
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const msg = chatInput.value.trim();

                if (msg) {
                    addMessage(msg, 'user');
                    chatInput.value = '';

                    // Mock bot response
                    setTimeout(() => {
                        const responses = [
                            "I can certainly help with that! Let me check the system for you.",
                            "That's a great question. You can find more details in the Dashboard or Admin Center.",
                            "I'm a demo assistant, but in a real event, I would guide you right to the documentation!",
                            "Please make sure you have your QR pass ready if you are checking in."
                        ];
                        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        addMessage(randomResponse, 'bot');
                    }, 1000);
                }
            });
        }

        // Suggestion chips interaction
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.textContent;
                addMessage(text, 'user');

                // Remove suggestions after first click for realism
                const suggestionsBox = e.target.parentElement;
                if (suggestionsBox) {
                    suggestionsBox.style.display = 'none';
                }

                setTimeout(() => {
                    addMessage("I'll pull up the information regarding '" + text + "' right now. (Mock integration)", 'bot');
                }, 800);
            });
        });
    }

});
