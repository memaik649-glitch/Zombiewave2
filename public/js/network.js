// ═══════════════════════════════════════════════════════
//  SOCKET.IO
// ═══════════════════════════════════════════════════════
let socket = null;
let currentParty = null;
let isPartyLeader = false;
let myReadyState = false;
let mpMode = null; // 'solo' | 'coop' | 'versus'

function connectSocket() {
  if (socket && socket.connected) return;
  socket = io();

  socket.on('connect', () => {
    if (authToken) socket.emit('auth', authToken);
  });
  socket.on('auth:ok', () => { console.log('Socket authenticated'); if(currentUser?.username?.toLowerCase()==='mrmaik') wireAdminSocket(); });

  // Party events
  socket.on('party:created', ({ code, party }) => {
    currentParty = party; isPartyLeader = true; myReadyState = false;
    showLobby(code, party);
  });
  socket.on('party:joined', ({ code, party }) => {
    currentParty = party; isPartyLeader = false; myReadyState = false;
    showLobby(code, party);
  });
  socket.on('party:update', (party) => {
    currentParty = party;
    renderLobbyMembers(party);
    const isLeader = (party.leader||'').toLowerCase() === (currentUser.username||'').toLowerCase();
    isPartyLeader = isLeader;
    document.getElementById('lobby-start-btn').style.display = isLeader ? 'inline-block' : 'none';
  });
  socket.on('party:memberJoined', ({ username }) => addChat(`★ ${username} ist beigetreten`));
  socket.on('party:memberLeft', ({ username }) => addChat(`✗ ${username} hat die Party verlassen`));
  socket.on('party:leaderChanged', ({ newLeader }) => addChat(`👑 ${newLeader} ist jetzt Leader`));
  socket.on('party:chat', ({ from, msg }) => addChat(`${from}: ${msg}`));
  socket.on('party:joinError', (msg) => {
    document.getElementById('mp-err').textContent = msg;
  });
  socket.on('party:friendInvite', ({ from, code }) => {
    if (confirm(from + ' lädt dich in Party ' + code + ' ein! Beitreten?')) {
      menuTab('mp');
      document.getElementById('join-code-input').value = code;
      joinParty();
    }
  });
  socket.on('party:left', () => {
    currentParty = null; isPartyLeader = false;
    document.getElementById('mp-lobby').style.display = 'none';
    document.getElementById('mp-lobby-pre').style.display = 'block';
  });

  // Game events (multiplayer)
  socket.on('game:start', ({ mode, diff, level }) => {
    mpMode = mode;
    selectedDiff = diff;
    if(level) selectedLevel = level;
    startMPGame();
  });
  socket.on('game:tick', (snapshot) => {
    if (!gameRunning || !G) return;
    // Update remote players and server-authoritative enemies
    G.mpSnapshot = snapshot;
  });
  socket.on('game:enemyDied', ({ enemyId }) => {
    if (!G) return;
    G.enemies = G.enemies.filter(e => e.id !== enemyId);
  });
  socket.on('game:bossWarning', () => {
    if (G) { G.bossWarn = 150; }
  });
  socket.on('game:bossSpawned', (bossData) => {
    if (!G) return;
    G.boss = bossData; G.bossActive = true;
    document.getElementById('boss-bar').style.display = 'block';
  });
  socket.on('game:bossDefeated', ({ killer }) => {
    if (!G) return;
    G.bossActive = false; G.boss = null;
    document.getElementById('boss-bar').style.display = 'none';
    spawnFT(G.px, G.py - 50, killer + ': BOSS!', '#f7c948');
    G.lootDrops.push({ x: G.px, y: G.py, bob: 0, life: 600 });
  });
  socket.on('game:bossSlam', ({ x, y, r }) => {
    if (!G) return;
    G.aoeRings.push({ x, y, r: 0, maxR: r, life: 45 });
  });
  socket.on('game:playerDamaged', ({ username, hp }) => {
    if (!G) return;
    if (username === currentUser.username) {
      G.playerHp = hp;
      if (hp <= 0) endRound(false);
    }
    updateMPPlayerCards();
  });
  socket.on('game:playerDied', ({ username }) => {
    if (username !== currentUser.username) {
      spawnFT(G.px, G.py - 40, username + ' ☠', '#e74c3c');
    }
    updateMPPlayerCards();
  });
  socket.on('game:newWave', ({ wave }) => {
    if (G) { G.wave = wave; spawnFT(G.px, G.py - 55, 'WELLE ' + wave + '!', '#7ecff7'); }
  });
  socket.on('game:over', ({ reason, results, wave, gameTime }) => {
    if (!gameRunning) return;
    handleMPGameOver(results, wave, gameTime);
  });
}
// ═══════════════════════════════════════════════════════
//  PARTY UI
// ═══════════════════════════════════════════════════════
let selectedMpMode = 'coop';
let selectedMpLevel = 1;
let selectedMpDiff = 'easy';

