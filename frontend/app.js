// app.js
// Every function here does the SAME kind of thing:
// call the backend with fetch() -> get JSON back -> update the page.
// Change this if your backend runs on a different port.
const API = 'https://hostel-backend-blond.vercel.app/api';

// ---------- SCREEN SWITCHING ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function showSignup() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
}
function showLogin() {
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

// ---------- ON PAGE LOAD: check if already logged in ----------
window.onload = async () => {
  const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
  const data = await res.json();

  if (data.user) {
    goToDashboard(data.user);
  } else {
    showScreen('auth-screen');
  }
};

function goToDashboard(user) {
  if (user.role === 'admin') {
    showScreen('admin-screen');
    loadAllComplaints();
  } else {
    showScreen('student-screen');
    document.getElementById('student-name').innerText = user.name;
    loadMyComplaints();
  }
}

// ---------- SIGNUP ----------
async function signup() {
  const body = {
    name: document.getElementById('signup-name').value,
    email: document.getElementById('signup-email').value,
    password: document.getElementById('signup-password').value,
    role: 'student', // public signup only ever creates students; admin is created via create-admin.js
  };

  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.success) {
    showLogin();
    document.getElementById('auth-message').innerText = 'Account created! Please login.';
    document.getElementById('auth-message').style.color = 'green';
  } else {
    document.getElementById('auth-message').innerText = data.message;
  }
}

// ---------- LOGIN ----------
async function login() {
  const body = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  };

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // needed so the session cookie is saved
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.success) {
    goToDashboard(data.user);
  } else {
    document.getElementById('auth-message').innerText = data.message;
  }
}

// ---------- LOGOUT ----------
async function logout() {
  await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
}

// ---------- SUBMIT COMPLAINT (student) ----------
async function submitComplaint() {
  const body = {
    room_number: document.getElementById('room-number').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
  };

  document.getElementById('submit-message').style.color = '#1e3a8a';
  document.getElementById('submit-message').innerText = 'Analyzing with AI...';

  const res = await fetch(`${API}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.success) {
    document.getElementById('submit-message').style.color = 'green';
    document.getElementById('submit-message').innerText =
      `Submitted! AI marked this as: ${data.complaint.priority}`;
    document.getElementById('description').value = '';
    document.getElementById('room-number').value = '';
    loadMyComplaints();
  } else {
    document.getElementById('submit-message').style.color = 'red';
    document.getElementById('submit-message').innerText = data.message;
  }
}

// ---------- LOAD MY COMPLAINTS (student) ----------
async function loadMyComplaints() {
  const res = await fetch(`${API}/complaints/mine`, { credentials: 'include' });
  const data = await res.json();

  const list = document.getElementById('my-complaints-list');
  list.innerHTML = '';

  data.complaints.forEach(c => {
    // Students can only delete a complaint while it's still Pending
    const deleteButton = c.status === 'Pending'
      ? `<button class="delete-btn" onclick="deleteComplaint(${c.id})">🗑️ Delete</button>`
      : '';

    list.innerHTML += `
      <div class="complaint-item">
        <div class="row">
          <strong>Room ${c.room_number} — ${c.category}</strong>
          <span class="badge ${c.priority === 'Urgent' ? 'urgent' : 'normal'}">${c.priority}</span>
        </div>
        <p>${c.description}</p>
        <div class="row">
          <span class="status-${c.status.toLowerCase().replace(' ', '-')}">Status: ${c.status}</span>
          ${deleteButton}
        </div>
      </div>
    `;
  });
}

// ---------- DELETE MY COMPLAINT (student, only if still Pending) ----------
async function deleteComplaint(id) {
  if (!confirm('Delete this complaint?')) return;

  await fetch(`${API}/complaints/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  loadMyComplaints();
}

// ---------- LOAD ALL COMPLAINTS (admin) ----------
async function loadAllComplaints() {
  const res = await fetch(`${API}/complaints/all`, { credentials: 'include' });
  const data = await res.json();
  const all = data.complaints;

  // ---- Update stat boxes ----
  document.getElementById('stat-total').innerText = all.length;
  document.getElementById('stat-urgent').innerText = all.filter(c => c.priority === 'Urgent').length;
  document.getElementById('stat-pending').innerText = all.filter(c => c.status === 'Pending').length;
  document.getElementById('stat-resolved').innerText = all.filter(c => c.status === 'Resolved').length;

  // ---- Apply status filter + room search (done in the browser, no extra backend call needed) ----
  const statusFilter = document.getElementById('filter-status').value;
  const searchRoom = document.getElementById('search-room').value.toLowerCase();

  const filtered = all.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesRoom = c.room_number.toLowerCase().includes(searchRoom);
    return matchesStatus && matchesRoom;
  });

  const list = document.getElementById('all-complaints-list');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = '<p class="hint-text">No complaints match this filter.</p>';
    return;
  }

  filtered.forEach(c => {
    list.innerHTML += `
      <div class="complaint-item">
        <div class="row">
          <strong>${c.student_name} — Room ${c.room_number}</strong>
          <span class="badge ${c.priority === 'Urgent' ? 'urgent' : 'normal'}">${c.priority}</span>
        </div>
        <p>${c.category}: ${c.description}</p>
        <select class="status-select" onchange="updateStatus(${c.id}, this.value)">
          <option ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </div>
    `;
  });
}

// ---------- UPDATE STATUS (admin) ----------
async function updateStatus(id, status) {
  await fetch(`${API}/complaints/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  loadAllComplaints();
}
