// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
let currentUser = null;

async function doLogin() {
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;
  const err = document.getElementById('l-err');
  try {
    const res = await api('POST', '/api/login', { username: u, password: p });
    authToken = res.token;
    localStorage.setItem('zw_token', authToken);
    currentUser = res.user;
    err.textContent = '';
    loginAs();
  } catch (e) { err.textContent = e.message; }
}

async function doRegister() {
  const u = document.getElementById('r-user').value.trim();
  const p = document.getElementById('r-pass').value;
  const p2 = document.getElementById('r-pass2').value;
  const err = document.getElementById('r-err');
  if (p !== p2) { err.textContent = t('password_ph') + ' ≠'; return; }
  try {
    const res = await api('POST', '/api/register', { username: u, password: p });
    authToken = res.token;
    localStorage.setItem('zw_token', authToken);
    currentUser = res.user;
    err.textContent = '';
    loginAs();
  } catch (e) { err.textContent = e.message; }
}

function doLogout() {
  authToken = ''; localStorage.removeItem('zw_token'); currentUser = null;
  hideAll(); show('ov-auth');
  if (socket) { socket.disconnect(); socket = null; }
}

function authTab(t2) {
  document.getElementById('auth-login').style.display = t2 === 'login' ? 'block' : 'none';
  document.getElementById('auth-reg').style.display = t2 === 'register' ? 'block' : 'none';
  document.querySelectorAll('#ov-auth .tab').forEach((b,i) =>
    b.classList.toggle('on', (t2==='login'&&i===0)||(t2==='register'&&i===1)));
}

function loginAs() {
  connectSocket();
  setTimeout(checkFriendNotifications, 1000);
  // Check if this user has been granted admin
  setTimeout(async()=>{
    try{
      const me=await api('GET','/api/me');
      if(me.isAdmin){
        const btn=document.getElementById('granted-admin-btn');
        if(btn) btn.style.display='block';
      }
    }catch(e){}
  }, 1200);
  const isAdmin = currentUser.username.toLowerCase() === 'mrmaik';
  if (currentUser.firstPlay && !isAdmin) {
    saveUserServer({ firstPlay: false });
    hideAll(); openMenu(); // tutorial could be added here
  } else {
    hideAll(); openMenu();
  }
}

async function saveUserServer(data) {
  try { const updated = await api('PUT', '/api/me', data); currentUser = updated; }
  catch (e) { console.error('Save error:', e.message); }
}

// Auto-login on load
window.addEventListener('load', async () => {
  applyTranslations();
  if (authToken) {
    try {
      currentUser = await api('GET', '/api/me');
      loginAs();
      return;
    } catch { authToken = ''; localStorage.removeItem('zw_token'); }
  }
  show('ov-auth');
});
