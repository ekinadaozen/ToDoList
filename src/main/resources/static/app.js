// State Management
const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    tasks: []
};

// DOM Elements
const els = {
    sections: {
        auth: document.getElementById('auth-section'),
        app: document.getElementById('app-section')
    },
    forms: {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form'),
        task: document.getElementById('task-form')
    },
    inputs: {
        loginEmail: document.getElementById('login-email'),
        loginPass: document.getElementById('login-password'),
        regName: document.getElementById('reg-name'),
        regEmail: document.getElementById('reg-email'),
        regPass: document.getElementById('reg-password'),
        taskId: document.getElementById('task-id'),
        taskTitle: document.getElementById('task-title'),
        taskDesc: document.getElementById('task-desc'),
        taskStatus: document.getElementById('task-status'),
        taskDeadline: document.getElementById('task-deadline')
    },
    buttons: {
        goToReg: document.getElementById('go-to-register'),
        goToLogin: document.getElementById('go-to-login'),
        logout: document.getElementById('btn-logout'),
        addTask: document.getElementById('btn-add-task'),
        closeModal: document.getElementById('btn-close-modal'),
        cancelTask: document.getElementById('btn-cancel-task')
    },
    ui: {
        greeting: document.getElementById('user-greeting'),
        taskStats: document.getElementById('task-stats'),
        lists: {
            TODO: document.getElementById('list-todo'),
            IN_PROGRESS: document.getElementById('list-progress'),
            DONE: document.getElementById('list-done')
        },
        counts: {
            TODO: document.getElementById('count-todo'),
            IN_PROGRESS: document.getElementById('count-progress'),
            DONE: document.getElementById('count-done')
        },
        modal: document.getElementById('task-modal'),
        modalTitle: document.getElementById('modal-title')
    }
};

// API Base
const API_URL = 'http://localhost:8080';

// ================== INITIALIZATION ==================
function init() {
    setupEventListeners();
    checkAuthStatus();
}

function checkAuthStatus() {
    if (state.token && state.user) {
        showApp();
        fetchTasks();
    } else {
        showAuth();
    }
}

// ================== EVENT LISTENERS ==================
function setupEventListeners() {
    // Auth toggles
    els.buttons.goToReg.addEventListener('click', (e) => {
        e.preventDefault();
        els.forms.login.classList.remove('active');
        els.forms.register.classList.add('active');
    });

    els.buttons.goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        els.forms.register.classList.remove('active');
        els.forms.login.classList.add('active');
    });

    // Form Submissions
    els.forms.login.addEventListener('submit', handleLogin);
    els.forms.register.addEventListener('submit', handleRegister);
    els.forms.task.addEventListener('submit', handleTaskSave);

    // App actions
    els.buttons.logout.addEventListener('click', handleLogout);
    els.buttons.addTask.addEventListener('click', () => openModal());
    els.buttons.closeModal.addEventListener('click', closeModal);
    els.buttons.cancelTask.addEventListener('click', closeModal);
}

// ================== AUTH LOGIC ==================
async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: els.inputs.loginEmail.value,
                password: els.inputs.loginPass.value
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            saveAuth(data);
            showToast('Welcome back!', 'success');
            els.inputs.loginEmail.value = '';
            els.inputs.loginPass.value = '';
            checkAuthStatus();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast('Connection error. Is the server running?', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right"></i>';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: els.inputs.regName.value,
                email: els.inputs.regEmail.value,
                password: els.inputs.regPass.value
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            saveAuth(data);
            showToast('Account created successfully!', 'success');
            els.forms.register.reset();
            checkAuthStatus();
        } else {
            const errorMsg = data.errors ? Object.values(data.errors)[0] : data.message;
            showToast(errorMsg || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Connection error.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign Up</span><i class="fa-solid fa-arrow-right"></i>';
    }
}

function handleLogout() {
    state.token = null;
    state.user = null;
    state.tasks = [];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

function saveAuth(data) {
    state.token = data.token;
    state.user = { name: data.fullName, email: data.email };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(state.user));
}

