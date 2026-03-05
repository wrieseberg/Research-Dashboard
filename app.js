// Local Storage Keys
const LS_KEYS = {
    overview: 'lwo_dashboard_overview',
    readings: 'lwo_dashboard_readings',
    weekly: 'lwo_dashboard_weekly',
    prompts: 'lwo_dashboard_prompts',
    experiments: 'lwo_dashboard_experiments',
    links: 'lwo_dashboard_links'
};

const defaultData = {
    overview: {
        focus: "I am exploring how structured, paced learning environments can reduce overwhelm and support confidence and focus for anxious learners.",
        researchQuestion: "How do structured, paced learning environments affect emotional response and follow-through?",
        goals: ["Reduce stress and support confidence", "Uncover triggers for information overwhelm", "Design scalable patterns for pacing and clarity"],
        principles: ["Pacing", "Clarity", "Reduction", "Sequencing"],
        today: "Reviewing materials for the project."
    },
    weekly: [
        { id: 'w5', week: 5, title: 'Week 5', goals: 'Research foundations:\nCognitive Load Theory and Learning Through Structure.\nDraft Design Principles for Calm Learning.', checklist: [], notes: '' },
        { id: 'w6', week: 6, title: 'Week 6', goals: 'Attention and information overload research.\nIdentify overwhelm triggers and create pacing map.', checklist: [], notes: '' },
        { id: 'w7', week: 7, title: 'Week 7', goals: 'Emotion and learning research.\nCreate emotional journey map.\nBuild first low-fidelity layout.', checklist: [], notes: '' },
        { id: 'w8', week: 8, title: 'Week 8', goals: 'Systems thinking and repetition research.\nRefine structure into coherent learning system.', checklist: [], notes: '' },
        { id: 'w9', week: 9, title: 'Week 9', goals: 'Usability heuristics and ethical design.\nCreate guided breathing/grounding element.\nRecord test media and embed in prototype.', checklist: [], notes: '' },
        { id: 'w10', week: 10, title: 'Week 10', goals: 'Reflection and reduction.\nReview page for clarity.\nRemove unnecessary elements.\nOrganize Milanote board.', checklist: [], notes: '' },
        { id: 'w11', week: 11, title: 'Week 11', goals: 'Final polish.\nFinalize submission materials.', checklist: [], notes: '' }
    ],
    links: [
        { id: generateId(), title: 'Milanote board', url: 'https://milanote.com' },
        { id: generateId(), title: 'GitHub repository', url: 'https://github.com' }
    ]
};

// Global State
let state = {
    overview: {},
    readings: [],
    weekly: [],
    prompts: [],
    experiments: [],
    links: []
};

let currentModal = null;

// --- Initializing & Storage ---
function initApp() {
    loadAllState();
    setupNavigation();
    setupOverview();
    setupReadings();
    setupWeekly();
    setupPrompts();
    setupExperiments();
    setupLinks();
    setupSettings();
    updateStatsHeader();

    // Setup Modal Closers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
}

function loadAllState() {
    state.overview = loadKey(LS_KEYS.overview, defaultData.overview);
    state.readings = loadKey(LS_KEYS.readings, []);
    state.weekly = loadKey(LS_KEYS.weekly, defaultData.weekly);
    state.prompts = loadKey(LS_KEYS.prompts, []);
    state.experiments = loadKey(LS_KEYS.experiments, []);
    state.links = loadKey(LS_KEYS.links, defaultData.links);
}

function loadKey(key, fallback) {
    const data = localStorage.getItem(key);
    if (data) {
        try { return JSON.parse(data); }
        catch (e) { console.error(`Failed to parse ${key}`, e); return fallback; }
    }
    return fallback;
}