function selMode(m, el) {
  selectedMpMode = m;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}
function selMpDiff(d, el) {
  selectedMpDiff = d;
  document.querySelectorAll('#mp-diff-grid .diff-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}

function createParty() {
  if (!socket) return;
  socket.emit('party:create', { mode: selectedMpMode, diff: selectedMpDiff, level: selectedMpLevel });
}
function joinParty() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (!code || code.length !== 5) { document.getElementById('mp-err').textContent = 'Bitte 5-stelligen Code eingeben.'; return; }
  if (!socket) return;
  socket.emit('party:join', code);
}
function leaveParty() {
  if (socket) socket.emit('party:leave');
  currentParty = null;
  document.getElementById('mp-lobby').style.display = 'none';
  document.getElementById('mp-lobby-pre').style.display = 'block';
}
function toggleReady() {
  myReadyState = !myReadyState;
  if (socket) socket.emit('party:ready', myReadyState);
  const btn = document.getElementById('lobby-ready-btn');
  btn.textContent = myReadyState ? '✓ ' + t('ready') : t('ready');
  btn.className = 'btn ' + (myReadyState ? 'green' : 'grey');
}
function leaderStartGame() {
  if (socket) socket.emit('party:startGame');
  document.getElementById('lobby-err').textContent = '';
}
function sendChat() {
  const inp = document.getElementById('chat-input');
  if (!inp.value.trim()) return;
  if (socket) socket.emit('party:chat', inp.value.trim());
  inp.value = '';
}
function addChat(msg) {
  const box = document.getElementById('lobby-chat');
  if (!box) return;
  const div = document.createElement('div'); div.className = 'msg';
  div.innerHTML = msg;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function showLobby(code, party) {
  document.getElementById('mp-lobby-pre').style.display = 'none';
  document.getElementById('mp-lobby').style.display = 'block';
  document.getElementById('lobby-code').textContent = code;
  document.getElementById('lobby-chat').innerHTML = '';
  const lvlName = (LEVELS.find(l=>l.id===(party.level||1))||LEVELS[0]).name;
  addChat('🎮 Party ' + code + ' erstellt! Level: ' + lvlName + ' – ' + t('mp_waiting'));
  renderLobbyMembers(party);
  const isLeader = (party.leader||'').toLowerCase() === (currentUser.username||'').toLowerCase();
  document.getElementById('lobby-start-btn').style.display = isLeader ? 'inline-block' : 'none';
}


function renderLobbyMembers(party) {
  const el = document.getElementById('lobby-members'); el.innerHTML = '';
  (party.members || []).forEach(m => {
    const d = document.createElement('div'); d.className = 'party-member';
    d.innerHTML = `
      <span>${m.username}</span>
      ${m.isLeader ? `<span class="leader-badge">Leader</span>` : ''}
      <span class="ready-dot ${m.ready ? 'on' : 'off'}"></span>`;
    el.appendChild(d);
  });
}

function updateMPPlayerCards() {
  const bar = document.getElementById('mp-player-bar');
  if (!bar || !G || !G.mpSnapshot) return;
  bar.innerHTML = '';
  (G.mpSnapshot.members || []).forEach(m => {
    const card = document.createElement('div');
    const isMe = m.username === currentUser.username;
    card.className = 'mp-player-card' + (isMe ? ' me' : '');
    card.innerHTML = `<div class="mp-name">${isMe ? '★ ' : ''}${m.username}</div>
      <div class="mp-hp">❤ ${Math.max(0,Math.round(m.hp||0))}</div>
      <div class="mp-kills">☠ ${m.kills||0}</div>`;
    bar.appendChild(card);
  });
}
