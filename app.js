// ─── State ───────────────────────────────────────────────────────────────────

let templates = JSON.parse(localStorage.getItem('apn-templates') || '[]');
let nextId = JSON.parse(localStorage.getItem('apn-next-id') || '1');
let activeId = null;
let isNew = false;

// ─── Persistence ─────────────────────────────────────────────────────────────

function persist() {
  localStorage.setItem('apn-templates', JSON.stringify(templates));
  localStorage.setItem('apn-next-id', JSON.stringify(nextId));
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderList() {
  const list = document.getElementById('template-list');
  const count = document.getElementById('template-count');

  count.textContent = templates.length + ' template' + (templates.length !== 1 ? 's' : '');

  if (templates.length === 0) {
    list.innerHTML = '<div class="empty-list">No templates yet — click + New to start</div>';
    return;
  }

  list.innerHTML = templates.map(t => `
    <div class="template-item ${t.id === activeId ? 'active' : ''}" onclick="selectTemplate(${t.id})">
      <div class="template-item-title">${escHtml(t.title || 'Untitled')}</div>
      <div class="template-item-preview">${escHtml((t.body || '').replace(/\n/g, ' ').substring(0, 60))}</div>
    </div>
  `).join('');
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function selectTemplate(id) {
  activeId = id;
  isNew = false;

  const t = templates.find(x => x.id === id);
  if (!t) return;

  showForm();
  document.getElementById('form-title').textContent = 'Edit template';
  document.getElementById('delete-btn').style.display = '';
  document.getElementById('input-title').value = t.title;
  document.getElementById('input-body').value = t.body;

  renderList();
}

function newTemplate() {
  activeId = null;
  isNew = true;

  showForm();
  document.getElementById('form-title').textContent = 'New template';
  document.getElementById('delete-btn').style.display = 'none';
  document.getElementById('input-title').value = '';
  document.getElementById('input-body').value = '';
  document.getElementById('input-title').focus();

  renderList();
}

function saveTemplate() {
  const title = document.getElementById('input-title').value.trim();
  const body = document.getElementById('input-body').value;

  if (!title) {
    document.getElementById('input-title').focus();
    document.getElementById('input-title').style.borderColor = '#a4262c';
    setTimeout(() => document.getElementById('input-title').style.borderColor = '', 2000);
    return;
  }

  if (isNew) {
    const id = nextId++;
    templates.push({ id, title, body });
    activeId = id;
    isNew = false;
    document.getElementById('delete-btn').style.display = '';
    document.getElementById('form-title').textContent = 'Edit template';
  } else {
    const t = templates.find(x => x.id === activeId);
    if (t) { t.title = title; t.body = body; }
  }

  persist();
  renderList();

  const status = document.getElementById('save-status');
  status.textContent = 'Saved';
  setTimeout(() => status.textContent = '', 2000);
}

function deleteTemplate() {
  if (!confirm('Delete this template? This cannot be undone.')) return;

  templates = templates.filter(x => x.id !== activeId);
  activeId = null;

  persist();
  hideForm();
  renderList();
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportJson() {
  const json = JSON.stringify(
    templates.map(({ title, body }) => ({ title, body })),
    null,
    2
  );
  document.getElementById('json-output').textContent = json;
  document.getElementById('export-modal').style.display = 'flex';
}

function closeExport() {
  document.getElementById('export-modal').style.display = 'none';
}

function copyJson() {
  const json = document.getElementById('json-output').textContent;
  navigator.clipboard.writeText(json).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy to clipboard', 2000);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showForm() {
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('editor-form').style.display = 'flex';
}

function hideForm() {
  document.getElementById('editor-form').style.display = 'none';
  document.getElementById('empty-state').style.display = 'flex';
}

function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderList();