function saveState(section) {
    localStorage.setItem(LS_KEYS[section], JSON.stringify(state[section]));
    updateStatsHeader();
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
const ACTIVE_KEY = 'lwo_dashboard_activeSection';

function setActiveNav(sectionId) {
    document.querySelectorAll('[data-section]').forEach(btn => {
        const isActive = btn.getAttribute('data-section') === sectionId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}

function showSection(sectionId) {
    document.querySelectorAll('main section[data-section-panel]').forEach(panel => {
        if (panel.id !== sectionId) {
            panel.classList.remove('active');
            panel.classList.add('hidden');
        } else {
            panel.classList.add('active');
            panel.classList.remove('hidden');
        }
    });
}

function goToSection(sectionId) {
    localStorage.setItem(ACTIVE_KEY, sectionId);
    showSection(sectionId);
    setActiveNav(sectionId);
}

// --- Navigation & Core ---
function setupNavigation() {
    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSection(btn.getAttribute('data-section'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const saved = localStorage.getItem(ACTIVE_KEY) || 'overview';
    goToSection(saved);
}

function updateStatsHeader() {
    document.getElementById('stat-readings').textContent = state.readings.length;
    document.getElementById('stat-prompts').textContent = state.prompts.length;
    document.getElementById('stat-experiments').textContent = state.experiments.length;
}

// Utility formatting
function safeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function parseTags(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// Modals
function openModal(modalId) {
    currentModal = document.getElementById(modalId);
    currentModal.classList.remove('hidden');
}
function closeModal() {
    if (currentModal) {
        currentModal.classList.add('hidden');
        currentModal = null;
    }
}


// --- 1. Overview ---
function setupOverview() {
    document.getElementById('overview-focus').value = state.overview.focus || '';
    document.getElementById('overview-question').value = state.overview.researchQuestion || '';
    document.getElementById('overview-today').value = state.overview.today || '';

    document.querySelectorAll('#overview .auto-save').forEach(el => {
        el.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            state.overview[field] = e.target.value;
            saveState('overview');
        });
    });

    renderGoals();
    renderPrinciples();

    document.getElementById('btn-add-goal').addEventListener('click', () => {
        const input = document.getElementById('new-goal-input');
        if (input.value.trim()) {
            state.overview.goals.push(input.value.trim());
            input.value = '';
            saveState('overview');
            renderGoals();
        }
    });

    document.getElementById('btn-add-principle').addEventListener('click', () => {
        const input = document.getElementById('new-principle-input');
        if (input.value.trim()) {
            state.overview.principles.push(input.value.trim());
            input.value = '';
            saveState('overview');
            renderPrinciples();
        }
    });
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';
    state.overview.goals.forEach((goal, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="value text-secondary">${safeText(goal)}</span>
            <div class="actions">
                <button class="list-del-btn" data-idx="${idx}">✕</button>
            </div>
        `;
        list.appendChild(li);
    });
    list.querySelectorAll('.list-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.overview.goals.splice(e.target.getAttribute('data-idx'), 1);
            saveState('overview');
            renderGoals();
        });
    });
}

function renderPrinciples() {
    const container = document.getElementById('principles-list');
    container.innerHTML = '';
    state.overview.principles.forEach((principle, idx) => {
        const tag = document.createElement('div');
        tag.className = 'tag-principle';
        tag.innerHTML = `
            ${safeText(principle)}
            <span class="tag-del-btn" data-idx="${idx}">✕</span>
        `;
        container.appendChild(tag);
    });
    container.querySelectorAll('.tag-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.overview.principles.splice(e.target.getAttribute('data-idx'), 1);
            saveState('overview');
            renderPrinciples();
        });
    });
}


// --- 2. Reading Library ---
function setupReadings() {
    renderReadings();

    document.getElementById('btn-new-reading').addEventListener('click', () => {
        document.getElementById('form-reading').reset();
        document.getElementById('reading-id').value = '';
        document.getElementById('modal-reading-title').textContent = "Add Reading";
        openModal('modal-reading');
    });

    document.getElementById('form-reading').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reading-id').value;
        const reading = {
            id: id || generateId(),
            title: document.getElementById('reading-title').value,
            author: document.getElementById('reading-author').value,
            link: document.getElementById('reading-link').value,
            tags: document.getElementById('reading-tags').value,
            status: document.getElementById('reading-status').value,
            notes: document.getElementById('reading-notes').value,
            createdAt: id ? state.readings.find(r => r.id === id).createdAt : new Date().toISOString()
        };

        if (id) {
            const idx = state.readings.findIndex(r => r.id === id);
            state.readings[idx] = reading;
            showToast("Reading updated.");
        } else {
            state.readings.push(reading);
            showToast("Reading added.");
        }

        saveState('readings');
        renderReadings();
        closeModal();
    });

    document.getElementById('search-readings').addEventListener('input', renderReadings);
    document.getElementById('filter-readings-status').addEventListener('change', renderReadings);
    document.getElementById('sort-readings').addEventListener('change', renderReadings);
}

function renderReadings() {
    const container = document.getElementById('readings-container');
    const search = document.getElementById('search-readings').value.toLowerCase();
    const statusFilter = document.getElementById('filter-readings-status').value;
    const sort = document.getElementById('sort-readings').value;

    container.innerHTML = '';

    let filtered = state.readings.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(search) ||
            (r.author && r.author.toLowerCase().includes(search)) ||
            (r.tags && r.tags.toLowerCase().includes(search)) ||
            (r.notes && r.notes.toLowerCase().includes(search));
        const matchStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'status') filtered.sort((a, b) => a.status.localeCompare(b.status));

    if (filtered.length === 0) {
        if (state.readings.length === 0) {
            container.innerHTML = `<div class="empty-state">No readings yet. Add your first source to begin collecting literature.</div>`;
        } else {
            container.innerHTML = `<div class="empty-state">No matching items.</div>`;
        }
        return;
    }

    const statuses = ['Not started', 'In progress', 'Completed'];

    filtered.forEach(r => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const badgeClass = `status-${r.status.toLowerCase().replace(' ', '-')}`;
        const tagsHtml = parseTags(r.tags).map(t => `<span class="tag-badge">${safeText(t)}</span>`).join('');
        const linkHtml = r.link ? `<p class="text-sm mt-sm">🔗 <a href="${r.link}" target="_blank">External Link</a></p>` : '';
        const notesHtml = r.notes ? `<p class="text-sm text-subtle mt-sm"><strong>Notes:</strong><br>${safeText(r.notes).substring(0, 120)}${r.notes.length > 120 ? '...' : ''}</p>` : '';

        const selectHtml = `
            <select class="status-badge status-select ${badgeClass}" data-id="${r.id}">
                ${statuses.map(s => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        `;

        card.innerHTML = `
            ${selectHtml}
            <h4 class="mt-sm">${safeText(r.title)}</h4>
            <div class="text-sm text-secondary">${safeText(r.author)}</div>
            ${linkHtml}
            <div class="mt-sm">${tagsHtml}</div>
            ${notesHtml}
            <div class="item-actions">
                <button class="edit-btn" data-id="${r.id}">Edit</button>
                <button class="del-btn" data-id="${r.id}">Del</button>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = state.readings.find(i => i.id === e.target.getAttribute('data-id'));
            document.getElementById('reading-id').value = item.id;
            document.getElementById('reading-title').value = item.title;
            document.getElementById('reading-author').value = item.author || '';
            document.getElementById('reading-link').value = item.link || '';
            document.getElementById('reading-tags').value = item.tags || '';
            document.getElementById('reading-status').value = item.status;
            document.getElementById('reading-notes').value = item.notes || '';
            document.getElementById('modal-reading-title').textContent = "Edit Reading";
            openModal('modal-reading');
        });
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Are you sure you want to delete this reading?")) {
                state.readings = state.readings.filter(i => i.id !== e.target.getAttribute('data-id'));
                saveState('readings');
                renderReadings();
            }
        });
    });

    container.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const item = state.readings.find(i => i.id === e.target.getAttribute('data-id'));
            if (item) {
                item.status = e.target.value;
                saveState('readings');
                renderReadings();
            }
        });
    });
}


