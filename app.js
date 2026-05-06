/* ══════════════════════════════════════
   SEPACTCLIENT — APP.JS
   Auth via Firebase (module inline) + Dashboard
   Compatible avec la structure HTML existante
══════════════════════════════════════ */

// ─────────────────────────────────────
// MODAL HELPERS
// ─────────────────────────────────────
function openLogin() {
  closeRegister();
  const m = document.getElementById('loginModal');
  if (m) m.classList.add('active');
  const err = document.getElementById('loginError');
  if (err) err.style.display = 'none';
  // Focus email field after animation
  setTimeout(() => {
    const f = document.getElementById('loginEmail');
    if (f) f.focus();
  }, 200);
}

function closeLogin() {
  const m = document.getElementById('loginModal');
  if (m) m.classList.remove('active');
}

function openRegister() {
  closeLogin();
  const m = document.getElementById('registerModal');
  if (m) m.classList.add('active');
  const err = document.getElementById('registerError');
  if (err) err.style.display = 'none';
  const ok = document.getElementById('registerSuccess');
  if (ok) ok.style.display = 'none';
  setTimeout(() => {
    const f = document.getElementById('regUsername');
    if (f) f.focus();
  }, 200);
}

function closeRegister() {
  const m = document.getElementById('registerModal');
  if (m) m.classList.remove('active');
}

function closeOnOverlay(event, modalId) {
  if (event.target === event.currentTarget) {
    if (modalId === 'loginModal') closeLogin();
    if (modalId === 'registerModal') closeRegister();
  }
}

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLogin(); closeRegister(); }
});

// Enter key in forms
document.addEventListener('DOMContentLoaded', () => {
  const loginFields = ['loginEmail', 'loginPass'];
  loginFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });

  const regFields = ['regUsername', 'regEmail', 'regPass'];
  regFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  });
});

// ─────────────────────────────────────
// AUTH LOGIC (Firebase via window._fbAuth)
// ─────────────────────────────────────
async function doLogin() {
  const email = (document.getElementById('loginEmail')?.value || '').trim();
  const pass  = (document.getElementById('loginPass')?.value  || '');
  const err   = document.getElementById('loginError');
  const btn   = document.getElementById('loginBtn');

  if (!email || !pass) {
    showError(err, 'Veuillez remplir tous les champs.');
    return;
  }

  setLoading(btn, true, 'Connexion…');

  try {
    const auth    = window._fbAuth;
    const { signInWithEmailAndPassword } = window._fbFns;
    const cred    = await signInWithEmailAndPassword(auth, email, pass);
    const user    = cred.user;

    const db      = window._fbDb;
    const { doc, getDoc } = window._fbFns;
    let userData  = {
      username:  user.displayName || email.split('@')[0],
      email:     user.email,
      plan:      'free',
      createdAt: null
    };
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) userData = { ...userData, ...snap.data() };
    } catch (_) {}

    closeLogin();
    loadDashboard(userData);
  } catch (e) {
    const msg = firebaseErrMsg(e.code);
    showError(err, msg);
    setLoading(btn, false, 'Se connecter →');
  }
}

async function doRegister() {
  const username = (document.getElementById('regUsername')?.value || '').trim();
  const email    = (document.getElementById('regEmail')?.value    || '').trim();
  const pass     = (document.getElementById('regPass')?.value     || '');
  const err      = document.getElementById('registerError');
  const ok       = document.getElementById('registerSuccess');
  const btn      = document.getElementById('registerBtn');

  if (ok) ok.style.display = 'none';

  if (!username || !email || !pass) {
    showError(err, 'Tous les champs sont requis.');
    return;
  }
  if (pass.length < 6) {
    showError(err, 'Mot de passe trop court (6 caractères minimum).');
    return;
  }

  setLoading(btn, true, 'Création du compte…');

  try {
    const auth = window._fbAuth;
    const { createUserWithEmailAndPassword, updateProfile, doc, setDoc, serverTimestamp } = window._fbFns;
    const db   = window._fbDb;

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    // Update display name
    await updateProfile(user, { displayName: username }).catch(() => {});

    // Save user in Firestore
    const userData = {
      username,
      email,
      plan: 'free',
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'users', user.uid), userData).catch(() => {});

    if (err) err.style.display = 'none';
    if (ok) {
      ok.textContent = 'Compte créé ! Connexion en cours…';
      ok.style.display = 'block';
    }

    setTimeout(() => {
      closeRegister();
      loadDashboard({ username, email, plan: 'free', createdAt: new Date().toISOString().split('T')[0] });
    }, 900);

  } catch (e) {
    const msg = firebaseErrMsg(e.code);
    showError(err, msg);
    setLoading(btn, false, 'Créer mon compte →');
  }
}

