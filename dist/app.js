// UI logic — depends on srt2vtt.js being loaded first.

// ─── State ───────────────────────────────────────────────────────────────────

const files = []; // { file, name, vttName, srtText, vttText, error }

// ─── DOM refs ────────────────────────────────────────────────────────────────

const dropzone        = document.getElementById('dropzone');
const fileInput       = document.getElementById('file-input');
const fileList        = document.getElementById('file-list');
const emptyState      = document.getElementById('empty-state');
const convertBtn      = document.getElementById('convert-btn');
const downloadAllBtn  = document.getElementById('download-all-btn');
const clearBtn        = document.getElementById('clear-btn');
const previewSection  = document.getElementById('preview-section');
const previewOutput   = document.getElementById('preview-output');
const previewFilename = document.getElementById('preview-filename');

// ─── Drag & drop ─────────────────────────────────────────────────────────────

dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const dropped = [...e.dataTransfer.files].filter(f => f.name.toLowerCase().endsWith('.srt'));
  if (dropped.length) addFiles(dropped);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles([...fileInput.files]);
  fileInput.value = '';
});

// ─── File management ─────────────────────────────────────────────────────────

function addFiles(newFiles) {
  newFiles.forEach(f => {
    if (!files.some(e => e.name === f.name)) {
      files.push({ file: f, name: f.name, vttName: vttFilename(f.name), srtText: null, vttText: null, error: null });
    }
  });
  renderList();
  updateButtons();
}

function renderList() {
  fileList.innerHTML = '';

  if (files.length === 0) {
    fileList.appendChild(emptyState);
    return;
  }

  files.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'file-item';

    const name = document.createElement('span');
    name.className = 'name';
    name.title = entry.name;
    name.textContent = entry.name;

    const status = document.createElement('span');
    status.className = 'status';
    if (entry.error) {
      status.textContent = 'error';
      status.className += ' status-error';
      status.title = entry.error;
    } else if (entry.vttText) {
      status.textContent = 'ready';
      status.className += ' status-ok';
    } else {
      status.textContent = 'pending';
      status.className += ' status-pending';
    }

    const previewBtn = document.createElement('button');
    previewBtn.className = 'download-btn preview-btn';
    previewBtn.textContent = 'Preview';
    previewBtn.disabled = !entry.vttText;
    previewBtn.addEventListener('click', () => showPreview(entry));

    const dlBtn = document.createElement('button');
    dlBtn.className = 'download-btn';
    dlBtn.textContent = 'Download';
    dlBtn.disabled = !entry.vttText;
    dlBtn.addEventListener('click', () => downloadEntry(entry));

    item.appendChild(name);
    item.appendChild(status);
    item.appendChild(previewBtn);
    item.appendChild(dlBtn);
    fileList.appendChild(item);
  });
}

function updateButtons() {
  const hasFiles     = files.length > 0;
  const hasConverted = files.some(e => e.vttText);
  const hasPending   = files.some(e => !e.vttText && !e.error);

  convertBtn.disabled     = !hasPending;
  downloadAllBtn.disabled = !hasConverted;
  clearBtn.disabled       = !hasFiles;
}

// ─── Conversion ──────────────────────────────────────────────────────────────

convertBtn.addEventListener('click', convertAll);

async function convertAll() {
  convertBtn.disabled = true;

  for (const entry of files) {
    if (entry.vttText || entry.error) continue;
    try {
      const text = await readFileAsText(entry.file);
      entry.srtText = text;
      entry.vttText = srtToVtt(text);
    } catch (err) {
      entry.error = err.message || 'Failed to read file';
    }
  }

  renderList();
  updateButtons();

  // Auto-preview last converted
  const last = [...files].reverse().find(e => e.vttText);
  if (last) showPreview(last);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsText(file, 'UTF-8');
  });
}

// ─── Download ────────────────────────────────────────────────────────────────

function downloadEntry(entry) {
  const blob = new Blob([entry.vttText], { type: 'text/vtt' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = entry.vttName;
  a.click();
  URL.revokeObjectURL(url);
}

downloadAllBtn.addEventListener('click', () => {
  files.filter(e => e.vttText).forEach(downloadEntry);
});

// ─── Clear ───────────────────────────────────────────────────────────────────

clearBtn.addEventListener('click', () => {
  files.length = 0;
  previewSection.style.display = 'none';
  renderList();
  updateButtons();
});

// ─── Preview ─────────────────────────────────────────────────────────────────

function showPreview(entry) {
  previewFilename.textContent = entry.vttName;
  previewOutput.textContent   = entry.vttText;
  previewSection.style.display = 'block';
  previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Init ────────────────────────────────────────────────────────────────────

renderList();
