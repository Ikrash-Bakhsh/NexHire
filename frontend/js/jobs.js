// ── Job Search ────────────────────────────────────────────────────────────────
async function searchJobs() {
  if (!currentUserId) { alert('Please save your profile first.'); return; }
  const keyword = document.getElementById('s-keyword').value.trim();
  if (!keyword) { alert('Please enter a job title.'); return; }

  document.getElementById('jobs-loading').style.display = 'block';
  document.getElementById('jobs-list').innerHTML = '';

  try {
    const d = await apiSearchJobs({
      keyword,
      location: document.getElementById('s-location').value,
      limit:    parseInt(document.getElementById('s-limit').value),
      source:   document.getElementById('s-source').value
    });

    document.getElementById('jobs-loading').style.display = 'none';

    if (!d.jobs || !d.jobs.length) {
      document.getElementById('jobs-list').innerHTML =
        '<div class="empty"><div class="empty-ico">🔍</div>No jobs found. Try different keywords.</div>';
      return;
    }

    currentJobs = d.jobs;
    renderJobs(d.jobs);
  } catch (e) {
    document.getElementById('jobs-loading').style.display = 'none';
    document.getElementById('jobs-list').innerHTML =
      `<div class="empty"><div class="empty-ico">⚠️</div>Error: ${e.message}</div>`;
  }
}

function renderJobs(jobs) {
  const list = document.getElementById('jobs-list');
  list.innerHTML = `<div style="font-size:11px;color:var(--ts);margin-bottom:12px">${jobs.length} jobs found</div>`;
  jobs.forEach(job => {
    list.innerHTML += `
      <div class="job-card">
        <div class="job-title">${job.title}</div>
        <div class="job-meta">
          <span>🏢 ${job.company}</span>
          <span>📍 ${job.location}</span>
          <span>🌐 ${job.source}</span>
        </div>
        <div class="job-actions">
          <button class="btn btn-sm"
            onclick="tailorJob(${job.id},'${escQ(job.title)}','${escQ(job.company)}')">
            🤖 AI Tailor CV
          </button>
          <button class="btn btn-ghost btn-sm"
            onclick="window.open('${job.url}','_blank')">
            🔗 View Job
          </button>
          <button class="btn btn-ghost btn-sm"
            onclick="genEmail(${job.id})">
            📧 Cold Email
          </button>
        </div>
      </div>`;
  });
}

