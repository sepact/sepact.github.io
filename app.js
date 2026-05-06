/* ══════════════════════════════════════
   SEPACTCLIENT — APP.JS
   Auth system + Dashboard logic
══════════════════════════════════════ */

// ─────────────────────────────────────
// USERS STORE (localStorage)
// ─────────────────────────────────────
const STORAGE_KEY = 'sepact_users';
const SESSION_KEY = 'sepact_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Seed demo accounts
(function seedDemoAccounts() {
  const users = getUsers();
  if (!users['admin']) {
    users['admin'] = {
      pseudo: 'admin',
      email: 'admin@sepact.io',
      password: 'admin123',
      plan: 'enterprise',
      createdAt: '2024-01-01'
    };
  }
  if (!users['demo']) {
    users['demo'] = {
      pseudo: 'demo',
      email: 'demo@sepact.io',
      password: 'demo123',
      plan: 'pro',
      createdAt: '2024-06-15'
    };
  }
  saveUsers(users);
})();

// ─────────────────────────────────────
// MODALS
// ─────────────────────────────────────
function openLogin() {
  closeRegister();
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('loginError').style.display = 'none';
}

function closeLogin() {
  document.getElementById('loginModal').classList.remove('active');
}

function openRegister() {
  closeLogin();
  document.getElementById('registerModal').classList.add('active');
  document.getElementById('registerError').style.display = 'none';
}

function closeRegister() {
  document.getElementById('registerModal').classList.remove('active');
}

function closeOnOverlay(e) {
  if (e.target === e.currentTarget) {
    closeLogin();
    closeRegister();
  }
}

// Escape key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLogin(); closeRegister(); }
});

// ─────────────────────────────────────
// AUTH LOGIC
// ─────────────────────────────────────
function doLogin() {
  const pseudo = document.getElementById('loginUser').value.trim();
  const pass   = document.getElementById('loginPass').value;

  const users = getUsers();
  const user  = users[pseudo.toLowerCase()];

  if (!user || user.password !== pass) {
    const err = document.getElementById('loginError');
    err.textContent = 'Pseudo ou mot de passe incorrect.';
    err.style.display = 'block';
    return;
  }

  saveSession(user);
  closeLogin();
  loadDashboard(user);
}

function doRegister() {
  const pseudo = document.getElementById('regUser').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  const plan   = document.getElementById('regPlan').value;
  const err    = document.getElementById('registerError');

  if (!pseudo || !email || !pass) {
    err.textContent = 'Tous les champs sont requis.';
    err.style.display = 'block';
    return;
  }
  if (pass.length < 6) {
    err.textContent = 'Mot de passe trop court (6 caractères minimum).';
    err.style.display = 'block';
    return;
  }

  const users = getUsers();
  if (users[pseudo.toLowerCase()]) {
    err.textContent = 'Ce pseudo est déjà utilisé.';
    err.style.display = 'block';
    return;
  }

  const newUser = {
    pseudo,
    email,
    password: pass,
    plan,
    createdAt: new Date().toISOString().split('T')[0]
  };

  users[pseudo.toLowerCase()] = newUser;
  saveUsers(users);
  saveSession(newUser);
  closeRegister();
  loadDashboard(newUser);
}

function doLogout() {
  clearSession();
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('navbar').style.display = 'flex';
  window.scrollTo(0, 0);
}

