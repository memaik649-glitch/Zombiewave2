// ═══════════════════════════════════════════════════════
//  LEVEL SYSTEM
// ═══════════════════════════════════════════════════════

function getUnlockedLevels() {
  if (!currentUser) return [1];
  return currentUser.unlockedLevels || [1];
}

function isLevelUnlocked(levelId) {
  if (levelId === 1) return true;
  if ((currentUser?.username||'').toLowerCase() === 'mrmaik') return true;
  return getUnlockedLevels().includes(levelId);
}

async function unlockNewLevel(levelId) {
  if (!currentUser) return;
  const current = getUnlockedLevels();
  if (!current.includes(levelId)) {
    current.push(levelId);
    currentUser.unlockedLevels = current;
    try { await saveUserServer({ unlockedLevels: current }); } catch(e) {}
  }
}

function renderLevelGrid(gridId = 'level-grid', mpMode = false) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  LEVELS.forEach(lvl => {
    const unlocked   = isLevelUnlocked(lvl.id);
    const isSelected = mpMode ? (selectedMpLevel === lvl.id) : (selectedLevel === lvl.id);
    const card = document.createElement('div');
    card.className = 'level-card' + (unlocked ? '' : ' locked') + (isSelected ? ' sel' : '');
    card.title = lvl.desc;
    const reqTxt = unlocked
      ? (isSelected ? '✓ Ausgewählt' : '🔓 Freigeschaltet')
      : ('🔒 Level ' + (lvl.id-1) + ' abschließen');
    card.innerHTML =
      '<div class="level-icon">' + lvl.icon + '</div>' +
      '<div class="level-name">' + lvl.name + '</div>' +
      '<div class="level-req">'  + reqTxt  + '</div>';
    if (unlocked) {
      card.onclick = () => {
        if (mpMode) { selectedMpLevel = lvl.id; renderLevelGrid(gridId, true); }
        else        { selectedLevel   = lvl.id; renderLevelGrid(gridId, false); }
      };
    }
    grid.appendChild(card);
  });
}

function updateLevelTimer(dt) {
  if (!gameRunning || paused || levelGoalReached) return;
  levelTimer += dt / 60;
  const lvl = LEVELS.find(l => l.id === selectedLevel) || LEVELS[0];
  if (levelTimer >= lvl.survivalGoal) {
    levelGoalReached = true;
    showLevelComplete();
  }
}

async function showLevelComplete() {
  paused = true; mouse.down = false;
  if (typeof sfxLevelUp   === 'function') sfxLevelUp();
  if (typeof triggerFlash === 'function') triggerFlash('#27ae60', 0.25, 15);

  const lvl     = LEVELS.find(l => l.id === selectedLevel) || LEVELS[0];
  const nextLvl = LEVELS.find(l => l.id === selectedLevel + 1);
  const mins    = Math.floor(levelTimer / 60);
  const secs    = Math.floor(levelTimer % 60);

  const mul     = (DIFF[G.diff] || DIFF.normal).coinMul;
  const earned  = Math.round((G.earnedCoins || 0) * mul);
  const mulLbl  = {easy:'×0.5',normal:'×1',hard:'×1.5',nightmare:'×2'}[G.diff] || '';

  if (currentUser) {
    currentUser.coins = (currentUser.coins || 0) + earned;
    await saveUserServer({ coins: currentUser.coins });
  }
  try { await saveScore(Math.floor(G.gameTime / 60), 'solo'); } catch(e) {}

  const el = id => document.getElementById(id);
  if (el('lc-stats'))
    el('lc-stats').innerHTML =
      'Level: <b style="color:#f7c948;">' + lvl.name + '</b> · Zeit: <b>' +
      mins + 'm ' + secs + 's</b> · Kills: <b>' + G.kills + '</b>';
  if (el('lc-coins'))
    el('lc-coins').innerHTML =
      '+' + earned + ' 🪙 <span style="font-size:.85rem;color:#9db4c8;">' + mulLbl + '</span>';

  let unlockMsg = '';
  if (selectedDiff === 'easy') {
    unlockMsg = '⚠ Auf Einfach wird kein Level freigeschaltet – mind. Normal spielen!';
  } else if (nextLvl && !isLevelUnlocked(nextLvl.id)) {
    await unlockNewLevel(nextLvl.id);
    unlockMsg = '🔓 ' + nextLvl.name + ' freigeschaltet!';
  } else if (nextLvl) {
    unlockMsg = '✓ ' + nextLvl.name + ' bereits freigeschaltet.';
  } else {
    unlockMsg = '🏆 Alle Level abgeschlossen!';
  }
  if (el('lc-unlock')) el('lc-unlock').textContent = unlockMsg;
  if (el('lc-next-btn'))
    el('lc-next-btn').style.display = (nextLvl && isLevelUnlocked(nextLvl.id)) ? 'inline-block' : 'none';

  const ov = el('ov-level-complete');
  if (ov) ov.classList.remove('h');
}

function continueLevel() {
  const ov = document.getElementById('ov-level-complete');
  if (ov) ov.classList.add('h');
  G.earnedCoins    = 0;
  levelGoalReached = false;
  mouse.down       = false;
  paused           = false;
}

async function goNextLevel() {
  const nextId  = selectedLevel + 1;
  const nextLvl = LEVELS.find(l => l.id === nextId);
  if (!nextLvl || !isLevelUnlocked(nextId)) {
    alert('Nächstes Level noch nicht freigeschaltet!'); return;
  }
  gameRunning = false;
  if (typeof stopMusic === 'function') stopMusic();
  if (animId) cancelAnimationFrame(animId);
  hideAll();
  selectedLevel    = nextId;
  levelTimer       = 0;
  levelGoalReached = false;
  startSoloGame();
}

// Patch startSoloGame after all scripts load to reset level vars per run
window.addEventListener('load', () => {
  const _orig = startSoloGame;
  window.startSoloGame = function() {
    levelTimer       = 0;
    levelGoalReached = false;
    _orig();
  };
}, { once: true });
