// ============================================================
//  HackConnect — Admin Team Dashboard Logic
// ============================================================

// Seed mock teams so the admin dashboard is never empty
const MOCK_TEAMS = [
    { id: 'team1', teamName: 'Code Ninjas', memberName: 'Arjun Mehta', email: 'arjun@demo.com', status: 'verified' },
    { id: 'team2', teamName: 'Cyber Punx', memberName: 'Priya Sharma', email: 'priya@demo.com', status: 'verified' },
    { id: 'team3', teamName: 'Bit Wizards', memberName: 'Rohan Das', email: 'rohan@demo.com', status: 'pending' },
    { id: 'team4', teamName: 'Dev Storm', memberName: 'Sneha Rao', email: 'sneha@demo.com', status: 'pending' },
    { id: 'team5', teamName: 'Quantum IO', memberName: 'Kiran Patel', email: 'kiran@demo.com', status: 'rejected' },
];

const MOCK_SCORES = [
    { teamId: 'team1', teamName: 'Code Ninjas', total: 36, scores: { scoreInnovation: 9, scoreTech: 9, scoreDesign: 9, scoreBusiness: 9 }, notes: 'Excellent AI solution.' },
    { teamId: 'team2', teamName: 'Cyber Punx', total: 31, scores: { scoreInnovation: 8, scoreTech: 8, scoreDesign: 7, scoreBusiness: 8 }, notes: 'Strong backend work.' },
    { teamId: 'team3', teamName: 'Bit Wizards', total: 28, scores: { scoreInnovation: 7, scoreTech: 7, scoreDesign: 7, scoreBusiness: 7 }, notes: 'Good creativity.' },
];

// Merge localStorage data with mocks
function getAllTeams() {
    // Start with mock teams
    const teams = MOCK_TEAMS.map(t => ({ ...t }));

    // Pull statuses from localStorage (admin's approve/reject actions on admin.html)
    let storedStatuses = {};
    try { storedStatuses = JSON.parse(localStorage.getItem('hcTeamStatuses') || '{}'); } catch (_) { }
    teams.forEach(t => {
        if (storedStatuses[t.id]) t.status = storedStatuses[t.id];
    });

    // Add real registered user if they have a different email
    const realUser = (() => { try { return JSON.parse(localStorage.getItem('hackathonUser') || 'null'); } catch (_) { return null; } })();
    if (realUser && realUser.email) {
        const alreadyExists = teams.some(t => t.email === realUser.email);
        if (!alreadyExists) {
            teams.unshift({
                id: 'user_' + realUser.email,
                teamName: realUser.team || realUser.name + "'s Team",
                memberName: realUser.name,
                email: realUser.email,
                status: realUser.status || 'pending',
            });
        }
    }
    return teams;
}

function getAllScores() {
    let scores = [...MOCK_SCORES];
    let realScores = [];
    try { realScores = JSON.parse(localStorage.getItem('hcScores') || '[]'); } catch (_) { }
    // Merge: real scores override mocks by teamId
    realScores.forEach(rs => {
        const idx = scores.findIndex(s => s.teamId === rs.teamId);
        if (idx >= 0) scores[idx] = rs;
        else scores.push(rs);
    });
    return scores.sort((a, b) => b.total - a.total);
}

// ---- Render stats ----
function renderStats(teams, scores) {
    document.getElementById('totalTeams').textContent = teams.length;
    document.getElementById('verifiedCount').textContent = teams.filter(t => t.status === 'verified').length;
    document.getElementById('pendingCountTD').textContent = teams.filter(t => t.status === 'pending').length;
    document.getElementById('scoredCount').textContent = scores.length;
}