// --- 3. Weekly Plan ---
function setupWeekly() {
    renderWeekly();
}

function renderWeekly() {
    const container = document.getElementById('weekly-container');
    container.innerHTML = '';

    state.weekly.forEach(w => {
        const wCard = document.createElement('div');
        wCard.className = 'card weekly-card';

        let checklistHTML = '';
        w.checklist.forEach((item, idx) => {
            const checkedState = item.done ? 'checked' : '';
            checklistHTML += `
                <div class="checklist-item ${checkedState}" data-weekid="${w.id}" data-idx="${idx}">
                    <input type="checkbox" ${checkedState}>
                    <span class="text text-secondary">${safeText(item.text)}</span>
                    <button class="list-del-btn cl-del">✕</button>
                </div>
            `;
        });

        wCard.innerHTML = `
            <div class="week-left">
                <h2>${w.title}</h2>
                <div class="prompt-text-block mb-md text-secondary" style="font-size: 0.95em;">
                    <strong>Milestones & Focus:</strong><br>
                    ${safeText(w.goals)}
                </div>
                
                <h4 class="mt-md">Task Checklist</h4>
                <div class="checklist-container mt-sm">${checklistHTML}</div>
                
                <div class="add-item-form mt-sm">
                    <input type="text" class="cl-input" placeholder="Add a specific task...">
                    <button class="btn-secondary cl-add-btn" data-weekid="${w.id}">Add</button>
                </div>
            </div>
            <div class="week-right">
                <h4>Notes & Reflections</h4>
                <textarea class="auto-save week-notes" data-weekid="${w.id}" rows="8" placeholder="Log progress, thoughts, or reflections for this week...">${w.notes}</textarea>
            </div>
        `;
        container.appendChild(wCard);
    });

    container.querySelectorAll('.cl-add-btn').forEach(btn => {
        const input = btn.previousElementSibling;
        const weekId = btn.getAttribute('data-weekid');

        const addTask = () => {
            if (input.value.trim()) {
                const week = state.weekly.find(w => w.id === weekId);
                week.checklist.push({ text: input.value.trim(), done: false });
                saveState('weekly');
                renderWeekly();
            }
        };

        btn.addEventListener('click', addTask);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    });

    container.querySelectorAll('.cl-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.checklist-item');
            const week = state.weekly.find(w => w.id === parent.getAttribute('data-weekid'));
            week.checklist.splice(parent.getAttribute('data-idx'), 1);
            saveState('weekly');
            renderWeekly();
        });
    });

    container.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const parent = e.target.closest('.checklist-item');
            const week = state.weekly.find(w => w.id === parent.getAttribute('data-weekid'));
            week.checklist[parent.getAttribute('data-idx')].done = e.target.checked;
            saveState('weekly');
            renderWeekly();
        });
    });

    container.querySelectorAll('.week-notes').forEach(ta => {
        ta.addEventListener('input', (e) => {
            const week = state.weekly.find(w => w.id === e.target.getAttribute('data-weekid'));
            week.notes = e.target.value;
            saveState('weekly');
        });
    });
}


