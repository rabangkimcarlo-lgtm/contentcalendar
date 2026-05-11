const users = { 'admin': 'admin123', 'client1': 'pass123' };
let currentUser = localStorage.getItem('currentUser');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 1. Auth Flow
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(users[u] === p) {
        localStorage.setItem('currentUser', u);
        location.reload();
    } else {
        document.getElementById('errorMessage').textContent = "Access Denied. Check credentials.";
    }
};

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('currentUser');
    location.reload();
};

// 2. Initialization
function init() {
    if(!currentUser) return;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = `Hi, ${currentUser}`;
    
    if(currentUser === 'admin') document.getElementById('adminSection').classList.remove('hidden');
    
    renderAll();
}

function renderAll() {
    const myTasks = currentUser === 'admin' ? tasks : tasks.filter(t => t.client === currentUser);
    
    // Render Kanban
    const cols = { upcoming: 'upcomingTasks', current: 'currentTasks', finished: 'finishedTasks' };
    Object.values(cols).forEach(id => document.getElementById(id).innerHTML = '');
    
    myTasks.forEach(t => {
        const card = `
            <div class="task-card">
                <span class="platform-tag ${t.platform}">${t.platform}</span>
                <h4>${t.title}</h4>
                <div class="pill-links" style="margin-top:10px; display:flex; gap:10px;">
                    ${t.canvaLink ? `<a href="${t.canvaLink}" target="_blank" style="font-size:12px; color:blue; text-decoration:none">🎨 Canva</a>` : ''}
                    ${t.postLink ? `<a href="${t.postLink}" target="_blank" style="font-size:12px; color:green; text-decoration:none">🔗 Live Link</a>` : ''}
                </div>
            </div>`;
        document.getElementById(cols[t.status]).insertAdjacentHTML('beforeend', card);
    });

    // Render Calendar
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    const now = new Date();
    document.getElementById('calendarTitle').textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for(let i = 1; i <= days; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayTasks = myTasks.filter(t => t.date === dateStr);
        
        let taskHTML = dayTasks.map(t => `<div style="font-size:8px; background:#eef2ff; padding:2px; margin-top:2px; border-radius:3px">${t.title}</div>`).join('');
        
        grid.innerHTML += `<div class="calendar-day"><span style="font-size:10px; font-weight:700; color:#cbd5e1">${i}</span>${taskHTML}</div>`;
    }
}

// 3. New Task Logic
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
    renderAll();
    e.target.reset();
};

// 4. Tab Switching
document.getElementById('btnListView').onclick = () => {
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('calendarView').classList.add('hidden');
    document.getElementById('btnListView').classList.add('active');
    document.getElementById('btnCalendarView').classList.remove('active');
};

document.getElementById('btnCalendarView').onclick = () => {
    document.getElementById('calendarView').classList.remove('hidden');
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('btnCalendarView').classList.add('active');
    document.getElementById('btnListView').classList.remove('active');
};

init();
