// ===== USER DATABASE =====
// In production, use a real backend/database
const users = {
    'admin': 'admin123',
    'client1': 'pass123',
    'client2': 'pass456'
};

// ===== GLOBAL VARIABLES =====
let currentUser = localStorage.getItem('currentUser');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// ===== INITIALIZATION =====
if (currentUser) {
    showDashboard();
} else {
    showLogin();
}

// ===== LOGIN FUNCTIONALITY =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username] === password) {
        localStorage.setItem('currentUser', username);
        currentUser = username;
        showToast('Login successful! Welcome ' + username, 'success');
        setTimeout(() => {
            showDashboard();
        }, 500);
    } else {
        document.getElementById('errorMessage').textContent = '❌ Invalid username or password';
        showToast('Login failed! Please check your credentials', 'error');
    }
});

// ===== LOGOUT FUNCTIONALITY =====
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            showLogin();
        }, 500);
    }
});

// ===== SCREEN MANAGEMENT =====
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('errorMessage').textContent = '';
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('currentUser').textContent = `👤 ${currentUser}`;
    loadTasks();
    updateStatistics();
}

// ===== TASK MANAGEMENT =====

// Add Task
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value.trim(),
        client: document.getElementById('clientName').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        date: document.getElementById('taskDate').value,
        status: document.getElementById('taskStatus').value,
        createdBy: currentUser,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    this.reset();
    loadTasks();
    updateStatistics();
    showToast('✅ Task added successfully!', 'success');
});

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load and display tasks
function loadTasks(filter = 'all') {
    const upcomingTasks = document.getElementById('upcomingTasks');
    const currentTasks = document.getElementById('currentTasks');
    const finishedTasks = document.getElementById('finishedTasks');
    
    // Clear all lists
    upcomingTasks.innerHTML = '';
    currentTasks.innerHTML = '';
    finishedTasks.innerHTML = '';
    
    // Filter tasks
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
    
    // Sort tasks by date
    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Separate tasks by status
    const upcoming = filteredTasks.filter(t => t.status === 'upcoming');
    const current = filteredTasks.filter(t => t.status === 'current');
    const finished = filteredTasks.filter(t => t.status === 'finished');
    
    // Display tasks
    if (upcoming.length === 0) {
        upcomingTasks.innerHTML = '<div class="empty-state">No upcoming tasks</div>';
    } else {
        upcoming.forEach(task => upcomingTasks.appendChild(createTaskCard(task)));
    }
    
    if (current.length === 0) {
        currentTasks.innerHTML = '<div class="empty-state">No current tasks</div>';
    } else {
        current.forEach(task => currentTasks.appendChild(createTaskCard(task)));
    }
    
    if (finished.length === 0) {
        finishedTasks.innerHTML = '<div class="empty-state">No finished tasks</div>';
    } else {
        finished.forEach(task => finishedTasks.appendChild(createTaskCard(task)));
    }
    
    // Update badges
    document.getElementById('upcomingBadge').textContent = upcoming.length;
    document.getElementById('currentBadge').textContent = current.length;
    document.getElementById('finishedBadge').textContent = finished.length;
}

// Create task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    const statusEmoji = {
        'upcoming': '📅',
        'current': '🔄',
        'finished': '✅'
    };
    
    card.innerHTML = `
        <h4>${task.title}</h4>
        <div class="client">${task.client}</div>
        ${task.description ? `<div class="description">${task.description}</div>` : ''}
        <div class="date">📅 Due: ${formatDate(task.date)}</div>
        <div class="task-actions">
            <button class="status-btn" onclick="changeStatus(${task.id})">
                ${statusEmoji[task.status]} Change Status
            </button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                🗑️ Delete
            </button>
        </div>
    `;
    return card;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Change task status
function changeStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const statuses = ['upcoming', 'current', 'finished'];
        const currentIndex = statuses.indexOf(task.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];
        
        task.status = newStatus;
        saveTasks();
        loadTasks();
        updateStatistics();
        
        const statusNames = {
            'upcoming': 'Upcoming',
            'current': 'Current',
            'finished': 'Finished'
        };
        showToast(`Task moved to ${statusNames[newStatus]}`, 'success');
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        loadTasks();
        updateStatistics();
        showToast('Task deleted successfully', 'success');
    }
}

// Update statistics
function updateStatistics() {
    const upcoming = tasks.filter(t => t.status === 'upcoming').length;
    const current = tasks.filter(t => t.status === 'current').length;
    const finished = tasks.filter(t => t.status === 'finished').length;
    
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('currentCount').textContent = current;
    document.getElementById('finishedCount').textContent = finished;
}

// ===== FILTER FUNCTIONALITY =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        loadTasks(this.dataset.filter);
    });
});

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== SET MINIMUM DATE TO TODAY =====
document.getElementById('taskDate').min = new Date().toISOString().split('T')[0];

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus on task title
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('taskTitle').focus();
    }
});

console.log('✅ Content Calendar loaded successfully!');
console.log('📝 Demo credentials: admin/admin123 or client1/pass123');