// --- 4. Prompt Log ---
function setupPrompts() {
    renderPrompts();

    document.getElementById('btn-new-prompt').addEventListener('click', () => {
        document.getElementById('form-prompt').reset();
        document.getElementById('prompt-id').value = '';
        document.getElementById('modal-prompt-title').textContent = "Add Prompt Log";
        openModal('modal-prompt');
    });

    document.getElementById('form-prompt').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prompt-id').value;
        const promptData = {
            id: id || generateId(),
            date: id ? state.prompts.find(p => p.id === id).date : new Date().toLocaleString(),
            model: document.getElementById('prompt-model').value,
            tags: document.getElementById('prompt-tags').value,
            text: document.getElementById('prompt-text').value,
            summary: document.getElementById('prompt-summary').value,
            next: document.getElementById('prompt-next').value
        };

        if (id) {
            const idx = state.prompts.findIndex(p => p.id === id);
            state.prompts[idx] = promptData;
            showToast("Prompt log updated.");
        } else {
            state.prompts.push(promptData);
            showToast("Prompt logged.");
        }

        saveState('prompts');
        renderPrompts();
        closeModal();
    });

    document.getElementById('search-prompts').addEventListener('input', renderPrompts);
}

function renderPrompts() {
    const container = document.getElementById('prompts-container');
    const search = document.getElementById('search-prompts').value.toLowerCase();

    container.innerHTML = '';

    let filtered = state.prompts.filter(p => {
        return p.text.toLowerCase().includes(search) ||
            (p.summary && p.summary.toLowerCase().includes(search)) ||
            (p.tags && p.tags.toLowerCase().includes(search));
    });

    if (filtered.length === 0) {
        if (state.prompts.length === 0) {
            container.innerHTML = `<div class="empty-state">No AI prompts logged yet. Track your generation process here.</div>`;
        } else {
            container.innerHTML = `<div class="empty-state">No matching items.</div>`;
        }
        return;
    }

    // Sort descending by created/date implicitly (reverse iteration)
    filtered.slice().reverse().forEach(p => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const tagsHtml = parseTags(p.tags).map(t => `<span class="tag-badge">${safeText(t)}</span>`).join('');

        card.innerHTML = `
            <div class="flex-between text-subtle text-sm mb-sm border-bottom pb-sm" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; flex-direction: row;">
                <span><strong>${p.model}</strong> • ${p.date}</span>
                <div class="item-actions" style="position:static; margin-left: auto;">
                    <button class="edit-btn" data-id="${p.id}">Edit</button>
                    <button class="del-btn" data-id="${p.id}">Del</button>
                </div>
            </div>
            
            <div class="mb-sm text-secondary"><strong>Prompt Input:</strong></div>
            <div class="prompt-text-block font-mono text-secondary mb-md">${safeText(p.text).replace(/\n/g, '<br>')}</div>
            
            ${p.summary ? `<div class="mb-sm text-secondary"><strong>Output Summary:</strong><br> ${safeText(p.summary)}</div>` : ''}
            ${p.next ? `<div class="mb-sm text-secondary"><strong>What Changed Next:</strong><br> ${safeText(p.next)}</div>` : ''}
            
            <div class="mt-sm">${tagsHtml}</div>
        `;
        container.appendChild(card);
    });


    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = state.prompts.find(i => i.id === e.target.getAttribute('data-id'));
            document.getElementById('prompt-id').value = item.id;
            document.getElementById('prompt-model').value = item.model;
            document.getElementById('prompt-tags').value = item.tags || '';
            document.getElementById('prompt-text').value = item.text;
            document.getElementById('prompt-summary').value = item.summary || '';
            document.getElementById('prompt-next').value = item.next || '';
            document.getElementById('modal-prompt-title').textContent = "Edit Prompt Log";
            openModal('modal-prompt');
        });
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Delete this prompt log?")) {
                state.prompts = state.prompts.filter(i => i.id !== e.target.getAttribute('data-id'));
                saveState('prompts');
                renderPrompts();
            }
        });
    });
}