function doLogout() {
  const auth  = window._fbAuth;
  const { signOut } = window._fbFns || {};
  if (auth && signOut) signOut(auth).catch(() => {});
  hideDashboard();
}

function goHome() {
  hideDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────
function loadDashboard(userData) {
  const username = userData.username || userData.email?.split('@')[0] || 'User';
  const email    = userData.email    || '—';
  const plan     = userData.plan     || 'free';
  const initial  = username[0].toUpperCase();

  // Show date
  let dateStr = '—';
  if (userData.createdAt) {
    if (typeof userData.createdAt === 'string') {
      dateStr = userData.createdAt;
    } else if (userData.createdAt.toDate) {
      dateStr = userData.createdAt.toDate().toLocaleDateString('fr-FR');
    }
  }

  // Hide landing, show dashboard
  document.getElementById('landing')?.style?.setProperty('display', 'none');
  document.getElementById('navbar')?.style?.setProperty('display', 'none');

  const dash = document.getElementById('dashboard');
  if (dash) dash.classList.remove('hidden');

  // Topbar
  setText('topbarName',    username);
  setText('topbarAvatar',  initial);
  setText('topbarPage',    'Dashboard');

  // Account section
  setText('dashAvatarLg',   initial);
  setText('dashDisplayName', username);
  setText('dashEmail',       email);
  setText('infoUsername',    username);
  setText('infoEmail',       email);
  setText('infoDate',        dateStr);

  // Show first tab
  showTab('account');
}

function hideDashboard() {
  const dash = document.getElementById('dashboard');
  if (dash) dash.classList.add('hidden');

  document.getElementById('landing')?.style?.removeProperty('display');
  document.getElementById('navbar')?.style?.removeProperty('display');

  // Reset modals
  closeLogin(); closeRegister();
}

// ─────────────────────────────────────
// TAB NAVIGATION
// ─────────────────────────────────────
const TAB_MAP = {
  account:       'sec-account',
  client:        'sec-client',
  subscriptions: 'sec-subscriptions',
  support:       'sec-support'
};

function showTab(name) {
  // Update sections
  Object.values(TAB_MAP).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(TAB_MAP[name]);
  if (target) target.classList.remove('hidden');

  // Update tab buttons
  document.querySelectorAll('.dash-tab').forEach(btn => btn.classList.remove('active'));
  const activeTab = document.getElementById('tab-' + name);
  if (activeTab) activeTab.classList.add('active');

  // Update topbar page label
  const labels = {
    account:       'Compte',
    client:        'Client',
    subscriptions: 'Abonnements',
    support:       'Support'
  };
  setText('topbarPage', labels[name] || 'Dashboard');
}

// ─────────────────────────────────────
// DOWNLOAD (simulé)
// ─────────────────────────────────────
function fakeDownload(filename) {
  const btn = event?.currentTarget || event?.target;
  if (!btn) return;

  const orig = btn.textContent;
  btn.textContent = '↓ Téléchargement…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = '✓ Prêt !';
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
    }, 1200);
  }, 1000);
}

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function setLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = label;
}

function firebaseErrMsg(code) {
  const map = {
    'auth/user-not-found':        'Aucun compte avec cet email.',
    'auth/wrong-password':        'Mot de passe incorrect.',
    'auth/invalid-credential':    'Email ou mot de passe incorrect.',
    'auth/email-already-in-use':  'Cet email est déjà utilisé.',
    'auth/weak-password':         'Mot de passe trop faible.',
    'auth/invalid-email':         'Adresse email invalide.',
    'auth/too-many-requests':     'Trop de tentatives. Réessayez plus tard.',
    'auth/network-request-failed':'Erreur réseau. Vérifiez votre connexion.',
  };
  return map[code] || 'Une erreur est survenue. Réessayez.';
}
