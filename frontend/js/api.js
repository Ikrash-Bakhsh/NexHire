const API = 'http://localhost:8000';

// ── Health ────────────────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const r = await fetch(API + '/api/health');
    const d = await r.json();
    const dot = document.getElementById('dot');
    const txt = document.getElementById('statusTxt');
    if (d.database && d.ollama) {
      dot.className = 'dot on';
      txt.textContent = 'All Systems OK';
    } else if (d.database) {
      dot.style.background = 'var(--y)';
      txt.textContent = 'Ollama offline';
    } else {
      txt.textContent = 'Backend offline';
    }
  } catch {
    document.getElementById('statusTxt').textContent = 'Server offline';
  }
}

// ── User ──────────────────────────────────────────────────────────────────────
async function apiSaveUser(data) {
  const r = await fetch(API + '/api/user/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function apiGetUser(userId) {
  const r = await fetch(API + `/api/user/${userId}`);
  return r.json();
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
async function apiSearchJobs(data) {
  const r = await fetch(API + '/api/jobs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

// ── CV Tailor ─────────────────────────────────────────────────────────────────
async function apiTailorCV(userId, jobId) {
  const r = await fetch(API + '/api/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, job_id: jobId })
  });
  return r.json();
}

// ── Applications ──────────────────────────────────────────────────────────────
async function apiGetApplications(userId) {
  const r = await fetch(API + `/api/applications/${userId}`);
  return r.json();
}

async function apiUpdateStatus(appId, status) {
  const r = await fetch(API + '/api/applications/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id: appId, status })
  });
  return r.json();
}

// ── Email ─────────────────────────────────────────────────────────────────────
async function apiGenerateEmail(userId, jobId) {
  const r = await fetch(API + '/api/email/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, job_id: jobId })
  });
  return r.json();
}

async function apiFindHR(company, jobTitle) {
  const r = await fetch(API + `/api/hr/find?company=${encodeURIComponent(company)}&job_title=${encodeURIComponent(jobTitle)}`);
  return r.json();
}

// ── CV Upload ─────────────────────────────────────────────────────────────────
async function apiExtractCV(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(API + '/api/cv/extract', { method: 'POST', body: fd });
  return r.json();
}

// ── Interview ─────────────────────────────────────────────────────────────────
async function apiGetInterviewTips(appId) {
  const r = await fetch(API + `/api/interview/${appId}`, { method: 'POST' });
  return r.json();
}