// --- 5. Experiment Log ---
function setupExperiments() {
    renderExperiments();

    document.getElementById('btn-new-experiment').addEventListener('click', () => {
        document.getElementById('form-experiment').reset();
        document.getElementById('experiment-id').value = '';
        document.getElementById('modal-experiment-title').textContent = "Add Design Experiment";
        openModal('modal-experiment');
    });

    document.getElementById('form-experiment').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('experiment-id').value;
        const expData = {
            id: id || generateId(),
            date: id ? state.experiments.find(x => x.id === id).date : new Date().toLocaleString(),
            tried: document.getElementById('experiment-tried').value,
            notes: document.getElementById('experiment-notes').value,
            outcome: document.getElementById('experiment-outcome').value,
            next: document.getElementById('experiment-next').value,
            tags: document.getElementById('experiment-tags').value,
            status: document.getElementById('experiment-status').value
        };

        if (id) {
            const idx = state.experiments.findIndex(x => x.id === id);
            state.experiments[idx] = expData;
            showToast("Experiment log updated.");
        } else {
            state.experiments.push(expData);
            showToast("Experiment logged.");
        }
        saveState('experiments');
        renderExperiments();
        closeModal();
    });

    document.getElementById('search-experiments').addEventListener('input', renderExperiments);
    document.getElementById('filter-experiments-status').addEventListener('change', renderExperiments);
}

