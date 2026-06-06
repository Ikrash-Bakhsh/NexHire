// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'dashboard') loadDashboard();
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function loadingModal(title, subtitle = '') {
  openModal(title, `
    <div class="loading">
      <div class="spin"></div>
      <div class="loading-txt">${title}</div>
      ${subtitle ? `<div style="font-size:11px;color:var(--ts)">${subtitle}</div>` : ''}
    </div>`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escQ(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function copyEl(id) {
  const el = document.getElementById(id);
  if (el) navigator.clipboard.writeText(el.textContent).then(() => alert('Copied!'));
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => alert('✅ Copied!'));
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function renderScoreRing(score) {
  const offset = 220 - (score / 100) * 220;
  const color = score >= 70 ? 'var(--g)' : score >= 50 ? 'var(--y)' : 'var(--r)';
  return `
    <div class="score-wrap">
      <div class="ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle class="ring-bg" cx="40" cy="40" r="35"/>
          <circle class="ring-fill" cx="40" cy="40" r="35"
            style="stroke:${color};stroke-dashoffset:${offset}"/>
        </svg>
        <div class="ring-num" style="color:${color}">${score}%</div>
      </div>
      <div>
        <div style="font-family:'Unbounded',sans-serif;font-size:12px;margin-bottom:6px">Match Score</div>
      </div>
    </div>`;
}

// ── Email Mode Toggle ─────────────────────────────────────────────────────────
function toggleEmailMode(mode) {
  const isAi = mode === 'ai';
  document.getElementById('email-ai-section').style.display   = isAi ? 'block' : 'none';
  document.getElementById('email-manual-section').style.display = isAi ? 'none' : 'block';
  document.getElementById('toggle-ai').className     = (isAi ? 'btn' : 'btn btn-ghost') + ' btn-sm';
  document.getElementById('toggle-manual').className = (isAi ? 'btn btn-ghost' : 'btn') + ' btn-sm';
  document.getElementById('toggle-ai').style.flex = '1';
  document.getElementById('toggle-manual').style.flex = '1';
}

function copyFinalEmail() {
  const isAi = document.getElementById('email-ai-section').style.display !== 'none';
  const text = isAi
    ? document.getElementById('email-content').value
    : document.getElementById('email-manual').value;
  navigator.clipboard.writeText(text);
  alert('✅ Email copied!');
}

function openGmail() {
  const to   = document.getElementById('hr-email-input').value;
  const isAi = document.getElementById('email-ai-section').style.display !== 'none';
  const body = isAi
    ? document.getElementById('email-content').value
    : document.getElementById('email-manual').value;
  window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&body=${encodeURIComponent(body)}`, '_blank');
}