// ================== TASK LOGIC ==================
async function fetchTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (res.status === 401 || res.status === 403) {
            handleLogout();
            showToast('Session expired. Please login again.', 'error');
            return;
        }

        const data = await res.json();
        if (res.ok) {
            state.tasks = data;
            renderTasks();
        }
    } catch (err) {
        showToast('Failed to load tasks', 'error');
    }
}

async function handleTaskSave(e) {
    e.preventDefault();
    const isEdit = els.inputs.taskId.value !== '';
    const endpoint = isEdit ? `/tasks/${els.inputs.taskId.value}` : '/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
        title: els.inputs.taskTitle.value,
        description: els.inputs.taskDesc.value,
        status: els.inputs.taskStatus.value,
        deadline: els.inputs.taskDeadline.value || null
    };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast(isEdit ? 'Task updated!' : 'Task created!', 'success');
            closeModal();
            fetchTasks();
        } else {
            const data = await res.json();
            showToast(data.message || 'Error saving task', 'error');
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
}

async function deleteTask(id) {
    if(!confirm('Are you sure you want to delete this task?')) return;

    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (res.ok) {
            showToast('Task deleted', 'success');
            fetchTasks();
        } else {
            showToast('Failed to delete task', 'error');
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
}

async function updateTaskStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            fetchTasks();
        }
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
}

// ================== UI RENDERING ==================
function renderTasks() {
    // Clear lists
    els.ui.lists.TODO.innerHTML = '';
    els.ui.lists.IN_PROGRESS.innerHTML = '';
    els.ui.lists.DONE.innerHTML = '';

    let counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };

    state.tasks.forEach(task => {
        const listEl = els.ui.lists[task.status];
        if (listEl) {
            listEl.appendChild(createTaskCard(task));
            counts[task.status]++;
        }
    });

    // Update counts
    els.ui.counts.TODO.textContent = counts.TODO;
    els.ui.counts.IN_PROGRESS.textContent = counts.IN_PROGRESS;
    els.ui.counts.DONE.textContent = counts.DONE;

    // Update total
    els.ui.taskStats.textContent = `You have ${state.tasks.length} total tasks.`;
}

function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    
    // Format date
    let dateHtml = '';
    if (task.deadline) {
        const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'DONE';
        dateHtml = `<div class="task-date ${isOverdue ? 'overdue' : ''}">
            <i class="fa-regular fa-calendar"></i>
            <span>${task.deadline}</span>
        </div>`;
    }

    // Status toggle buttons logic
    let statusBtns = '';
    if (task.status === 'TODO') {
        statusBtns = `<button onclick="updateTaskStatus(${task.id}, 'IN_PROGRESS')" class="btn-icon" title="Start"><i class="fa-solid fa-play"></i></button>`;
    } else if (task.status === 'IN_PROGRESS') {
        statusBtns = `<button onclick="updateTaskStatus(${task.id}, 'DONE')" class="btn-icon" title="Complete"><i class="fa-solid fa-check"></i></button>`;
    }

    div.innerHTML = `
        <h4 class="task-title">${task.title}</h4>
        ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
        <div class="task-footer">
            ${dateHtml}
            <div class="task-actions">
                ${statusBtns}
                <button onclick="openModal(${task.id})" class="btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTask(${task.id})" class="btn-icon btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;

    return div;
}

// ================== HELPERS ==================
function showAuth() {
    els.sections.app.classList.remove('active');
    els.sections.auth.classList.add('active');
}

function showApp() {
    els.sections.auth.classList.remove('active');
    els.sections.app.classList.add('active');
    els.ui.greeting.textContent = `Hello, ${state.user.name.split(' ')[0]}`;
}

function openModal(taskId = null) {
    els.forms.task.reset();
    els.inputs.taskId.value = '';
    
    if (taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            els.ui.modalTitle.textContent = 'Edit Task';
            els.inputs.taskId.value = task.id;
            els.inputs.taskTitle.value = task.title;
            els.inputs.taskDesc.value = task.description || '';
            els.inputs.taskStatus.value = task.status;
            els.inputs.taskDeadline.value = task.deadline || '';
        }
    } else {
        els.ui.modalTitle.textContent = 'Create Task';
    }
    
    els.ui.modal.classList.add('active');
}

function closeModal() {
    els.ui.modal.classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global functions for inline HTML onclick handlers
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;
window.openModal = openModal;

// Start App
init();