function renderExperiments() {
    const container = document.getElementById('experiments-container');
    const search = document.getElementById('search-experiments').value.toLowerCase();
    const statusFilter = document.getElementById('filter-experiments-status').value;

    container.innerHTML = '';

    let filtered = state.experiments.filter(x => {
        const matchSearch = x.tried.toLowerCase().includes(search) ||
            (x.tags && x.tags.toLowerCase().includes(search));
        const matchStatus = statusFilter === 'All' || x.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        if (state.experiments.length === 0) {
            container.innerHTML = `<div class="empty-state">No design experiments recorded. Log your design changes and tests here.</div>`;
        } else {
            container.innerHTML = `<div class="empty-state">No matching items.</div>`;
        }
        return;
    }

    const statuses = ['Planned', 'Running', 'Done'];

    filtered.slice().reverse().forEach(x => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const badgeClass = `status-${x.status.toLowerCase()}`;
        const tagsHtml = parseTags(x.tags).map(t => `<span class="tag-badge">${safeText(t)}</span>`).join('');

        let mediaHtml = '';
        if (x.notes) {
            if (x.notes.match(/\.(jpeg|jpg|gif|png)$/i) || x.notes.startsWith('data:image')) {
                mediaHtml = `<img src="${x.notes}" class="img-preview" alt="Preview" onerror="this.outerHTML='<p class=\\'text-sm text-secondary\\'>${safeText(x.notes)}</p>'">`;
            } else {
                mediaHtml = `<p class="text-sm text-secondary mt-sm"><strong>Notes/Files:</strong> <br>${safeText(x.notes)}</p>`;
            }
        }

        const selectHtml = `
            <select class="status-badge status-select ${badgeClass}" data-id="${x.id}">
                ${statuses.map(s => `<option value="${s}" ${x.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        `;

        card.innerHTML = `
            <div class="flex-between mb-sm" style="flex-direction: row;">
                ${selectHtml}
                <div class="text-sm text-subtle">${x.date}</div>
            </div>
            <h4 class="mt-sm mb-sm">${safeText(x.tried)}</h4>
            ${mediaHtml}
            ${x.outcome ? `<p class="text-sm text-secondary mt-md"><strong>Outcome:</strong><br> ${safeText(x.outcome)}</p>` : ''}
            ${x.next ? `<p class="text-sm text-secondary mt-sm"><strong>Next Steps:</strong><br> ${safeText(x.next)}</p>` : ''}
            <div class="mt-md">${tagsHtml}</div>
            
             <div class="item-actions">
                <button class="edit-btn" data-id="${x.id}">Edit</button>
                <button class="del-btn" data-id="${x.id}">Del</button>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = state.experiments.find(i => i.id === e.target.getAttribute('data-id'));
            document.getElementById('experiment-id').value = item.id;
            document.getElementById('experiment-tried').value = item.tried;
            document.getElementById('experiment-notes').value = item.notes || '';
            document.getElementById('experiment-outcome').value = item.outcome || '';
            document.getElementById('experiment-next').value = item.next || '';
            document.getElementById('experiment-tags').value = item.tags || '';
            document.getElementById('experiment-status').value = item.status;
            document.getElementById('modal-experiment-title').textContent = "Edit Experiment Log";
            openModal('modal-experiment');
        });
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Delete this experiment record?")) {
                state.experiments = state.experiments.filter(i => i.id !== e.target.getAttribute('data-id'));
                saveState('experiments');
                renderExperiments();
            }
        });
    });

    container.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const item = state.experiments.find(i => i.id === e.target.getAttribute('data-id'));
            if (item) {
                item.status = e.target.value;
                saveState('experiments');
                renderExperiments();
            }
        });
    });
}


