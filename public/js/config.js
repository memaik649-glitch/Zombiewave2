// ═══════════════════════════════════════════════════════
//  i18n
// ═══════════════════════════════════════════════════════
const TRANSLATIONS = {
  de: {
    tagline:'Stadt der Verdammten', login:'Einloggen', register:'Registrieren',
    username_ph:'Benutzername', password_ph:'Passwort', password_repeat_ph:'Passwort wiederholen',
    play:'Spielen', multiplayer:'Multiplayer', shop:'Shop 🪙', upgrades:'Upgrades',
    leaderboard:'Bestenliste', settings:'Einstellungen',
    difficulty:'Schwierigkeit', easy:'Einfach', normal:'Normal', hard:'Schwer', nightmare:'Albtraum',
    easy_sub:'Weniger Zombies', normal_sub:'Standard', hard_sub:'Mehr Zombies', nightmare_sub:'Maximum',
    play_solo:'▶ Solo spielen', logout:'Abmelden',
    mp_choose_mode:'Modus wählen', coop:'Koop', coop_desc:'Zusammen gegen Zombies',
    versus:'Versus', versus_desc:'Wer hat mehr Kills?',
    party_code_ph:'CODE', party_code_label:'Party-Code:', create_party:'🎮 Party erstellen',
    join_party:'Beitreten', ready:'Bereit', start_game:'▶ Spiel starten', leave_party:'Verlassen',
    chat_ph:'Nachricht...', send:'Senden',
    weapons:'Waffen', shop_extras:'Kunai-Upgrades & Guardian',
    perma_desc:'Permanente Verbesserungen:', upgrades_tab:'Upgrades',
    global_lb:'🌍 Globale Bestenliste', my_scores:'👤 Meine Scores',
    all:'Alle', sort_time:'⏱ Zeit', sort_kills:'☠ Kills', sort_wave:'🌊 Welle',
    no_entries:'Noch keine Einträge.',
    language:'Sprache', music_vol:'Musik-Lautstärke', account:'Account', music:'🎵 Musik',
    level_up:'⬆ Level Up!', kills_label:'Kills:', loot_pick:'Wähle eine Belohnung:',
    boss_defeated:'💀 Boss besiegt!', pause:'Pause', active_upgrades:'Aktive Upgrades dieser Runde:',
    resume:'▶ Weiter', give_up:'✕ Aufgeben', to_menu:'Zum Menü', play_again:'Nochmal',
    boss_bar:'☠ BOSS ☠', boss_warn:'⚠ BOSS NAHT! ⚠',
    admin_inf_hp:'∞ Leben', admin_inf_coins:'∞ Münzen', admin_minigun:'Minigun kein CD',
    admin_boss:'Boss spawnen', admin_wave:'Extra Welle', admin_god:'God Mode',
    game_over:'Game Over', round_ended:'Runde beendet', gave_up:'Aufgegeben',
    time_label:'Zeit', kills_stat:'Kills', wave_stat:'Welle', coins_earned:'Münzen verdient',
    welcome_back:'Willkommen zurück,', coins_total:'Münzen',
    mp_waiting:'Warte auf Mitspieler...', mp_you_died:'Du bist gestorben!',
    mp_game_over:'Spiel vorbei!', mp_coop_result:'Koop-Ergebnis', mp_versus_winner:'Sieger',
    mode_coop:'Koop', mode_versus:'Versus', mode_solo:'Solo',
  },
  en: {
    tagline:'City of the Damned', login:'Log in', register:'Register',
    username_ph:'Username', password_ph:'Password', password_repeat_ph:'Repeat password',
    play:'Play', multiplayer:'Multiplayer', shop:'Shop 🪙', upgrades:'Upgrades',
    leaderboard:'Leaderboard', settings:'Settings',
    difficulty:'Difficulty', easy:'Easy', normal:'Normal', hard:'Hard', nightmare:'Nightmare',
    easy_sub:'Fewer zombies', normal_sub:'Standard', hard_sub:'More zombies', nightmare_sub:'Maximum',
    play_solo:'▶ Play Solo', logout:'Log out',
    mp_choose_mode:'Choose mode', coop:'Coop', coop_desc:'Together vs zombies',
    versus:'Versus', versus_desc:'Who gets more kills?',
    party_code_ph:'CODE', party_code_label:'Party Code:', create_party:'🎮 Create Party',
    join_party:'Join', ready:'Ready', start_game:'▶ Start Game', leave_party:'Leave',
    chat_ph:'Message...', send:'Send',
    weapons:'Weapons', shop_extras:'Kunai Upgrades & Guardian',
    perma_desc:'Permanent improvements:', upgrades_tab:'Upgrades',
    global_lb:'🌍 Global Leaderboard', my_scores:'👤 My Scores',
    all:'All', sort_time:'⏱ Time', sort_kills:'☠ Kills', sort_wave:'🌊 Wave',
    no_entries:'No entries yet.',
    language:'Language', music_vol:'Music Volume', account:'Account', music:'🎵 Music',
    level_up:'⬆ Level Up!', kills_label:'Kills:', loot_pick:'Choose a reward:',
    boss_defeated:'💀 Boss defeated!', pause:'Pause', active_upgrades:'Active upgrades this round:',
    resume:'▶ Resume', give_up:'✕ Give Up', to_menu:'Menu', play_again:'Play Again',
    boss_bar:'☠ BOSS ☠', boss_warn:'⚠ BOSS INCOMING! ⚠',
    admin_inf_hp:'∞ HP', admin_inf_coins:'∞ Coins', admin_minigun:'Minigun no CD',
    admin_boss:'Spawn Boss', admin_wave:'Extra Wave', admin_god:'God Mode',
    game_over:'Game Over', round_ended:'Round Ended', gave_up:'Gave Up',
    time_label:'Time', kills_stat:'Kills', wave_stat:'Wave', coins_earned:'Coins earned',
    welcome_back:'Welcome back,', coins_total:'Coins',
    mp_waiting:'Waiting for players...', mp_you_died:'You died!',
    mp_game_over:'Game Over!', mp_coop_result:'Coop Result', mp_versus_winner:'Winner',
    mode_coop:'Coop', mode_versus:'Versus', mode_solo:'Solo',
  }
};

let currentLang = localStorage.getItem('zw_lang') || 'de';

function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = t(key);
    if (txt) el.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    const txt = t(key);
    if (txt) el.placeholder = txt;
  });
  document.getElementById('html-root').lang = currentLang;
}

function setLang(lang, btn) {
  currentLang = lang;
  localStorage.setItem('zw_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  applyTranslations();
  // Update dynamic text
  if (currentUser) {
    document.getElementById('menu-welcome').textContent =
      t('welcome_back') + ' ' + currentUser.username + '!  🪙 ' + currentUser.coins + ' ' + t('coins_total');
  }
}
// ═══════════════════════════════════════════════════════
//  CANVAS
// ═══════════════════════════════════════════════════════
const CV = document.getElementById('c'), ctx = CV.getContext('2d');
const W = 820, H = 580;
CV.width = W; CV.height = H;
// ═══════════════════════════════════════════════════════
//  API helpers
// ═══════════════════════════════════════════════════════
let authToken = localStorage.getItem('zw_token') || '';

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fehler');
  return data;
}
