const users = { 'admin': 'admin123', 'client1': 'pass123' };
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = localStorage.getItem('currentUser');

// Auth Init
if (currentUser) initDashboard();

document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (users[u] === p) {
        localStorage.setItem('currentUser', u);
        location.reload();
    }
};

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('currentUser');
    location.reload();
};

function initDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = currentUser;
    document.getElementById('avatarLetter').textContent = currentUser[0].toUpperCase();
    
    if (currentUser !== 'admin') {
        document.getElementById('adminOnlyAction').classList.add('hidden');
    }
    renderContent();
}

function renderContent() {
    const myTasks = currentUser === 'admin' ? tasks : tasks.filter(t => t.client === currentUser);
    
    // Kanban Render
    const cols = { upcoming: 'upcomingTasks', current: 'currentTasks', finished: 'finishedTasks' };
    Object.values(cols).forEach(id => document.getElementById(id).innerHTML = '');
    
    myTasks.forEach(t => {
        const html = `
            <div class="task-card">
                <div style="font-size: 0.7rem; color: var(--primary); font-weight: 800; margin-bottom: 0.5rem;">${t.platform.toUpperCase()}</div>
                <h4 style="margin-bottom: 1rem;">${t.title}</h4>
                <div style="display: flex; gap: 10px;">
                    ${t.canvaLink ? `<a href="${t.canvaLink}" target="_blank" style="text-decoration:none; font-size:12px;">🎨 Canva</a>` : ''}
                    ${t.postLink ? `<a href="${t.postLink}" target="_blank" style="text-decoration:none; font-size:12px;">🔗 Post</a>` : ''}
                </div>
            </div>`;
        document.getElementById(cols[t.status]).insertAdjacentHTML('beforeend', html);
    });

    // Calendar Render
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    for(let i=1; i<=30; i++) {
        grid.innerHTML += `<div class="calendar-day"><span style="font-size:11px; opacity:0.5">${i}</span></div>`;
    }
}

function toggleTaskForm() {
    document.getElementById('taskFormOverlay').classList.toggle('hidden');
}

document.getElementById('taskForm').onsubmit = (e) => {
    e.preventDefault();
    tasks.push({
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        client: document.getElementById('clientName').value,
        date: document.getElementById('taskDate').value,
        platform: document.getElementById('platformType').value,
        canvaLink: document.getElementById('canvaLink').value,
        postLink: document.getElementById('postLink').value,
        status: document.getElementById('taskStatus').value
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    toggleTaskForm();
    renderContent();
};

// View Switch
document.getElementById('btnCalendarView').onclick = () => {
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('calendarView').classList.remove('hidden');
    document.getElementById('btnCalendarView').classList.add('active');
    document.getElementById('btnListView').classList.remove('active');
    document.getElementById('viewTitle').textContent = "Monthly Schedule";
};

document.getElementById('btnListView').onclick = () => {
    document.getElementById('calendarView').classList.add('hidden');
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('btnListView').classList.add('active');
    document.getElementById('btnCalendarView').classList.remove('active');
    document.getElementById('viewTitle').textContent = "Workflow Overview";
};