// --- 6. Links ---
function setupLinks() {
    renderLinks();

    document.getElementById('btn-new-link').addEventListener('click', () => {
        document.getElementById('form-link').reset();
        document.getElementById('link-id').value = '';
        document.getElementById('modal-link-title').textContent = "Add Quick Link";
        openModal('modal-link');
    });

    document.getElementById('form-link').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('link-id').value;
        const linkData = {
            id: id || generateId(),
            title: document.getElementById('link-title').value,
            url: document.getElementById('link-url').value
        };

        if (id) {
            const idx = state.links.findIndex(l => l.id === id);
            state.links[idx] = linkData;
            showToast("Link updated.");
        } else {
            state.links.push(linkData);
            showToast("Link added.");
        }
        saveState('links');
        renderLinks();
        closeModal();
    });
}

function renderLinks() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';

    if (state.links.length === 0) {
        container.innerHTML = `<div class="empty-state">No quick links configured. Add important resources here.</div>`;
    }

    state.links.forEach(l => {
        const card = document.createElement('div');
        card.className = 'link-card';
        card.innerHTML = `
            <a href="${l.url}" target="_blank">↗ ${safeText(l.title)}</a>
            <div class="actions">
                <button class="list-del-btn link-edit" data-id="${l.id}">Edit</button>
                <button class="list-del-btn link-del" data-id="${l.id}">✕</button>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.link-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = state.links.find(i => i.id === e.target.getAttribute('data-id'));
            document.getElementById('link-id').value = item.id;
            document.getElementById('link-title').value = item.title;
            document.getElementById('link-url').value = item.url;
            document.getElementById('modal-link-title').textContent = "Edit Link";
            openModal('modal-link');
        });
    });

    container.querySelectorAll('.link-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Delete this link?")) {
                state.links = state.links.filter(i => i.id !== e.target.getAttribute('data-id'));
                saveState('links');
                renderLinks();
            }
        });
    });
}


// --- 7. Settings / Utilities ---
function setupSettings() {
    // Export Data (Bundle everything into one JSON)
    document.getElementById('btn-export').addEventListener('click', () => {
        const fullBackup = {
            _backupDate: new Date().toISOString(),
            overview: state.overview,
            readings: state.readings,
            weekly: state.weekly,
            prompts: state.prompts,
            experiments: state.experiments,
            links: state.links
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "LWO_Dashboard_Backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Dashboard data exported successfully.");
    });

    // Import Data
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const json = JSON.parse(event.target.result);
                if (confirm("Are you sure you want to OVERWRITE current dashboard data with this backup file?")) {

                    if (json.overview) { state.overview = json.overview; saveState('overview'); }
                    if (json.readings) { state.readings = json.readings; saveState('readings'); }
                    if (json.weekly) { state.weekly = json.weekly; saveState('weekly'); }
                    if (json.prompts) { state.prompts = json.prompts; saveState('prompts'); }
                    if (json.experiments) { state.experiments = json.experiments; saveState('experiments'); }
                    if (json.links) { state.links = json.links; saveState('links'); }

                    alert("Data restored successfully. Refreshing dashboard.");
                    location.reload();
                }
            } catch (e) {
                alert("Invalid JSON file or format not recognized.");
            }
        };
        reader.readAsText(file);
    });

    // Clear Data
    document.getElementById('btn-clear-data').addEventListener('click', () => {
        if (confirm("DANGER: This will permanently delete all local dashboard data. Are you absolutely sure?")) {
            if (confirm("Final confirmation. Clear ALL data?")) {
                Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
                alert("All data wiped. Refreshing to default state.");
                location.reload();
            }
        }
    });
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
