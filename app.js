/**
 * QHLS Result Portal v2.5
 * Official ISM Ernakulam Exam Portal
 */

const DOM = {
    views: {
        search: document.getElementById('view-search'),
        list: document.getElementById('view-list'),
        detail: document.getElementById('view-detail'),
        empty: document.getElementById('view-empty'),
        browseZones: document.getElementById('view-browse-zones'),
        browseStudents: document.getElementById('view-browse-students')
    },
    btn: {
        search: document.getElementById('search-btn'),
        text: document.getElementById('btn-text'),
        loader: document.getElementById('btn-loader'),
        browseTrigger: document.getElementById('browse-trigger-btn')
    },
    inputs: {
        phone: document.getElementById('phone-input')
    },
    containers: {
        toppers: document.getElementById('toppers-list'),
        contacts: document.getElementById('contacts-list'),
        emptyContacts: document.getElementById('empty-contacts'),
        results: document.getElementById('results-list'),
        detail: document.getElementById('student-detail-content'),
        zones: document.getElementById('zones-list'),
        browseResults: document.getElementById('browse-results-list'),
        centreFilter: document.getElementById('centre-filter')
    },
    stats: {
        stripDate: document.getElementById('strip-date'),
        stripZones: document.getElementById('strip-zones'),
        stripStudents: document.getElementById('strip-students')
    },
    labels: {
        currentZone: document.getElementById('current-browse-zone')
    },
    error: document.getElementById('search-error')
};

// Advanced Quote Logic
const quotes = {
    high: [
        { text: "The best among you are those who learn the Qur’an and teach it.", ref: "Bukhari" },
        { text: "Allah will raise those who have believed among you and those who were given knowledge, by degrees.", ref: "Surah Al-Mujadilah 58:11" }
    ],
    medium: [
        { text: "Man will have nothing except what he strives for.", ref: "Surah An-Najm 53:39" },
        { text: "Actions are judged by intentions.", ref: "Bukhari & Muslim" }
    ],
    low: [
        { text: "Allah is with those who are patient.", ref: "Surah Al-Baqarah 2:153" },
        { text: "Seeking knowledge is an obligation upon every Muslim.", ref: "Ibn Majah" }
    ]
};

function getQuoteByMarks(marks) {
    let category;
    if (marks >= 45) category = "high"; // Adjusted for out of 70
    else if (marks >= 35) category = "medium";
    else category = "low";

    const selected = quotes[category];
    return selected[Math.floor(Math.random() * selected.length)];
}

// State
let appData = null;
let currentResults = [];
let browsingZone = null;

// Initialize
async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Data fetch failed');
        appData = await response.json();
        
        renderHomeContent();
        setupEventListeners();
        
        // Hide initial loader
        setTimeout(() => {
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
            }, 300);
        }, 600);
        
    } catch (error) {
        console.error('Portal Initialization error:', error);
        alert('Could not connect to the official portal. Please try again later.');
    }
}

function setupEventListeners() {
    DOM.btn.search.addEventListener('click', handleSearch);
    
    // Browse Result Trigger
    DOM.btn.browseTrigger.addEventListener('click', () => {
        renderZoneList();
        switchView('browseZones');
    });

    // Back to Zones from Student Browse
    document.getElementById('back-to-zones').addEventListener('click', () => {
        switchView('browseZones');
    });

    // Centre Filter Change
    DOM.containers.centreFilter.addEventListener('change', (e) => {
        const centre = e.target.value;
        const filtered = getStudentsByZone(browsingZone, centre);
        renderStudentList(filtered);
    });
    
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'back-to-zones' || btn.id === 'detail-back-btn') return; // Handled separately or logic needed
            
            if (DOM.views.detail.classList.contains('active')) {
                 if (DOM.views.browseStudents.previousViewState === 'active') { // Custom check or simple back to search
                    // If we came from browse, go back there? For now, keep it simple.
                 }
            }
            
            switchView('search');
            DOM.inputs.phone.value = '';
            DOM.error.style.display = 'none';
        });
    });

    // Specific Detail Back Button logic
    document.getElementById('detail-back-btn').addEventListener('click', () => {
        if (currentResults.length > 1) {
            switchView('list');
        } else if (browsingZone) {
            switchView('browseStudents');
        } else {
            switchView('search');
        }
    });

    DOM.inputs.phone.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    DOM.inputs.phone.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        // Prevent first digit from being zero
        if (val.startsWith('0')) {
            val = val.substring(1);
        }
        e.target.value = val;
        DOM.error.style.display = 'none';
    });
}

