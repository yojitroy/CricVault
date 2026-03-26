document.addEventListener('DOMContentLoaded', () => {
    // Basic Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                if(view.id === `view-${targetView}`) {
                    view.classList.add('active');
                }
            });

            // Update title
            viewTitle.textContent = item.textContent.trim();
        });
    });

    // Initialize Dashboard Data
    initApp();
});

function initApp() {
    // KPIs
    document.getElementById('kpi-teams').textContent = IPL_DATA.teams.length;
    document.getElementById('kpi-players').textContent = IPL_DATA.players.length;
    document.getElementById('kpi-matches').textContent = IPL_DATA.matches.length;

    // Highest Run Scorer (Orange Cap)
    const orangeCap = [...IPL_DATA.players].sort((a,b) => b.stats.runs - a.stats.runs)[0];
    document.getElementById('kpi-orangecap').textContent = orangeCap.name;
    document.getElementById('leader-runs-name').textContent = orangeCap.name;
    document.getElementById('leader-runs-val').textContent = orangeCap.stats.runs;

    // Highest Wicket Taker (Purple Cap)
    const purpleCap = [...IPL_DATA.players].sort((a,b) => b.stats.wickets - a.stats.wickets)[0];
    document.getElementById('leader-wkts-name').textContent = purpleCap.name;
    document.getElementById('leader-wkts-val').textContent = purpleCap.stats.wickets;

    // Best All Rounder (Runs + Wickets approx heuristic, or just manual logic)
    const bestAR = [...IPL_DATA.players].sort((a,b) => (b.stats.runs + b.stats.wickets*20) - (a.stats.runs + a.stats.wickets*20))[0];
    document.getElementById('leader-ar-name').textContent = bestAR.name;

    // Render Tables
    renderTeams();
    renderPlayers();
    renderMatches();
    renderPointsTable();

    // Player Search & Filter
    document.getElementById('search-player').addEventListener('input', renderPlayers);
    document.getElementById('filter-role').addEventListener('change', renderPlayers);
}

// Team colour accents (one per team id)
const TEAM_COLORS = {
    CSK: '#f5c518', MI: '#004c97', RCB: '#ec1c24', KKR: '#3a225d',
    SRH: '#f26522', DC: '#17479e', RR: '#ea1a85', GT: '#1c1c4b',
    LSG: '#a4262c', PBKS: '#d71920'
};

function renderTeams() {
    const grid = document.getElementById('team-tiles-grid');
    grid.innerHTML = IPL_DATA.teams.map(t => {
        const color = TEAM_COLORS[t.id] || '#3b82f6';
        const playerCount = IPL_DATA.players.filter(p => p.team === t.id).length;
        return `
        <div class="team-tile" data-team="${t.id}" onclick="showTeamPlayers('${t.id}')" style="--tile-color:${color};">
            <div class="team-tile-badge">${t.id}</div>
            <h3 class="team-tile-name">${t.name}</h3>
            <p class="team-tile-meta"><i class="fa-solid fa-user-group"></i> ${playerCount} Players</p>
            <p class="team-tile-meta"><i class="fa-solid fa-person-chalkboard"></i> ${t.coach}</p>
            <p class="team-tile-meta small"><i class="fa-solid fa-location-dot"></i> ${t.ground}</p>
            <div class="team-tile-cta">View Squad <i class="fa-solid fa-arrow-right"></i></div>
        </div>`;
    }).join('');

    document.getElementById('team-panel-close').addEventListener('click', () => {
        document.getElementById('team-players-panel').style.display = 'none';
        document.querySelectorAll('.team-tile').forEach(t => t.classList.remove('active'));
    });
}

function showTeamPlayers(teamId) {
    const team = IPL_DATA.teams.find(t => t.id === teamId);
    const players = IPL_DATA.players.filter(p => p.team === teamId);

    // Highlight active tile
    document.querySelectorAll('.team-tile').forEach(t => {
        t.classList.toggle('active', t.dataset.team === teamId);
    });

    // Populate panel header
    document.getElementById('team-panel-name').textContent = team.name;
    document.getElementById('team-panel-meta').textContent =
        `Coach: ${team.coach}  •  Home: ${team.ground}`;

    // Populate player rows (group by role)
    const roleOrder = ['batsman', 'all-rounder', 'bowler', 'wicket-keeper'];
    const sorted = [...players].sort((a, b) =>
        roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name));

    document.getElementById('team-players-tbody').innerHTML = sorted.map((p, i) => {
        const priceCr = (p.price / 10000000).toFixed(2);
        const roleColors = {
            'batsman': '#f59e0b', 'bowler': '#3b82f6',
            'all-rounder': '#10b981', 'wicket-keeper': '#a78bfa'
        };
        const rc = roleColors[p.role] || '#888';
        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${p.name}</strong></td>
            <td><span style="background:${rc}22;color:${rc};border:1px solid ${rc}55;padding:3px 8px;border-radius:4px;font-size:0.8em;text-transform:capitalize;">${p.role}</span></td>
            <td>₹${priceCr} Cr</td>
        </tr>`;
    }).join('');

    const panel = document.getElementById('team-players-panel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderPlayers() {
    const search = document.getElementById('search-player').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;
    
    const filtered = IPL_DATA.players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesRole = roleFilter === '' || p.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const tbody = document.querySelector('#table-players tbody');
    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td style="text-transform: capitalize;">${p.role}</td>
            <td><span style="background: rgba(59, 130, 246, 0.2); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.5);">${p.team}</span></td>
        </tr>
    `).join('');
}

function renderMatches() {
    const tbody = document.querySelector('#table-matches tbody');
    tbody.innerHTML = IPL_DATA.matches.map(m => `
        <tr>
            <td><strong>${m.id}</strong></td>
            <td>${m.date}</td>
            <td>${m.team1}</td>
            <td>${m.team2}</td>
            <td>${m.venue}</td>
            <td><strong style="color: #10b981;">${m.winner}</strong></td>
        </tr>
    `).join('');
}

function renderPointsTable() {
    const sortedPts = [...IPL_DATA.pointsTable].sort((a,b) => {
        if(b.points !== a.points) return b.points - a.points;
        return b.nrr - a.nrr;
    });

    // Populate main points table
    const tbody = document.querySelector('#table-pointstable tbody');
    tbody.innerHTML = sortedPts.map((t, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${t.team}</strong></td>
            <td>${t.played}</td>
            <td>${t.won}</td>
            <td>${t.lost}</td>
            <td style="color: #3b82f6; font-weight: bold;">${t.points}</td>
            <td style="color: ${t.nrr > 0 ? '#10b981' : t.nrr < 0 ? '#ef4444' : '#94a3b8'}; font-weight:600;">${t.nrr > 0 ? '+' : ''}${t.nrr.toFixed(3)}</td>
        </tr>
    `).join('');

    // Populate dashboard top 4 teams
    const dashBody = document.querySelector('#dash-top-teams');
    dashBody.innerHTML = sortedPts.slice(0,4).map((t, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${t.team}</strong></td>
            <td>${t.points}</td>
            <td>${t.nrr > 0 ? '+'+t.nrr.toFixed(3) : t.nrr.toFixed(3)}</td>
        </tr>
    `).join('');
}