// ---- Render team table ----
let allTeams = [];
function renderTeamTable(filter = 'all') {
    const tbody = document.getElementById('teamTableBody');
    if (!tbody) return;

    const scores = getAllScores();
    const scoreMap = {};
    scores.forEach(s => scoreMap[s.teamId] = s.total);

    const filtered = filter === 'all' ? allTeams : allTeams.filter(t => t.status === filter);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="td-empty">No teams match this filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((team, idx) => {
        const scoreBadge = scoreMap[team.id] !== undefined
            ? `<span class="score-pill">${scoreMap[team.id]}/40</span>`
            : `<span class="score-pill unscored">—</span>`;

        const statusBadge = {
            verified: `<span class="status-badge verified">Verified</span>`,
            pending: `<span class="status-badge pending">Pending</span>`,
            rejected: `<span class="status-badge rejected">Rejected</span>`,
        }[team.status] || `<span class="status-badge pending">Pending</span>`;

        const actions = team.status !== 'verified'
            ? `<button class="btn-icon success td-btn" onclick="updateStatus('${team.id}', 'verified')" title="Verify"><i class="fa-solid fa-check"></i></button>`
            : `<button class="btn-icon warning td-btn" onclick="updateStatus('${team.id}', 'pending')" title="Unverify"><i class="fa-solid fa-rotate-left"></i></button>`;

        return `<tr class="td-row" data-id="${team.id}">
            <td class="td-num">${idx + 1}</td>
            <td>
                <div class="team-cell">
                    <span class="team-name">${team.teamName}</span>
                    <span class="member-name">${team.memberName}</span>
                </div>
            </td>
            <td>${statusBadge}</td>
            <td>${scoreBadge}</td>
            <td>
                <div class="action-btns">
                    ${actions}
                    <button class="btn-icon danger td-btn" onclick="updateStatus('${team.id}', 'rejected')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ---- Render leaderboard ----
function renderLeaderboard() {
    const scores = getAllScores();
    const lb = document.getElementById('leaderboardBody');
    if (!lb) return;

    if (scores.length === 0) {
        lb.innerHTML = `<p class="td-empty">No scores submitted yet. Use the Judge Panel to evaluate teams.</p>`;
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    lb.innerHTML = scores.map((s, i) => {
        const pct = Math.round((s.total / 40) * 100);
        const medal = medals[i] || `#${i + 1}`;
        const barColor = i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent)' : '#a855f7';
        return `
        <div class="lb-item ${i === 0 ? 'lb-winner' : ''}">
            <div class="lb-rank">${medal}</div>
            <div class="lb-info">
                <div class="lb-name">${s.teamName}</div>
                <div class="lb-bar-wrap">
                    <div class="lb-bar" style="width:${pct}%;background:${barColor}"></div>
                </div>
                ${s.notes ? `<div class="lb-notes">"${s.notes}"</div>` : ''}
            </div>
            <div class="lb-score">${s.total}<span>/40</span></div>
        </div>`;
    }).join('');

    // Score breakdown for top team
    const top = scores[0];
    const breakdown = document.getElementById('scoreBreakdown');
    if (!breakdown) return;

    const criteria = [
        { key: 'scoreInnovation', label: 'Innovation', icon: 'fa-lightbulb' },
        { key: 'scoreTech', label: 'Technical', icon: 'fa-code' },
        { key: 'scoreDesign', label: 'Design/UX', icon: 'fa-palette' },
        { key: 'scoreBusiness', label: 'Business', icon: 'fa-briefcase' },
    ];

    breakdown.innerHTML = `
        <div class="breakdown-title">Best: <strong>${top.teamName}</strong></div>
        ${criteria.map(c => {
        const val = top.scores ? (top.scores[c.key] || 0) : 0;
        return `
            <div class="breakdown-row">
                <span class="bd-label"><i class="fa-solid ${c.icon}"></i> ${c.label}</span>
                <div class="bd-bar-wrap">
                    <div class="bd-bar" style="width:${val * 10}%"></div>
                </div>
                <span class="bd-val">${val}/10</span>
            </div>`;
    }).join('')}`;
}

// ---- Status update ----
function updateStatus(teamId, status) {
    let storedStatuses = {};
    try { storedStatuses = JSON.parse(localStorage.getItem('hcTeamStatuses') || '{}'); } catch (_) { }
    storedStatuses[teamId] = status;
    localStorage.setItem('hcTeamStatuses', JSON.stringify(storedStatuses));

    // Also update hackathonUser if it's the real user
    const realUser = (() => { try { return JSON.parse(localStorage.getItem('hackathonUser') || 'null'); } catch (_) { return null; } })();
    if (realUser && teamId === 'user_' + realUser.email) {
        realUser.status = status;
        localStorage.setItem('hackathonUser', JSON.stringify(realUser));
    }
    // Refresh tables
    allTeams = getAllTeams();
    renderStats(allTeams, getAllScores());
    filterTeams();
}

function filterTeams() {
    const val = document.getElementById('statusFilter')?.value || 'all';
    renderTeamTable(val);
}

function exportCSV() {
    const scores = getAllScores();
    const scoreMap = {};
    scores.forEach(s => scoreMap[s.teamId] = s.total);

    const rows = [['#', 'Team Name', 'Member', 'Status', 'Score']];
    allTeams.forEach((t, i) => {
        rows.push([i + 1, t.teamName, t.memberName, t.status, scoreMap[t.id] ?? 'N/A']);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hackconnect_teams.csv';
    a.click();
}

function loadData() {
    allTeams = getAllTeams();
    const scores = getAllScores();
    renderStats(allTeams, scores);
    renderTeamTable();
    renderLeaderboard();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', loadData);