function switchView(viewId) {
    Object.values(DOM.views).forEach(v => v.classList.remove('active'));
    DOM.views[viewId].classList.add('active');
    window.scrollTo(0, 0);
    if (viewId !== 'browseStudents') {
        // Reset browsing state if navigating away from browse sub-views
        if (viewId === 'search') browsingZone = null;
    }
}

// --- BROWSE LOGIC ---

function renderZoneList() {
    const zones = ["ALUVA ZONE", "ERNAKULAM ZONE", "KAKKANAD ZONE", "KOCHI ZONE", "KOTHAMANGALAM ZONE", "PALLURUTHY ZONE", "PARAVOOR ZONE", "PERUMBAVOOR ZONE", "VYPIN ZONE", "VYTILLA ZONE", "MUVATTUPUZHA ZONE"];
    DOM.containers.zones.innerHTML = '';
    
    zones.forEach(zone => {
        const el = document.createElement('div');
        el.className = 'zone-card';
        el.innerHTML = `
            <span>${zone}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        `;
        el.onclick = () => {
            browsingZone = zone;
            DOM.labels.currentZone.textContent = zone;
            
            // Populate centres filter
            const studentsInZone = getStudentsByZone(zone);
            const centres = [...new Set(studentsInZone.map(s => s.centre))];
            DOM.containers.centreFilter.innerHTML = '<option value="all">All Centres</option>';
            centres.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                DOM.containers.centreFilter.appendChild(opt);
            });
            
            renderStudentList(studentsInZone);
            switchView('browseStudents');
        };
        DOM.containers.zones.appendChild(el);
    });
}

function getStudentsByZone(zone, centreFilter = 'all') {
    const list = Object.values(appData.students).filter(s => s.zone === zone);
    if (centreFilter !== 'all') {
        return list.filter(s => s.centre === centreFilter);
    }
    return list;
}

function renderStudentList(students) {
    DOM.containers.browseResults.innerHTML = '';
    
    // Sort by marks desc
    const sorted = [...students].sort((a,b) => b.marks - a.marks);
    
    if (sorted.length === 0) {
        DOM.containers.browseResults.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">No students found in this centre.</p>';
        return;
    }

    sorted.forEach(student => {
        const el = document.createElement('div');
        el.className = 'student-list-item';
        el.style.cursor = 'pointer';
        el.innerHTML = `
            <div class="student-list-info">
                <h4>${student.name}</h4>
                <p>${student.centre}</p>
            </div>
            <div class="student-list-marks">${student.marks}/70</div>
        `;
        el.onclick = () => showStudentDetail(student);
        DOM.containers.browseResults.appendChild(el);
    });
}

// --- BASIC SEARCH & RENDER ---

