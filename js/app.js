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

function renderTeams() {
    const tbody = document.querySelector('#table-teams tbody');
    tbody.innerHTML = IPL_DATA.teams.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.name}</td>
            <td>${t.coach}</td>
            <td>${t.ground}</td>
        </tr>
    `).join('');
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
            <td>${t.nrr.toFixed(3)}</td>
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
