// ── Profile ───────────────────────────────────────────────────────────────────
async function saveProfile() {
  const name  = document.getElementById('p-name').value.trim();
  const email = document.getElementById('p-email').value.trim();
  const cv    = document.getElementById('p-cv').value.trim();
  const msg   = document.getElementById('profile-msg');

  if (!name || !email || !cv) {
    msg.style.color = 'var(--r)';
    msg.textContent = '⚠ Name, email and CV are required.';
    return;
  }

  try {
    const d = await apiSaveUser({
      name, email,
      phone:              document.getElementById('p-phone').value,
      cv_text:            cv,
      skills:             document.getElementById('p-skills').value,
      preferred_roles:    document.getElementById('p-roles').value,
      preferred_location: document.getElementById('p-location').value
    });

    currentUserId = d.user_id;
    localStorage.setItem('nexhire_user_id', currentUserId);
    msg.style.color = 'var(--g)';
    msg.textContent = '✅ Profile saved! User ID: ' + currentUserId;
  } catch (e) {
    msg.style.color = 'var(--r)';
    msg.textContent = '⚠ Error: ' + e.message;
  }
}

async function loadProfileFromStorage() {
  if (!currentUserId) return;
  try {
    const u = await apiGetUser(currentUserId);
    if (!u.id) return;
    document.getElementById('p-name').value     = u.name || '';
    document.getElementById('p-email').value    = u.email || '';
    document.getElementById('p-phone').value    = u.phone || '';
    document.getElementById('p-skills').value   = u.skills || '';
    document.getElementById('p-roles').value    = u.preferred_roles || '';
    document.getElementById('p-location').value = u.preferred_location || '';
    document.getElementById('p-cv').value       = u.cv_text || '';
  } catch { /* silent */ }
}

// ── CV Upload ─────────────────────────────────────────────────────────────────
async function uploadCv(event) {
  const file = event.target.files[0];
  if (file) await processCvFile(file);
}

async function handleCvDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) await processCvFile(file);
}

async function processCvFile(file) {
  const zone = document.getElementById('cv-upload-zone');
  zone.style.borderColor = 'var(--a)';
  zone.innerHTML = `
    <div class="loading" style="padding:16px">
      <div class="spin"></div>
      <div style="font-size:11px;color:var(--a)">Extracting from ${file.name}...</div>
    </div>`;

  try {
    const d = await apiExtractCV(file);
    if (d.success) {
      document.getElementById('p-cv').value = d.text;
      zone.style.borderColor = 'var(--g)';
      zone.innerHTML = `
        <div style="font-size:20px;margin-bottom:6px">✅</div>
        <div style="font-family:'Unbounded',sans-serif;font-size:12px;font-weight:700;color:var(--g);margin-bottom:4px">
          ${file.name}
        </div>
        <div style="font-size:10px;color:var(--ts);margin-bottom:10px">
          CV text extracted successfully
        </div>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();clearCv()">
          ✕ Clear & Re-upload
        </button>`;
    } else {
      throw new Error(d.detail || 'Extraction failed');
    }
  } catch (e) {
    zone.style.borderColor = 'var(--r)';
    zone.innerHTML = `
      <div style="font-size:20px;margin-bottom:6px">⚠️</div>
      <div style="font-size:11px;color:var(--r);margin-bottom:10px">Error: ${e.message}</div>
      <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();clearCv()">Try Again</button>`;
  }
}

function clearCv() {
  document.getElementById('p-cv').value = '';
  document.getElementById('cv-file-input').value = '';
  const zone = document.getElementById('cv-upload-zone');
  zone.style.borderColor = 'var(--bd2)';
  zone.innerHTML = `
    <input type="file" id="cv-file-input" accept=".pdf,.docx,.txt"
      style="display:none" onchange="uploadCv(event)">
    <div style="font-size:24px;margin-bottom:6px">📄</div>
    <div style="font-family:'Unbounded',sans-serif;font-size:12px;font-weight:700;margin-bottom:4px">
      Drop your CV here — PDF, DOCX or TXT
    </div>
    <div style="font-size:10px;color:var(--ts)">Click to browse or drag & drop</div>`;
}