// ─────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────
const DOWNLOADS = {
  starter: [
    {
      icon: '⬇️',
      name: 'SepactClient Starter',
      desc: 'Client de base pour débuter',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🍎',
      name: 'SepactClient macOS',
      desc: 'Client pour macOS 12+',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.dmg',
      locked: false
    },
    {
      icon: '🐧',
      name: 'SepactClient Linux',
      desc: 'AppImage universel',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.AppImage',
      locked: false
    },
    {
      icon: '🚀',
      name: 'SepactClient Pro',
      desc: 'Client avancé — Plan Pro requis',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.exe',
      locked: true,
      lockMsg: '🔒 Plan Pro ou supérieur requis'
    },
    {
      icon: '🏢',
      name: 'SepactClient Enterprise',
      desc: 'Client full-feature — Plan Enterprise',
      version: 'v2.4.1',
      file: 'SepactClient-Enterprise-v2.4.1.exe',
      locked: true,
      lockMsg: '🔒 Plan Enterprise requis'
    }
  ],
  pro: [
    {
      icon: '⬇️',
      name: 'SepactClient Starter',
      desc: 'Client de base',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🍎',
      name: 'SepactClient macOS',
      desc: 'Client pour macOS 12+',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.dmg',
      locked: false
    },
    {
      icon: '🐧',
      name: 'SepactClient Linux',
      desc: 'AppImage universel',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.AppImage',
      locked: false
    },
    {
      icon: '🚀',
      name: 'SepactClient Pro — Windows',
      desc: 'Client avancé avec analytics',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🍏',
      name: 'SepactClient Pro — macOS',
      desc: 'Client avancé pour macOS',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.dmg',
      locked: false
    },
    {
      icon: '🏢',
      name: 'SepactClient Enterprise',
      desc: 'Client full-feature — Plan Enterprise',
      version: 'v2.4.1',
      file: 'SepactClient-Enterprise-v2.4.1.exe',
      locked: true,
      lockMsg: '🔒 Plan Enterprise requis'
    }
  ],
  enterprise: [
    {
      icon: '⬇️',
      name: 'SepactClient Starter',
      desc: 'Client de base',
      version: 'v2.4.1',
      file: 'SepactClient-Starter-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🚀',
      name: 'SepactClient Pro — Windows',
      desc: 'Client avancé avec analytics',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🍏',
      name: 'SepactClient Pro — macOS',
      desc: 'Client avancé pour macOS',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.dmg',
      locked: false
    },
    {
      icon: '🐧',
      name: 'SepactClient Pro — Linux',
      desc: 'Client avancé AppImage',
      version: 'v2.4.1',
      file: 'SepactClient-Pro-v2.4.1.AppImage',
      locked: false
    },
    {
      icon: '🏢',
      name: 'SepactClient Enterprise — Win',
      desc: 'Suite complète toutes fonctionnalités',
      version: 'v2.4.1',
      file: 'SepactClient-Enterprise-v2.4.1.exe',
      locked: false
    },
    {
      icon: '🏢',
      name: 'SepactClient Enterprise — macOS',
      desc: 'Suite complète pour macOS',
      version: 'v2.4.1',
      file: 'SepactClient-Enterprise-v2.4.1.dmg',
      locked: false
    },
    {
      icon: '🏢',
      name: 'SepactClient Enterprise — Linux',
      desc: 'Suite complète AppImage',
      version: 'v2.4.1',
      file: 'SepactClient-Enterprise-v2.4.1.AppImage',
      locked: false
    }
  ]
};

function loadDashboard(user) {
  // Hide landing
  document.getElementById('navbar').style.display = 'none';
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');

  // Fill header info
  document.getElementById('dashUser').textContent = user.pseudo;
  document.getElementById('dashPlan').textContent = user.plan.toUpperCase();

  // Fill account section
  document.getElementById('accUser').textContent  = user.pseudo;
  document.getElementById('accEmail').textContent = user.email;
  document.getElementById('accPlan').textContent  = user.plan.charAt(0).toUpperCase() + user.plan.slice(1);
  document.getElementById('accDate').textContent  = user.createdAt;
  document.getElementById('accountAvatar').textContent = user.pseudo[0].toUpperCase();

  // Hide upgrade banner if pro/enterprise
  if (user.plan !== 'starter') {
    document.getElementById('upgradeBanner').style.display = 'none';
  }

  // Build download grid
  const grid = document.getElementById('downloadGrid');
  grid.innerHTML = '';
  const files = DOWNLOADS[user.plan] || DOWNLOADS.starter;

  files.forEach(f => {
    const card = document.createElement('div');
    card.className = 'dl-card' + (f.locked ? ' locked' : '');
    card.innerHTML = `
      <div class="dl-icon">${f.icon}</div>
      <div>
        <div class="dl-name">${f.name}</div>
        <div class="dl-meta">${f.desc}</div>
        <div class="dl-version">${f.version}</div>
        ${f.locked ? `<div class="dl-lock">${f.lockMsg}</div>` : ''}
      </div>
      ${!f.locked
        ? `<button class="btn-primary" onclick="fakeDownload('${f.file}')">⬇ Télécharger</button>`
        : `<button class="btn-outline" style="opacity:.4;cursor:not-allowed;" disabled>Verrouillé</button>`
      }
    `;
    grid.appendChild(card);
  });

  // Default section
  showSection('overview');
}

function fakeDownload(filename) {
  // Simulates a download (replace with real URL in production)
  const link = document.createElement('a');
  link.href = '#';
  link.download = filename;
  const btn = event.target;
  btn.textContent = '✓ Téléchargement...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '⬇ Télécharger';
    btn.disabled = false;
    alert(`Simulation : "${filename}" serait téléchargé ici.\nRemplacez href avec votre lien réel.`);
  }, 1500);
}

// ─────────────────────────────────────
// NAV INSIDE DASHBOARD
// ─────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  document.getElementById('sec-' + name).classList.remove('hidden');

  const links = document.querySelectorAll('.sidebar-link');
  const map = { overview: 0, download: 1, account: 2, settings: 3 };
  if (links[map[name]]) links[map[name]].classList.add('active');
}

// ─────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ─────────────────────────────────────
// AUTO-LOGIN IF SESSION EXISTS
// ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (session) {
    loadDashboard(session);
  }
});

// Enter key in login form
document.addEventListener('DOMContentLoaded', () => {
  ['loginUser', 'loginPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
  ['regUser', 'regEmail', 'regPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  });
});
