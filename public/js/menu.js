// ═══════════════════════════════════════════════════════
//  SHOP DATA
// ═══════════════════════════════════════════════════════
const WEAPONS_SHOP = [
  { id:'pistol',  name:'Pistole',     icon:'🔫', price:0,   desc:'Startwaffe. 15 Schuss.' },
  { id:'rifle',   name:'Sturmgewehr', icon:'🪖', price:30,  desc:'Feuerrate +, 30 Schuss.' },
  { id:'shotgun', name:'Schrotflinte',icon:'💥', price:50,  desc:'5 Zombies, kurze Reichweite.' },
  { id:'kunai',   name:'Kunai',       icon:'🗡️', price:75,  desc:'Auto-Ziel. Wirft Kunais.' },
  { id:'sniper',  name:'Sniper',      icon:'🎯', price:100, desc:'Große Reichweite, hoher Schaden.' },
  { id:'rpg',     name:'RPG',         icon:'🚀', price:150, desc:'Explosionsrakete, AOE.' },
  { id:'molotov', name:'Molotov',     icon:'🍾', price:120, desc:'Feuerzone, Schaden über Zeit.' },
  { id:'minigun', name:'Minigun',     icon:'⚙️', price:350, desc:'Dauerfeuer, 4 Sek Cooldown.' },
];
const PERMA_SHOP = [
  { id:'hp',    name:'+HP',     icon:'❤️', price:20, max:5, desc:'+25 HP/Stufe.' },
  { id:'speed', name:'Speed',   icon:'👟', price:20, max:5, desc:'+10% Speed/Stufe.' },
  { id:'dmg',   name:'Schaden', icon:'💥', price:25, max:5, desc:'+15% Dmg/Stufe.' },
  { id:'reload',name:'Reload',  icon:'🔄', price:20, max:5, desc:'-10% Reload/Stufe.' },
  { id:'mag',   name:'Magazin', icon:'📦', price:20, max:5, desc:'+10 Schuss/Stufe.' },
];
const KUNAI_SHOP = [
  { id:'kunai_count', name:'Kunai-Anzahl', icon:'🗡️', price:40, max:4, desc:'+1 Kunai gleichzeitig (bis 5).' },
  { id:'kunai_speed', name:'Kunai-Tempo',  icon:'⚡', price:40, max:4, desc:'-0.1 Sek Wurfzeit (bis 0.1s).' },
];

