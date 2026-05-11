// 1. User Database
const users = {
    'admin': 'admin123',
    'client1': 'pass123',
    'client2': 'pass456'
};

let currentUser = localStorage.getItem('currentUser');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 2. Auth Logic
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    if(users[u] && users[u] === p) {
        currentUser = u;
        localStorage.setItem('currentUser', u);
        location.reload();
    } else {
        document.getElementById('errorMessage').textContent = "Invalid Credentials";
    }
});

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('currentUser');
    location.reload();
};

// 3. View Logic
function init() {
    if(!currentUser) return;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = `👤 ${currentUser}`;
    
    if(currentUser === 'admin') document.getElementById('adminSection').classList.remove('hidden');
    
    renderList();
    renderCalendar();
}

function getMyTasks() {
    return currentUser === 'admin' ? tasks : tasks.filter(t => t.client === currentUser);
}

// 4. Render Functions
function renderList() {
    const myTasks = getMyTasks();
    const cols = { upcoming: 'upcomingTasks', current: 'currentTasks', finished: 'finishedTasks' };
    
    Object.values(cols).forEach(id => document.getElementById(id).innerHTML = '');
    
    myTasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'task-pill';
        div.innerHTML = `
            <strong>${t.title}</strong><br><small>${t.platform}</small>
            <div class="pill-links">
                ${t.canvaLink ? `<a href="${t.canvaLink}" target="_blank">Canva</a>` : ''}
                ${t.postLink ? `<a href="${t.postLink}" target="_blank">Post</a>` : ''}
            </div>
        `;
        document.getElementById(cols[t.status]).appendChild(div);
    });
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    const now = new Date();
    document.getElementById('calendarTitle').textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const myTasks = getMyTasks();

    for(let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayTasks = myTasks.filter(t => t.date === dateStr);
        
        const dayBox = document.createElement('div');
        dayBox.className = 'calendar-day';
        dayBox.innerHTML = `<div class="day-num">${i}</div>`;
        
        dayTasks.forEach(t => {
            dayBox.innerHTML += `<div class="task-pill" style="font-size:9px">${t.title}</div>`;
        });
        grid.appendChild(dayBox);
    }
}

// 5. Form Handling
document.getElementById('taskForm').onsubmit = (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        client: document.getElementById('clientName').value,
        date: document.getElementById('taskDate').value,
        platform: document.getElementById('platformType').value,
        canvaLink: document.getElementById('canvaLink').value,
        postLink: document.getElementById('postLink').value,
        status: document.getElementById('taskStatus').value
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderList();
    renderCalendar();
    e.target.reset();
};

// 6. Navigation
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
