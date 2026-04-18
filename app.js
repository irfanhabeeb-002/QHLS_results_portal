/**
 * QHLS Result Portal v2.0
 * Official ISM Ernakulam Exam Portal
 */

// DOM Elements
let DOM = {};

function initDOM() {
    DOM = {
        views: {
            search: document.getElementById('view-search'),
            list: document.getElementById('view-list'),
            detail: document.getElementById('view-detail'),
            empty: document.getElementById('view-empty')
        },
        btn: {
            search: document.getElementById('search-btn'),
            text: document.getElementById('btn-text'),
            loader: document.getElementById('btn-loader')
        },
        inputs: {
            phone: document.getElementById('phone-input')
        },
        containers: {
            toppers: document.getElementById('toppers-list'),
            contacts: document.getElementById('contacts-list'),
            emptyContacts: document.getElementById('empty-contacts'),
            results: document.getElementById('results-list'),
            detail: document.getElementById('student-detail-content')
        },
        stats: {
            total: document.getElementById('total-participants'),
            stripDate: document.getElementById('strip-date'),
            stripZones: document.getElementById('strip-zones'),
            stripStudents: document.getElementById('strip-students')
        },
        error: document.getElementById('search-error')
    };
}

// Advanced Quote Logic
const quotes = {
    high: [
        {
            text: "The best among you are those who learn the Qur’an and teach it.",
            ref: "Bukhari"
        },
        {
            text: "Allah will raise those who have believed among you and those who were given knowledge, by degrees.",
            ref: "Surah Al-Mujadilah 58:11"
        }
    ],
    medium: [
        {
            text: "Man will have nothing except what he strives for.",
            ref: "Surah An-Najm 53:39"
        },
        {
            text: "Actions are judged by intentions.",
            ref: "Bukhari & Muslim"
        }
    ],
    low: [
        {
            text: "Allah is with those who are patient.",
            ref: "Surah Al-Baqarah 2:153"
        },
        {
            text: "Seeking knowledge is an obligation upon every Muslim.",
            ref: "Ibn Majah"
        }
    ]
};

function getQuoteByMarks(marks) {
    let category;
    if (marks >= 60) category = "high";
    else if (marks >= 50) category = "medium";
    else category = "low";

    const selected = quotes[category];
    return selected[Math.floor(Math.random() * selected.length)];
}

// State
let appData = null;
let currentResults = [];

// Initialize
async function init() {
    try {
        initDOM(); // Ensure DOM references are captured after script loads
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
    
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (DOM.views.detail.classList.contains('active') && currentResults.length > 1) {
                switchView('list');
            } else {
                switchView('search');
                DOM.inputs.phone.value = '';
                DOM.error.style.display = 'none';
            }
        });
    });

    DOM.inputs.phone.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    DOM.inputs.phone.addEventListener('input', () => {
        DOM.error.style.display = 'none';
    });
}

async function handleSearch() {
    const phone = DOM.inputs.phone.value.trim();

    if (!phone || phone.length < 10) {
        showError('Please enter a valid 10-digit phone number');
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

    currentResults = studentIds.map(id => ({ id, ...appData.students[id] }));
    setLoading(false);

    if (currentResults.length === 1) {
        showStudentDetail(currentResults[0]);
    } else {
        showResultsList(currentResults);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        DOM.btn.text.classList.add('hidden');
        DOM.btn.loader.classList.remove('hidden');
        DOM.btn.search.disabled = true;
    } else {
        DOM.btn.text.classList.remove('hidden');
        DOM.btn.loader.classList.add('hidden');
        DOM.btn.search.disabled = false;
    }
}

function showError(msg) {
    DOM.error.textContent = msg;
    DOM.error.style.display = 'block';
    DOM.inputs.phone.focus();
}

function switchView(viewId) {
    Object.values(DOM.views).forEach(v => v.classList.remove('active'));
    DOM.views[viewId].classList.add('active');
    window.scrollTo(0, 0);
}

function renderHomeContent() {
    if (appData.metadata) {
        if (DOM.stats.stripDate) DOM.stats.stripDate.textContent = appData.metadata.exam_date;
        if (DOM.stats.stripZones) DOM.stats.stripZones.textContent = `${appData.metadata.total_zones} Zones`;
        if (DOM.stats.stripStudents) DOM.stats.stripStudents.textContent = `${appData.total_participants}+ Students`;
    }
    
    if (DOM.stats.total) {
        DOM.stats.total.textContent = appData.total_participants?.toLocaleString() || '...';
    }
    
    DOM.containers.toppers.innerHTML = '';
    if (appData.top_scorers) {
        appData.top_scorers.forEach((topper, index) => {
            const el = document.createElement('div');
            el.className = 'topper-card';
            el.innerHTML = `
                <div class="rank-circle">#${index + 1}</div>
                <div class="topper-info">
                    <h4>${topper.name}</h4>
                    <p>${topper.zone}</p>
                </div>
                <div class="topper-marks">${topper.marks}</div>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
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

        <div style="background: var(--primary); padding: 40px 20px; border-radius: var(--radius-lg); color: var(--white); text-align: center; margin-bottom: 24px; box-shadow: var(--shadow-lg);">
            <div style="font-size: 4.5rem; font-weight: 800; line-height: 1; margin-bottom: 5px;">${student.marks}</div>
            <div style="font-size: 0.9rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 1.5px;">Final Score</div>
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

// Start app
init();