let selectedDiff = 'easy';
function selDiff(d, el) {
  selectedDiff = d;
  document.querySelectorAll('#tab-play .diff-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}
// ═══════════════════════════════════════════════════════
//  MENU
// ═══════════════════════════════════════════════════════
function openMenu() {
  hideAll(); show('ov-menu');
  if (currentUser) {
    document.getElementById('menu-welcome').textContent =
      t('welcome_back') + ' ' + currentUser.username + '!  🪙 ' + (currentUser.coins||0) + ' ' + t('coins_total');
  }
  const isAdmin = currentUser?.username?.toLowerCase() === 'mrmaik';
  document.getElementById('admin-btn').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('admin-panel').style.display = 'none';
  // set lang btn state
  document.getElementById('lang-de').classList.toggle('on', currentLang === 'de');
  document.getElementById('lang-en').classList.toggle('on', currentLang === 'en');
  menuTab('play');
  renderShop();
  renderLevelGrid('level-grid', false);
  // Show admin button in menu too
  const isAdminMenu = ['mrmaik','mrmaik'].includes((currentUser?.username||'').toLowerCase());
  const abtn = document.getElementById('admin-btn');
  if(abtn) abtn.style.display = isAdminMenu ? 'block' : 'none';
}

function menuTab(tab) {
  ['play','mp','shop','upgrades','hs','friends','settings','admin-view'].forEach(id => {
    const el = document.getElementById('tab-' + id);
    if (el) el.style.display = id === tab ? 'block' : 'none';
    const btn = document.getElementById('mt-' + id);
    if (btn) btn.classList.toggle('on', id === tab);
  });
  if (tab === 'shop') renderShop();
  if (tab === 'upgrades') renderPermaUpg();
  if (tab === 'hs') { hsCurrentFilter = 'all'; renderHS(); }
  if (tab === 'friends') refreshFriends();
  if (tab === 'mp') renderLevelGrid('mp-level-grid', true);
}

function renderShop() {
  if (!currentUser) return;
  document.getElementById('shop-coins').textContent = currentUser.coins || 0;
  const wc = document.getElementById('shop-weapons'); wc.innerHTML = '';
  WEAPONS_SHOP.forEach(w => {
    const owned = (currentUser.weapons || []).includes(w.id);
    const c = document.createElement('div');
    c.className = 'shop-card' + (owned ? ' owned' : '') + (!owned && (currentUser.coins||0) < w.price ? ' locked' : '');
    c.innerHTML = `<div class="shop-icon">${w.icon}</div><div class="shop-name">${w.name}</div>
      <div class="shop-price">${owned ? '✓' : w.price===0 ? 'Free' : '🪙'+w.price}</div>
      <div class="shop-desc">${w.desc}</div>`;
    if (!owned && (currentUser.coins||0) >= w.price) c.onclick = () => buyWeapon(w);
    wc.appendChild(c);
  });
  const pc = document.getElementById('shop-perma'); pc.innerHTML = '';
  if ((currentUser.weapons||[]).includes('kunai')) {
    KUNAI_SHOP.forEach(k => {
      const lvl = k.id==='kunai_count' ? (currentUser.kunaiCountLvl||0) : (currentUser.kunaiSpeedLvl||0);
      const maxed = lvl >= k.max;
      const c = document.createElement('div');
      c.className = 'shop-card' + (maxed ? ' owned maxlvl' : '') + (!maxed&&(currentUser.coins||0)<k.price ? ' locked' : '');
      c.innerHTML = `<div class="shop-icon">${k.icon}</div><div class="shop-name">${k.name} Lv${lvl}${maxed?' ★':''}</div>
        <div class="shop-price">${maxed ? 'MAX ★' : '🪙'+k.price}</div><div class="shop-desc">${k.desc}</div>`;
      if (!maxed && (currentUser.coins||0) >= k.price) c.onclick = () => buyKunai(k);
      pc.appendChild(c);
    });
  }
  // Guardian
  const gLvl = currentUser.guardianShopLvl || 0;
  const gMaxed = gLvl >= 6;
  const gCost = 60 * (gLvl + 1);
  const gc = document.createElement('div');
  gc.className = 'shop-card' + (gMaxed?' owned maxlvl':'') + (!gMaxed&&(currentUser.coins||0)<gCost?' locked':'');
  gc.innerHTML = `<div class="shop-icon">⚔️</div><div class="shop-name">Guardian Lv${gLvl}${gMaxed?' ★':''}</div>
    <div class="shop-price">${gMaxed?'MAX ★':'🪙'+gCost}</div>
    <div class="shop-desc">Lv1-5: Klingen 30s an/15s aus. Lv6: 6 Klingen permanent!</div>`;
  if (!gMaxed && (currentUser.coins||0) >= gCost) gc.onclick = () => buyGuardian();
  pc.appendChild(gc);
}

function renderPermaUpg() {
  if (!currentUser) return;
  document.getElementById('upg-coins').textContent = currentUser.coins || 0;
  const el = document.getElementById('perma-upg-list'); el.innerHTML = '';
  PERMA_SHOP.forEach(u => {
    const lvl = (currentUser.perma||{})[u.id] || 0;
    const maxed = lvl >= u.max;
    const cost = u.price * (lvl + 1);
    const c = document.createElement('div');
    c.className = 'shop-card' + (maxed?' owned maxlvl':'') + (!maxed&&(currentUser.coins||0)<cost?' locked':'');
    c.innerHTML = `<div class="shop-icon">${u.icon}</div><div class="shop-name">${u.name} Lv${lvl}${maxed?' ★':''}</div>
      <div class="shop-price">${maxed?'MAX ★':'🪙'+cost}</div><div class="shop-desc">${u.desc}</div>`;
    if (!maxed && (currentUser.coins||0) >= cost) c.onclick = () => buyPerma(u);
    el.appendChild(c);
  });
}

async function buyWeapon(w) {
  if (!currentUser || (currentUser.coins||0) < w.price) return;
  currentUser.coins -= w.price;
  currentUser.weapons = [...(currentUser.weapons||[]), w.id];
  await saveUserServer({ coins: currentUser.coins, weapons: currentUser.weapons });
  renderShop();
}
async function buyKunai(k) {
  if (!currentUser || (currentUser.coins||0) < k.price) return;
  currentUser.coins -= k.price;
  if (k.id==='kunai_count') currentUser.kunaiCountLvl = (currentUser.kunaiCountLvl||0)+1;
  else currentUser.kunaiSpeedLvl = (currentUser.kunaiSpeedLvl||0)+1;
  await saveUserServer({ coins: currentUser.coins, kunaiCountLvl: currentUser.kunaiCountLvl, kunaiSpeedLvl: currentUser.kunaiSpeedLvl });
  renderShop();
}
async function buyGuardian() {
  const gLvl = currentUser.guardianShopLvl || 0;
  const cost = 60 * (gLvl + 1);
  if (!currentUser || (currentUser.coins||0) < cost || gLvl >= 6) return;
  currentUser.coins -= cost;
  currentUser.guardianShopLvl = gLvl + 1;
  await saveUserServer({ coins: currentUser.coins, guardianShopLvl: currentUser.guardianShopLvl });
  renderShop();
}
async function buyPerma(u) {
  const lvl = (currentUser.perma||{})[u.id] || 0;
  const cost = u.price * (lvl + 1);
  if (!currentUser || (currentUser.coins||0) < cost || lvl >= u.max) return;
  currentUser.coins -= cost;
  if (!currentUser.perma) currentUser.perma = {};
  currentUser.perma[u.id] = lvl + 1;
  await saveUserServer({ coins: currentUser.coins, perma: currentUser.perma });
  renderPermaUpg();
  document.getElementById('upg-coins').textContent = currentUser.coins;
}


// ═══════════════════════════════════════════════════════
//  PASSWORD CHANGE
// ═══════════════════════════════════════════════════════
async function changePassword() {
  const old = document.getElementById('pw-old').value;
  const nw  = document.getElementById('pw-new').value;
  const nw2 = document.getElementById('pw-new2').value;
  const msg = document.getElementById('pw-msg');
  msg.style.color = '#e74c3c';
  if (!old)  { msg.textContent = 'Altes Passwort eingeben.'; return; }
  if (nw.length < 4) { msg.textContent = 'Neues Passwort: mind. 4 Zeichen.'; return; }
  if (nw !== nw2)    { msg.textContent = 'Passwörter stimmen nicht überein.'; return; }
  try {
    await api('POST', '/api/me/password', { oldPassword: old, newPassword: nw });
    msg.style.color = '#27ae60';
    msg.textContent = '✓ Passwort erfolgreich geändert!';
    document.getElementById('pw-old').value = '';
    document.getElementById('pw-new').value = '';
    document.getElementById('pw-new2').value = '';
    setTimeout(() => { msg.textContent = ''; }, 4000);
  } catch(e) {
    msg.style.color = '#e74c3c';
    msg.textContent = '❌ ' + e.message;
  }
}
// ═══════════════════════════════════════════════════════
//  LEADERBOARD EDIT (owner only)
// ═══════════════════════════════════════════════════════
let hsEditMode = false;
let hsCurrentEntries = []; // cache last loaded entries with their _id

function toggleHsEdit() {
  hsEditMode = !hsEditMode;
  const btn = document.getElementById('hs-edit-btn');
  if(btn) {
    btn.textContent = hsEditMode ? '✓ Fertig' : '✏ Bearbeiten';
    btn.style.background = hsEditMode ? '#27ae60' : 'transparent';
    btn.style.color = hsEditMode ? '#fff' : '#e74c3c';
  }
  renderHS(); // re-render with/without delete buttons
}

async function deleteScore(id, playerName) {
  if (!confirm('Eintrag von ' + playerName + ' löschen?')) return;
  try {
    await api('DELETE', '/api/admin/score/' + id);
    renderHS();
  } catch(e) { alert('Fehler: ' + e.message); }
}

async function deleteAllScores(playerName) {
  if (!confirm('ALLE Einträge von ' + playerName + ' löschen?')) return;
  try {
    await api('DELETE', '/api/admin/scores/' + playerName);
    renderHS();
  } catch(e) { alert('Fehler: ' + e.message); }
}
// ═══════════════════════════════════════════════════════
//  LEADERBOARD
// ═══════════════════════════════════════════════════════
let hsCurrentView = 'global', hsCurrentFilter = 'all', hsCurrentSort = 'secs';
const DIFF_LABELS = { easy:'Einfach',normal:'Normal',hard:'Schwer',nightmare:'Albtraum' };
const DIFF_BADGE_CLASS = { easy:'diff-easy',normal:'diff-normal',hard:'diff-hard',nightmare:'diff-nightmare' };
const RANK_MEDALS = ['🥇','🥈','🥉'];

function hsFilter(f, btn) {
  hsCurrentFilter = f;
  document.querySelectorAll('.hs-filter-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderHS();
}
function hsSetView(v, btn) {
  hsCurrentView = v;
  document.querySelectorAll('.hs-view-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('hs-sort-row').style.display = v==='global' ? 'flex' : 'none';
  renderHS();
}
function hsSetSort(s, btn) {
  hsCurrentSort = s;
  document.querySelectorAll('.hs-sort-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderHS();
}

async function renderHS() {
  const tbody  = document.getElementById('hs-tbody');
  const empty  = document.getElementById('hs-empty');
  const summary= document.getElementById('hs-summary');
  const myRank = document.getElementById('hs-my-rank');
  const thead  = document.getElementById('hs-thead-row');

  // Detach any old click handler before clearing tbody
  if (tbody._hsDelHandler) {
    tbody.removeEventListener('click', tbody._hsDelHandler);
    tbody._hsDelHandler = null;
  }
  tbody.innerHTML = '';

  let entries;
  try {
    if (hsCurrentView === 'global') {
      entries = await api('GET',
        `/api/scores?diff=${hsCurrentFilter}&sort=${hsCurrentSort}&limit=50`);
    } else {
      entries = await api('GET', `/api/scores/me?diff=${hsCurrentFilter}`);
    }
  } catch (e) {
    empty.style.display = 'block';
    empty.textContent = 'Fehler: ' + e.message;
    return;
  }

  const isGlobal = hsCurrentView === 'global';
  const showEdit = isGlobal && hsEditMode;

  // Build thead
  const editTh = showEdit ? '<th style="width:54px;min-width:54px;"></th>' : '';
  thead.innerHTML = isGlobal
    ? editTh + '<th class="c">#</th><th>Spieler</th><th>Zeit</th><th class="r">☠ Kills</th><th class="c">Diff</th><th class="r">Welle</th><th class="r">Modus</th><th class="r" style="font-size:.65rem;">Datum</th>'
    : '<th class="c">#</th><th>Zeit</th><th class="r">☠ Kills</th><th class="c">Diff</th><th class="r">Welle</th><th class="r">Modus</th><th class="r" style="font-size:.65rem;">Datum</th>';

  if (!entries.length) {
    empty.style.display = 'block';
    empty.textContent = t('no_entries');
    summary.textContent = ''; myRank.textContent = '';
    return;
  }
  empty.style.display = 'none';

  const diffL = DIFF_LABELS;
  let myBestRank = -1;

  entries.forEach((entry, i) => {
    const player  = String(entry.player || '?');
    const entryId = String(entry._id   || '');
    const isMe    = isGlobal && player.toLowerCase() === (currentUser?.username||'').toLowerCase();
    if (isMe && myBestRank === -1) myBestRank = i + 1;

    const medal     = i < 3 ? RANK_MEDALS[i] : String(i + 1);
    const dc        = DIFF_BADGE_CLASS[entry.diff] || 'diff-normal';
    const dl        = diffL[entry.diff] || entry.diff || '?';
    const modeLabel = entry.mode === 'coop' ? '🤝' : entry.mode === 'versus' ? '⚔️' : '👤';

    const tr = document.createElement('tr');
    if (isMe) tr.className = 'my-row';

    if (showEdit) {
      // Build delete cell with DOM (no innerHTML quoting issues)
      const td = document.createElement('td');
      td.className = 'c';
      td.style.whiteSpace = 'nowrap';

      const btnOne = document.createElement('button');
      btnOne.textContent = '✕';
      btnOne.title = 'Eintrag löschen';
      btnOne.className = 'hs-del-one';
      btnOne.dataset.id = entryId;
      btnOne.dataset.player = player;
      btnOne.style.cssText = 'background:#3a0808;border:none;border-radius:3px;color:#ff6666;font-size:.6rem;padding:2px 6px;cursor:pointer;margin:1px;';

      const btnAll = document.createElement('button');
      btnAll.textContent = '✕✕';
      btnAll.title = 'Alle Einträge dieses Spielers löschen';
      btnAll.className = 'hs-del-all';
      btnAll.dataset.player = player;
      btnAll.style.cssText = 'background:#5a0000;border:none;border-radius:3px;color:#ff4444;font-size:.6rem;padding:2px 6px;cursor:pointer;margin:1px;';

      td.appendChild(btnOne);
      td.appendChild(btnAll);
      tr.appendChild(td);
    }

    // Build data cells with DOM too (safest approach)
    function addTd(html, cls, extraStyle) {
      const td = document.createElement('td');
      if (cls) td.className = cls;
      if (extraStyle) td.style.cssText = extraStyle;
      td.innerHTML = html;
      tr.appendChild(td);
    }

    if (isGlobal) {
      addTd(medal, 'c');
      const nameStyle = isMe ? 'font-weight:700;color:#f7c948;' : '';
      addTd((isMe ? '★ ' : '') + player, '', nameStyle);
    }
    addTd('<b>' + (entry.time||'?') + '</b>');
    addTd(String(entry.kills||0), 'r');
    addTd('<span class="diff-badge ' + dc + '">' + dl + '</span>', 'c');
    addTd(String(entry.wave||'?'), 'r');
    addTd(modeLabel, 'r');
    addTd(entry.date||'', 'r', 'color:#4a6a80;font-size:.68rem;');

    tbody.appendChild(tr);
  });

  // Attach ONE persistent delegated click handler
  if (showEdit) {
    tbody._hsDelHandler = async function hsClickHandler(ev) {
      const btnOne = ev.target.closest('.hs-del-one');
      const btnAll = ev.target.closest('.hs-del-all');
      if (!btnOne && !btnAll) return;
      ev.stopPropagation();

      if (btnOne) {
        const id     = btnOne.dataset.id;
        const player = btnOne.dataset.player;
        if (!id || id === 'undefined') {
          alert('Fehler: Kein Eintrag-ID gefunden. Seite neu laden und nochmal versuchen.');
          return;
        }
        if (!confirm('Eintrag von "' + player + '" löschen?')) return;
        btnOne.disabled = true;
        btnOne.textContent = '⏳';
        try {
          await api('DELETE', '/api/admin/score/' + id);
          await renderHS();
        } catch(e) {
          alert('Fehler beim Löschen: ' + e.message);
          await renderHS();
        }
      } else if (btnAll) {
        const player = btnAll.dataset.player;
        if (!confirm('ALLE Einträge von "' + player + '" löschen?')) return;
        btnAll.disabled = true;
        btnAll.textContent = '⏳';
        try {
          await api('DELETE', '/api/admin/scores/' + encodeURIComponent(player));
          await renderHS();
        } catch(e) {
          alert('Fehler: ' + e.message);
          await renderHS();
        }
      }
    };
    tbody.addEventListener('click', tbody._hsDelHandler);
  }

  // Footer summary
  if (isGlobal) {
    const playerCount  = new Set(entries.map(e=>(e.player||'').toLowerCase())).size;
    const totalKills   = entries.reduce((s,e)=>s+(e.kills||0),0);
    summary.innerHTML  = '<b style="color:#f7c948;">' + entries.length + '</b> Einträge von ' +
      '<b style="color:#7ecff7;">' + playerCount + '</b> Spielern · ' +
      'Kills: <b style="color:#27ae60;">' + totalKills.toLocaleString() + '</b>';
    myRank.innerHTML = myBestRank > 0
      ? 'Deine beste Platzierung: <b style="color:#f7c948;">#' + myBestRank + '</b>'
      : 'Du hast noch keinen Eintrag.';
  } else {
    summary.innerHTML = '<b style="color:#f7c948;">' + entries.length + '</b> Runden · ' +
      'Beste Zeit: <b style="color:#f7c948;">' + entries[0].time + '</b>';
    myRank.textContent = '';
  }
}

// ═══════════════════════════════════════════════════════
//  FRIENDS SYSTEM
// ═══════════════════════════════════════════════════════
async function sendFriendRequest() {
  const input = document.getElementById('friend-search-input');
  const target = input.value.trim();
  const err = document.getElementById('friend-err');
  if (!target) { err.textContent = 'Benutzername eingeben.'; return; }
  if (target.toLowerCase() === (currentUser?.username||'').toLowerCase()) { err.textContent = 'Du kannst dir nicht selbst eine Anfrage senden.'; return; }
  try {
    await api('POST', '/api/friends/request', { to: target });
    err.style.color = '#27ae60';
    err.textContent = 'Anfrage an ' + target + ' gesendet!';
    input.value = '';
    setTimeout(() => { err.textContent = ''; err.style.color = ''; }, 3000);
  } catch(e) { err.style.color = '#e74c3c'; err.textContent = e.message; }
}

async function refreshFriends() {
  const err = document.getElementById('friend-err');
  if(err) err.textContent = '';
  try {
    const data = await api('GET', '/api/friends');
    renderFriendsList(data.friends || [], data.incoming || []);
  } catch(e) { if(err) err.textContent = 'Fehler: ' + e.message; }
}

function renderFriendsList(friends, incoming) {
  const reqSection = document.getElementById('friend-requests-section');
  const reqList = document.getElementById('friend-requests-list');
  if (incoming.length > 0) {
    reqSection.style.display = 'block';
    reqList.innerHTML = '';
    incoming.forEach(req => {
      const row = document.createElement('div');
      row.className = 'friend-req-row';
      row.innerHTML = `<div class="friend-avatar">${req.from[0].toUpperCase()}</div>
        <span style="flex:1;"><b>${req.from}</b> möchte befreundet sein</span>
        <button class="btn green sm" style="font-size:.7rem;padding:3px 8px;" onclick="respondFriendRequest('${req.from}',true)">✓</button>
        <button class="btn red sm" style="font-size:.7rem;padding:3px 8px;" onclick="respondFriendRequest('${req.from}',false)">✕</button>`;
      reqList.appendChild(row);
    });
    document.getElementById('friend-notif').style.display = 'inline-block';
  } else {
    reqSection.style.display = 'none';
    document.getElementById('friend-notif').style.display = 'none';
  }
  const list = document.getElementById('friends-list');
  const empty = document.getElementById('friends-empty');
  list.innerHTML = '';
  if (!friends.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  friends.forEach(f => {
    const row = document.createElement('div');
    row.className = 'friend-row';
    const sc = f.status==='online'?'online':f.status==='ingame'?'ingame':'offline';
    const st = f.status==='online'?'🟢 Online':f.status==='ingame'?'🎮 Im Spiel':'⚫ Offline';
    row.innerHTML = `<div class="friend-avatar">${f.username[0].toUpperCase()}</div>
      <div class="friend-name">${f.username}</div>
      <span class="friend-status ${sc}">${st}</span>
      <button class="btn blue sm" style="font-size:.7rem;padding:3px 8px;" onclick="inviteFriend('${f.username}')">Einladen</button>
      <button class="btn grey sm" style="font-size:.7rem;padding:3px 8px;" onclick="removeFriend('${f.username}')">✕</button>`;
    list.appendChild(row);
  });
}

async function respondFriendRequest(from, accept) {
  try { await api('POST', '/api/friends/respond', { from, accept }); refreshFriends(); }
  catch(e) { document.getElementById('friend-err').textContent = e.message; }
}

async function removeFriend(username) {
  try { await api('DELETE', '/api/friends/' + username); refreshFriends(); }
  catch(e) { document.getElementById('friend-err').textContent = e.message; }
}

function inviteFriend(username) {
  const err = document.getElementById('friend-err');
  if (!currentParty) { err.style.color='#e74c3c'; err.textContent = 'Erstelle zuerst eine Party!'; setTimeout(()=>{err.textContent='';err.style.color='';},3000); return; }
  if (socket) socket.emit('party:inviteFriend', { to: username, code: currentParty.code });
  err.style.color = '#27ae60';
  err.textContent = 'Einladung an ' + username + ' gesendet!';
  setTimeout(()=>{ err.textContent=''; err.style.color=''; }, 3000);
}

async function checkFriendNotifications() {
  try {
    const data = await api('GET', '/api/friends');
    if ((data.incoming || []).length > 0) document.getElementById('friend-notif').style.display = 'inline-block';
  } catch(e) {}
}

