const API = 'http://localhost:5003/api';

// ══════════════════════════════════════════
//  AUTH HELPERS
// ══════════════════════════════════════════

function showTab(tab) {
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

async function register() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const msg      = document.getElementById('register-msg');

  msg.textContent = '';
  if (!name || !email || !password) { msg.textContent = 'Please fill all fields'; return; }
  if (password.length < 6) { msg.textContent = 'Password must be at least 6 characters'; return; }

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      msg.textContent = data.message || 'Registration failed';
    }
  } catch {
    msg.textContent = 'Cannot connect to server. Make sure the backend is running.';
  }
}

async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msg      = document.getElementById('login-msg');

  msg.textContent = '';
  if (!email || !password) { msg.textContent = 'Please fill all fields'; return; }

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      msg.textContent = data.message || 'Login failed';
    }
  } catch {
    msg.textContent = 'Cannot connect to server. Make sure the backend is running.';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Allow Enter key on auth forms
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (document.getElementById('login-form')    && document.getElementById('login-form').style.display !== 'none')    login();
  if (document.getElementById('register-form') && document.getElementById('register-form').style.display !== 'none') register();
});

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════

const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || '{}');
let allTasks   = [];
let activeFilter = 'All';

if (document.getElementById('user-name')) {
  if (!token) { window.location.href = 'index.html'; }
  else {
    document.getElementById('user-name').textContent = '👋 ' + (user.name || 'Student');
    loadTasks();
  }
}

async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) { logout(); return; }
    allTasks = await res.json();
    updateStats();
    renderTasks();
  } catch {
    document.getElementById('task-list').innerHTML =
      '<p class="empty-state">⚠️ Cannot connect to server. Is the backend running on port 5000?</p>';
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent      = allTasks.length;
  document.getElementById('stat-pending').textContent    = allTasks.filter(t => t.status === 'Pending').length;
  document.getElementById('stat-inprogress').textContent = allTasks.filter(t => t.status === 'In Progress').length;
  document.getElementById('stat-done').textContent       = allTasks.filter(t => t.status === 'Completed').length;
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const filtered = activeFilter === 'All' ? allTasks : allTasks.filter(t => t.status === activeFilter);

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>${activeFilter === 'All' ? 'No tasks yet. Add your first task above!' : 'No tasks with status: ' + activeFilter}</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(task => {
    const due      = task.dueDate ? '📅 ' + task.dueDate.slice(0, 10) : '';
    const isDone   = task.status === 'Completed';
    const statusKey = task.status.replace(' ', '');
    return `
      <div class="task-card ${task.priority} ${isDone ? 'done' : ''}">
        <div class="task-info">
          <h3 class="${isDone ? 'completed-title' : ''}">${task.title}</h3>
          ${task.description ? `<p>${task.description}</p>` : ''}
          ${due ? `<p>${due}</p>` : ''}
          <div class="badges">
            <span class="badge badge-${task.priority}">${task.priority}</span>
            <span class="badge badge-${statusKey}">${task.status}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-done"  onclick="toggleDone('${task._id}', '${task.status}')">${isDone ? '↩ Undo' : '✔ Done'}</button>
          <button class="btn-edit"  onclick="openEdit(${JSON.stringify(task).replace(/"/g, '&quot;')})">✏️ Edit</button>
          <button class="btn-del"   onclick="deleteTask('${task._id}')">🗑</button>
        </div>
      </div>`;
  }).join('');
}

async function addTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) { alert('Task title is required!'); return; }

  const body = {
    title,
    description: document.getElementById('task-desc').value.trim(),
    dueDate:     document.getElementById('task-due').value || undefined,
    priority:    document.getElementById('task-priority').value,
    status:      document.getElementById('task-status').value
  };

  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });

  // Clear form
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value  = '';
  document.getElementById('task-due').value   = '';
  loadTasks();
}

async function toggleDone(id, currentStatus) {
  const next = currentStatus === 'Completed' ? 'Pending' : 'Completed';
  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: next })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`${API}/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadTasks();
}

// ── EDIT MODAL ──────────────────────────────────

function openEdit(task) {
  document.getElementById('edit-id').value       = task._id;
  document.getElementById('edit-title').value    = task.title;
  document.getElementById('edit-desc').value     = task.description || '';
  document.getElementById('edit-due').value      = task.dueDate ? task.dueDate.slice(0, 10) : '';
  document.getElementById('edit-priority').value = task.priority;
  document.getElementById('edit-status').value   = task.status;
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const body = {
    title:       document.getElementById('edit-title').value.trim(),
    description: document.getElementById('edit-desc').value.trim(),
    dueDate:     document.getElementById('edit-due').value || undefined,
    priority:    document.getElementById('edit-priority').value,
    status:      document.getElementById('edit-status').value
  };

  if (!body.title) { alert('Title is required'); return; }

  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });

  closeModal();
  loadTasks();
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.id === 'edit-modal') closeModal();
});