// ── AI Tailor ─────────────────────────────────────────────────────────────────
async function tailorJob(jobId, title, company) {
  loadingModal('🤖 AI Tailoring CV...', `Tailoring CV for ${title} at ${company}<br>This takes 20-40 seconds`);
  try {
    const d = await apiTailorCV(parseInt(currentUserId), jobId);
    const offset = 220 - (d.match_score / 100) * 220;
    const color  = d.match_score >= 70 ? 'var(--g)' : d.match_score >= 50 ? 'var(--y)' : 'var(--r)';

    document.getElementById('modal-title').textContent = `🎯 ${title} at ${company}`;
    document.getElementById('modal-body').innerHTML = `
      <div class="score-wrap">
        <div class="ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle class="ring-bg" cx="40" cy="40" r="35"/>
            <circle class="ring-fill" cx="40" cy="40" r="35"
              style="stroke:${color};stroke-dashoffset:${offset}"/>
          </svg>
          <div class="ring-num" style="color:${color}">${d.match_score}%</div>
        </div>
        <div>
          <div style="font-family:'Unbounded',sans-serif;font-size:12px;margin-bottom:6px">Match Score</div>
          <p style="font-size:11px;color:var(--tm);line-height:1.7">${d.match_summary || ''}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <div style="font-size:10px;letter-spacing:2px;color:var(--g);margin-bottom:6px">✓ MATCHING SKILLS</div>
          ${(d.matching_skills||[]).map(s=>`<span class="tag tag-g">${s}</span>`).join('')}
        </div>
        <div>
          <div style="font-size:10px;letter-spacing:2px;color:var(--y);margin-bottom:6px">⚠ MISSING SKILLS</div>
          ${(d.missing_skills||[]).map(s=>`<span class="tag tag-y">${s}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:12px">
        <div style="font-size:10px;letter-spacing:2px;color:var(--ts);margin-bottom:8px">TAILORED CV</div>
        <div class="text-out" id="cv-out">${d.tailored_cv || ''}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="copyEl('cv-out')">📋 Copy CV</button>
      </div>

      <div style="margin-bottom:16px">
        <div style="font-size:10px;letter-spacing:2px;color:var(--ts);margin-bottom:8px">COVER LETTER</div>
        <div class="text-out" id="cl-out">${d.cover_letter || ''}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="copyEl('cl-out')">📋 Copy Letter</button>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-green" onclick="markApplied(${d.application_id})">✅ Mark as Applied</button>
        <button class="btn btn-ghost"  onclick="showInterviewPrep(${d.application_id})">🎤 Interview Prep</button>
      </div>`;
  } catch (e) {
    document.getElementById('modal-body').innerHTML =
      `<div style="color:var(--r);font-size:12px">Error: ${e.message}<br><br>
       Make sure Ollama is running: <strong>ollama serve</strong></div>`;
  }
}

// ── Cold Email ────────────────────────────────────────────────────────────────
async function genEmail(jobId) {
  const job     = currentJobs.find(j => j.id === jobId);
  const company = job?.company || '';
  const title   = job?.title   || '';

  loadingModal('📧 Finding HR & Writing Email...', `Searching HR contacts for ${company}`);

  try {
    const [hr, emailData] = await Promise.all([
      apiFindHR(company, title),
      apiGenerateEmail(parseInt(currentUserId), jobId)
    ]);

    document.getElementById('modal-title').textContent = `📧 Cold Email — ${title} at ${company}`;
    document.getElementById('modal-body').innerHTML = `

      <div style="background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="font-size:10px;letter-spacing:2px;color:var(--a);margin-bottom:12px">📬 HR CONTACT FINDER</div>

        <div style="margin-bottom:14px">
          <div style="font-size:10px;color:var(--ts);margin-bottom:8px">📧 POSSIBLE HR EMAILS</div>
          ${hr.guessed_emails.map(e => `
            <div style="display:flex;align-items:center;justify-content:space-between;
              background:var(--s3);border-radius:8px;padding:8px 12px;margin-bottom:5px">
              <span style="font-size:11px;color:var(--t)">${e}</span>
              <button class="btn btn-ghost btn-sm"
                onclick="navigator.clipboard.writeText('${e}');this.textContent='✅ Copied!'">
                📋 Copy
              </button>
            </div>`).join('')}
        </div>

        <div style="margin-bottom:14px">
          <div style="font-size:10px;color:var(--ts);margin-bottom:8px">🔍 JOB-SPECIFIC HR DHUNDHO</div>
          ${hr.search_links.map(link => `
            <a href="${link.url}" target="_blank" class="hr-link">
              <div>
                <div style="font-size:11px;color:var(--a);margin-bottom:2px">${link.label}</div>
                <div style="font-size:10px;color:var(--ts)">${link.description}</div>
              </div>
              <span style="color:var(--ts)">→</span>
            </a>`).join('')}
        </div>

        <a href="${hr.apollo_link}" target="_blank"
          style="display:flex;align-items:center;gap:10px;background:rgba(167,139,250,0.08);
          border:1px solid rgba(167,139,250,0.2);border-radius:8px;padding:10px 14px;text-decoration:none">
          <span style="font-size:16px">🚀</span>
          <div>
            <div style="font-size:11px;color:var(--a);font-weight:700">Apollo.io — Free HR Database</div>
            <div style="font-size:10px;color:var(--ts)">Verified recruiter emails dhundho</div>
          </div>
          <span style="color:var(--ts);margin-left:auto">→</span>
        </a>

        <div style="margin-top:10px;padding:8px 12px;background:rgba(251,191,36,.06);border-radius:8px;font-size:10px;color:var(--y)">
          💡 ${hr.note}
        </div>
      </div>

      <div style="margin-bottom:16px">
        <label>HR Email Address (find on LinkedIn and paste here)</label>
        <input type="email" id="hr-email-input"
          placeholder="hr@${company.toLowerCase().replace(/\s/g,'')}.com" style="margin-top:6px">
      </div>

      <div style="margin-bottom:12px">
        <div style="font-size:10px;letter-spacing:2px;color:var(--ts);margin-bottom:10px">EMAIL MODE</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button id="toggle-ai"     class="btn btn-sm"       style="flex:1" onclick="toggleEmailMode('ai')">🤖 AI Generated</button>
          <button id="toggle-manual" class="btn btn-ghost btn-sm" style="flex:1" onclick="toggleEmailMode('manual')">✏️ Write My Own</button>
        </div>
        <div id="email-ai-section">
          <div style="font-size:10px;color:var(--ts);margin-bottom:6px">AI GENERATED EMAIL</div>
          <textarea id="email-content" rows="10" style="font-size:11px;line-height:1.8">${emailData.email}</textarea>
        </div>
        <div id="email-manual-section" style="display:none">
          <div style="font-size:10px;color:var(--ts);margin-bottom:6px">WRITE YOUR OWN EMAIL</div>
          <textarea id="email-manual" rows="10"
            placeholder="Dear HR,&#10;&#10;I am writing to express my interest..."
            style="font-size:11px;line-height:1.8"></textarea>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn"       onclick="copyFinalEmail()">📋 Copy Email</button>
        <button class="btn btn-green" onclick="openGmail()">📤 Open in Gmail</button>
      </div>`;
  } catch (e) {
    document.getElementById('modal-body').innerHTML =
      `<div style="color:var(--r);font-size:12px">Error: ${e.message}</div>`;
  }
}