async function handleSearch() {
    const phone = DOM.inputs.phone.value.trim();
    if (!phone || phone.length !== 10) {
        showError('Please enter exactly 10 digits');
        return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const studentIds = appData.phone_map[phone];
    if (!studentIds || studentIds.length === 0) {
        setLoading(false);
        switchView('empty');
        return;
    }

    browsingZone = null; // Clear browsing state since we are searching
    currentResults = studentIds.map(id => ({ id, ...appData.students[id] }));
    setLoading(false);

    if (currentResults.length === 1) {
        showStudentDetail(currentResults[0]);
    } else {
        showResultsList(currentResults);
    }
}

function renderHomeContent() {
    if (appData.metadata) {
        DOM.stats.stripDate.textContent = appData.metadata.exam_date;
        DOM.stats.stripZones.textContent = `${appData.metadata.total_zones} Zones`;
        
        // Milestone logic: round down to nearest 50
        const milestone = Math.floor(appData.total_participants / 50) * 50;
        DOM.stats.stripStudents.textContent = `${milestone}+ Students`;
    }
    
    DOM.containers.toppers.innerHTML = '';
    if (appData.top_scorers) {
        appData.top_scorers.forEach((topper, index) => {
            const el = document.createElement('div');
            el.className = `topper-card rank-${index + 1}`;
            el.innerHTML = `
                <div class="rank-badge">${index + 1}</div>
                <div class="topper-info">
                    <h4>${topper.name}</h4>
                    <p>${topper.zone}</p>
                </div>
                <div class="topper-marks">${topper.marks}<span>/70</span></div>
            `;
            DOM.containers.toppers.appendChild(el);
        });
    }

    renderContacts(DOM.containers.contacts);
    renderContacts(DOM.containers.emptyContacts);
}

function renderContacts(container) {
    container.innerHTML = '';
    if (appData.contacts) {
        appData.contacts.forEach(contact => {
            const el = document.createElement('div');
            el.className = 'contact-card';
            el.innerHTML = `
                <div class="contact-info">
                    <h4>${contact.zone}</h4>
                    <p>${contact.name}</p>
                </div>
                <a href="tel:${contact.phone}" class="call-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </a>
            `;
            container.appendChild(el);
        });
    }
}

function showResultsList(results) {
    DOM.containers.results.innerHTML = '';
    results.forEach(student => {
        const card = document.createElement('div');
        card.className = 'contact-card' + ' clickable';
        card.style.cursor = 'pointer';
        card.style.marginBottom = '12px';
        card.innerHTML = `
            <div class="contact-info">
                <h4 style="font-size: 1.1rem;">${student.name}</h4>
                <p>Zone: ${student.zone}</p>
            </div>
            <div style="color: var(--primary);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        `;
        card.onclick = () => showStudentDetail(student);
        DOM.containers.results.appendChild(card);
    });
    switchView('list');
}

function showStudentDetail(student) {
    const quote = getQuoteByMarks(student.marks);
    DOM.containers.detail.innerHTML = `
        <div class="branding" style="padding-bottom: 10px;">
            <h2 class="view-title">Result Scorecard</h2>
        </div>

        <div class="score-badge">
            <div class="score-val">${student.marks}</div>
            <div class="score-label">Score / 70</div>
        </div>

        <div class="topper-card" style="padding: 24px; display: block;">
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F1F3F5;">
                <span style="color: var(--text-muted); font-size: 0.9rem;">Student Name</span>
                <span style="font-weight: 600;">${student.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F1F3F5;">
                <span style="color: var(--text-muted); font-size: 0.9rem;">Registration No.</span>
                <span style="font-weight: 600;">${student.reg_no || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F1F3F5;">
                <span style="color: var(--text-muted); font-size: 0.9rem;">Exam Zone</span>
                <span style="font-weight: 600;">${student.zone}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F1F3F5;">
                <span style="color: var(--text-muted); font-size: 0.9rem;">Centre</span>
                <span style="font-weight: 600;">${student.centre}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border: none;">
                <span style="color: var(--primary); font-weight: 700;">STATUS</span>
                <span style="color: #2D6A4F; font-weight: 800; text-transform: uppercase;">✔ Passed</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 40px; opacity: 0.9; padding: 0 20px;">
             <p style="font-size: 0.9rem; color: var(--primary); font-style: italic; font-weight: 500; line-height: 1.5;">
                "${quote.text}"
            </p>
            <p style="font-size: 0.8rem; color: var(--accent); font-weight: 700; margin-top: 8px;">— ${quote.ref}</p>
        </div>
    `;
    switchView('detail');
}

function setLoading(isLoading) {
    if (isLoading) {
        DOM.btn.search.disabled = true;
        DOM.btn.text.classList.add('hidden');
        DOM.btn.loader.classList.remove('hidden');
    } else {
        DOM.btn.search.disabled = false;
        DOM.btn.text.classList.remove('hidden');
        DOM.btn.loader.classList.add('hidden');
    }
}

function showError(msg) {
    DOM.error.textContent = msg;
    DOM.error.style.display = 'block';
    DOM.inputs.phone.focus();
}

// Start app
init();
