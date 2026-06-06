// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  if (!currentUserId) {
    document.getElementById('apps-list').innerHTML =
      '<div class="empty"><div class="empty-ico">👤</div>Please save your profile first.</div>';
    return;
  }

  try {
    const d    = await apiGetApplications(currentUserId);
    const apps = d.applications || [];

    document.getElementById('stat-total').textContent     = apps.length;
    document.getElementById('stat-applied').textContent   = apps.filter(a => a.status === 'applied').length;
    document.getElementById('stat-interview').textContent = apps.filter(a => a.status === 'interview').length;
    document.getElementById('stat-pending').textContent   = apps.filter(a => ['pending','tailored'].includes(a.status)).length;

    if (!apps.length) {
      document.getElementById('apps-list').innerHTML =
        '<div class="empty"><div class="empty-ico">📋</div>No applications yet. Search for jobs!</div>';
      return;
    }

    document.getElementById('apps-list').innerHTML = apps.map(a => `
      <div class="app-card">
        <div class="app-header">
          <div>
            <div style="font-family:'Unbounded',sans-serif;font-size:13px;font-weight:700;margin-bottom:3px">
              ${a.title}
            </div>
            <div style="font-size:11px;color:var(--ts)">
              🏢 ${a.company} &nbsp; 📍 ${a.location} &nbsp; 🎯 ${a.match_score || 0}% match
            </div>
          </div>
          <span class="status-badge status-${a.status}">${a.status}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="viewApplication(${a.id})">📄 View CV & Letter</button>
          <button class="btn btn-ghost btn-sm" onclick="window.open('${a.url}','_blank')">🔗 Apply Now</button>
          <select onchange="updateStatus(${a.id},this.value)" style="width:auto;padding:6px 10px;font-size:10px">
            <option value="tailored"  ${a.status==='tailored'  ?'selected':''}>Tailored</option>
            <option value="applied"   ${a.status==='applied'   ?'selected':''}>Applied</option>
            <option value="interview" ${a.status==='interview' ?'selected':''}>Interview</option>
            <option value="rejected"  ${a.status==='rejected'  ?'selected':''}>Rejected</option>
            <option value="offer"     ${a.status==='offer'     ?'selected':''}>Offer Received</option>
          </select>
        </div>
      </div>`).join('');
  } catch (e) {
    document.getElementById('apps-list').innerHTML =
      `<div class="empty">Error: ${e.message}</div>`;
  }
}

async function updateStatus(appId, status) {
  await apiUpdateStatus(appId, status);
  loadDashboard();
}

async function markApplied(appId) {
  await apiUpdateStatus(appId, 'applied');
  closeModal();
  alert('✅ Marked as Applied! Track it in the Dashboard.');
}

async function viewApplication(appId) {
  const d = await apiGetApplications(currentUserId);
  const a = d.applications.find(x => x.id === appId);
  if (!a) return;
  openModal(`📄 ${a.title} at ${a.company}`, `
    <div style="margin-bottom:16px">
      <div style="font-size:10px;letter-spacing:2px;color:var(--ts);margin-bottom:8px">TAILORED CV</div>
      <div class="text-out" id="view-cv">${a.tailored_cv || 'N/A'}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="copyEl('view-cv')">📋 Copy</button>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;color:var(--ts);margin-bottom:8px">COVER LETTER</div>
      <div class="text-out" id="view-cl">${a.cover_letter || 'N/A'}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="copyEl('view-cl')">📋 Copy</button>
    </div>`);
}

// ── Interview Prep ────────────────────────────────────────────────────────────
async function showInterviewPrep(appId) {
  document.getElementById('modal-title').textContent = '🎤 Interview Preparation';
  document.getElementById('modal-body').innerHTML =
    '<div class="loading"><div class="spin"></div><div class="loading-txt">Generating questions...</div></div>';
  try {
    const d = await apiGetInterviewTips(appId);
    let html = '';

    if (d.tips?.length) {
      html += '<div style="margin-bottom:16px"><div style="font-size:10px;letter-spacing:2px;color:var(--a);margin-bottom:8px">💡 TIPS</div>';
      html += d.tips.map(t =>
        `<div style="font-size:11px;color:var(--tm);padding:7px 0;border-bottom:1px solid var(--bd)">→ ${t}</div>`
      ).join('') + '</div>';
    }

    if (d.likely_questions?.length) {
      html += '<div style="font-size:10px;letter-spacing:2px;color:var(--a);margin-bottom:8px">❓ LIKELY QUESTIONS</div>';
      html += d.likely_questions.map(q =>
        `<div style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;
          padding:10px;margin-bottom:8px;font-size:11px;color:var(--tm)">• ${q}</div>`
      ).join('');
    }

    document.getElementById('modal-body').innerHTML =
      html || '<p style="color:var(--ts);font-size:12px">No tips generated. Try again.</p>';
  } catch (e) {
    document.getElementById('modal-body').innerHTML =
      `<div style="color:var(--r);font-size:12px">Error: ${e.message}</div>`;
  }
}
