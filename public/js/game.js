// ═══════════════════════════════════════════════════════
//  WEAPON DEFS + UPGRADE POOLS
// ═══════════════════════════════════════════════════════
const WPN={
  pistol: {name:'Pistole', icon:'🔫',dmgMul:1,  mag:15,reload:90, fireRate:18,multiShot:1,pierce:1,range:320,spread:.04,bSize:5,type:'gun'},
  rifle:  {name:'Gewehr',  icon:'🪖',dmgMul:1.1,mag:30,reload:120,fireRate:8, multiShot:1,pierce:1,range:400,spread:.02,bSize:5,type:'gun'},
  shotgun:{name:'Schrot',  icon:'💥',dmgMul:2.2,mag:8, reload:150,fireRate:35,multiShot:5,pierce:3,range:180,spread:.3, bSize:7,type:'gun'},
  sniper: {name:'Sniper',  icon:'🎯',dmgMul:3.5,mag:6, reload:180,fireRate:60,multiShot:1,pierce:5,range:700,spread:.005,bSize:4,type:'gun'},
  rpg:    {name:'RPG',     icon:'🚀',dmgMul:4,  mag:4, reload:200,fireRate:80,multiShot:1,pierce:10,range:500,spread:.01,bSize:7,type:'rpg'},
  molotov:{name:'Molotov', icon:'🍾',dmgMul:1,  mag:3, reload:180,fireRate:90,multiShot:1,pierce:0,range:350,spread:.05,bSize:6,type:'molotov'},
  kunai:  {name:'Kunai',   icon:'🗡️',dmgMul:1.4,mag:999,reload:0, fireRate:30,multiShot:1,pierce:2,range:350,spread:.02,bSize:8,type:'kunai'},
  minigun:{name:'Minigun', icon:'⚙️',dmgMul:.8, mag:999,reload:0,fireRate:3,multiShot:1,pierce:1,range:350,spread:.12,bSize:4,type:'gun',cooldownMax:2700,cooling:false,coolLen:240},
};
const ALL_UPGRADES=[
  {id:'dmg',   name:'+ Schaden',  icon:'💥',desc:'+30% Schaden.',     apply:g=>{g.ownedWpns.forEach(w=>w.dmg=Math.round(w.dmg*1.3));}},
  {id:'speed', name:'+ Speed',    icon:'👟',desc:'+15% Speed.',        apply:g=>{g.playerSpeed*=1.15;}},
  {id:'fire',  name:'Feuerrate',  icon:'🔥',desc:'+35% Feuerrate.',    apply:g=>{g.ownedWpns.forEach(w=>{if(w.type==='gun')w.fireRate=Math.max(3,Math.round(w.fireRate*.65));});}},
  {id:'mag',   name:'Magazin',    icon:'📦',desc:'+20 Schuss.',        apply:g=>{g.ownedWpns.forEach(w=>{w.maxAmmo+=20;w.ammo=w.maxAmmo;});}},
  {id:'reload',name:'Nachladen',  icon:'🔄',desc:'-30% Reload.',       apply:g=>{g.ownedWpns.forEach(w=>w.reloadTime=Math.max(20,Math.round(w.reloadTime*.7)));}},
  {id:'multi', name:'Mehrfach',   icon:'🎯',desc:'+1 Kugel.',          apply:g=>{g.ownedWpns.forEach(w=>{if(w.type==='gun')w.multiShot=Math.min(w.multiShot+1,5);});}},
  {id:'pierce',name:'Piercing',   icon:'⚡',desc:'+2 Pierce.',         apply:g=>{g.ownedWpns.forEach(w=>w.pierce=Math.min(w.pierce+2,8));}},
  {id:'hp',    name:'+ Leben',    icon:'❤️',desc:'+40 HP.',            apply:g=>{g.playerMaxHp+=40;g.playerHp=Math.min(g.playerHp+40,g.playerMaxHp);}},
  {id:'bullet',name:'Große Kugeln',icon:'🔵',desc:'+50% Kugelgröße.', apply:g=>{g.ownedWpns.forEach(w=>w.bSize=Math.round(w.bSize*1.5));}},
  {id:'regen', name:'Heilung',    icon:'💚',desc:'+3 HP alle 5 Sek.', apply:g=>{g.regen+=3;}},
  {id:'dash',  name:'Dash',       icon:'💨',desc:'Shift = Dash.',      apply:g=>{g.hasDash=true;}},
  {id:'guardian',name:'Guardian', icon:'⚔️',desc:'Klingen kreisen um dich.',apply:g=>{g.guardianLvl=(g.guardianLvl||0)+1;},},
];
const LOOT_POOL=[
  {id:'heal',  name:'Heiltrank',icon:'💊',desc:'Heilt 70 HP.',    apply:g=>{g.playerHp=Math.min(g.playerHp+70,g.playerMaxHp);}},
  {id:'nuke',  name:'Granate',  icon:'💣',desc:'Tötet alle.',     apply:g=>{g.enemies=[];spawnFT(G.px,G.py-40,'KABOOM!','#f7c948');}},
  {id:'shield',name:'Schild',   icon:'🛡️',desc:'1 Treffer.',     apply:g=>{g.shield=true;}},
  {id:'ammo',  name:'Munition', icon:'🔫',desc:'Sofort nachladen.',apply:g=>{g.ownedWpns.forEach(w=>{w.ammo=w.maxAmmo;w.reloading=false;});}},
  ...ALL_UPGRADES.slice(0,5),
];
function pickRandom(arr,n){const c=[...arr],r=[];for(let i=0;i<n&&c.length;i++){const x=Math.floor(Math.random()*c.length);r.push(c.splice(x,1)[0]);}return r;}
// ═══════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════
let G={},keys={},mouse={x:W/2,y:H/2,down:false};
let screenFlash={alpha:0,color:'#fff',duration:0};
let paused=false,gameRunning=false,animId=null,lastTime=0,globalTick=0;
let selectedLevel=1;
let levelTimer=0; // counts seconds survived in current level
let levelGoalReached=false;
const DIFF={easy:{spawnBase:220,spawnMin:80,waveSize:[4,7],bossHpMul:1.0,speedMul:.7,coinMul:0.5},normal:{spawnBase:160,spawnMin:55,waveSize:[5,9],bossHpMul:1.5,speedMul:.85,coinMul:1.0},hard:{spawnBase:110,spawnMin:35,waveSize:[7,11],bossHpMul:2.0,speedMul:1,coinMul:1.5},nightmare:{spawnBase:70,spawnMin:20,waveSize:[9,14],bossHpMul:3.0,speedMul:1.2,coinMul:2.0}};

function initGame(isMP=false) {
  const u = currentUser || {}, perma = u.perma||{};
  const kunaiCount = 1+(u.kunaiCountLvl||0);
  const kunaiRate = Math.max(6,30-((u.kunaiSpeedLvl||0)*6));
  G={
    camX:0,camY:0,px:400,py:300,
    playerHp:100+perma.hp*25,playerMaxHp:100+perma.hp*25,
    playerSpeed:2.4*(1+perma.speed*.1),
    facing:0,dashActive:false,dashTimer:0,dashCd:0,hasDash:false,
    shield:false,regen:0,regenTick:0,invincible:0,godMode:false,adminMingunNoCool:false,
    ownedWpns:(u.weapons||['pistol']).filter(w=>WPN[w]).map(w=>({
      ...JSON.parse(JSON.stringify(WPN[w])),id:w,
      dmg:Math.round(20*(WPN[w].dmgMul||1)*(1+perma.dmg*.15)),
      ammo:WPN[w].mag+(perma.mag||0)*10,maxAmmo:WPN[w].mag+(perma.mag||0)*10,
      reloadTime:Math.round((WPN[w].reload||90)*(1-(perma.reload||0)*.1)),
      reloading:false,reloadTimer:0,fireCooldown:0,
      kunaiCount,kunaiRate,kunaiCd:0,cooldown:0,cooling:false,
    })),
    activeWpn:0,bullets:[],kunais:[],rockets:[],fireZones:[],
    enemies:[],particles:[],floatingTexts:[],lootDrops:[],aoeRings:[],
    wave:1,kills:0,killsForNext:10,waveTimer:0,spawnCd:0,
    spawnRate:(DIFF[selectedDiff]||DIFF.normal).spawnBase,
    bossTimer:0,bossActive:false,boss:null,bossWarn:0,
    gameTime:0,earnedCoins:0,activeUpgrades:[],diff:selectedDiff,
    surviveTimer:0,levelCompleted:false,levelGoal:(LEVELS.find(l=>l.id===selectedLevel)||LEVELS[0]).survivalGoal||300,
    guardianLvl:u.guardianShopLvl||0,guardians:[],guardianAngle:0,
    guardianVisible:true,guardianTimer:0,
    molotovDurMul:1,
    isMP,mpSnapshot:null,
  };
  buildWpnBar();
}

function buildWpnBar(){const bar=document.getElementById('wpn-bar');bar.innerHTML='';bar.style.display='flex';G.ownedWpns.forEach((w,i)=>{const s=document.createElement('div');s.className='wpn-slot'+(i===0?' active':'');s.id='ws'+i;s.textContent=w.icon;s.title=w.name;s.onclick=()=>switchWpn(i);bar.appendChild(s);});}
function switchWpn(i){G.activeWpn=i;document.querySelectorAll('.wpn-slot').forEach((s,j)=>s.classList.toggle('active',j===i));}
function curWpn(){return G.ownedWpns[G.activeWpn];}
// ═══════════════════════════════════════════════════════
//  GAME LOGIC (same as V4 – abbreviated for MP integration)
// ═══════════════════════════════════════════════════════
function dist2(ax,ay,bx,by){return(ax-bx)**2+(ay-by)**2;}
function distE(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);}
function moveTo(e,tx,ty){const d=distE(e,{x:tx,y:ty});if(d>2){e.x+=(tx-e.x)/d*e.speed;e.y+=(ty-e.y)/d*e.speed;}}
function nearestEnemy(fx,fy,range){let best=null,bd=Infinity;G.enemies.forEach(e=>{const d=dist2(fx,fy,e.x,e.y);if(d<bd&&d<range*range){bd=d;best=e;}});if(G.bossActive&&G.boss){const d=dist2(fx,fy,G.boss.x,G.boss.y);if(d<bd&&d<500*500){bd=d;best=G.boss;}}return best;}

function tryShoot(){
  if(paused)return;
  const w=curWpn();if(!w)return;
  if(w.type==='kunai')return;
  if(w.reloading||w.ammo<=0||w.fireCooldown>0||w.cooling)return;
  const target=nearestEnemy(G.px,G.py,w.range);
  const baseAng=target?Math.atan2(target.y-G.py,target.x-G.px):G.facing;
  if(w.type==='rpg'){G.rockets.push({x:G.px,y:G.py,vx:Math.cos(baseAng+(Math.random()-.5)*w.spread)*14,vy:Math.sin(baseAng+(Math.random()-.5)*w.spread)*14,dmg:w.dmg,life:120,size:6});w.ammo--;sfxShoot();w.fireCooldown=w.fireRate;if(w.ammo<=0)startReload(w);return;}
  if(w.type==='molotov'){const dist2v=target?Math.min(200,Math.sqrt((target.x-G.px)**2+(target.y-G.py)**2)):200;const lx=G.px+Math.cos(baseAng)*dist2v,ly=G.py+Math.sin(baseAng)*dist2v;G.fireZones.push({x:lx,y:ly,r:55,dmgTick:0,dmgRate:20,dmg:w.dmg,life:Math.round(300*G.molotovDurMul),maxLife:Math.round(300*G.molotovDurMul)});spawnFT(lx,ly-20,'FEUER!','#ff6600');w.ammo--;sfxShoot();w.fireCooldown=w.fireRate;if(w.ammo<=0)startReload(w);return;}
  for(let i=0;i<w.multiShot;i++){const a=baseAng+(Math.random()-.5)*w.spread+(i-(w.multiShot-1)/2)*w.spread*.7;G.bullets.push({x:G.px,y:G.py,vx:Math.cos(a)*10,vy:Math.sin(a)*10,dmg:w.dmg,size:w.bSize,pierce:w.pierce,hits:0,life:Math.round(w.range/10*6),color:getBulletColor(w.id),target});}
  w.ammo--;sfxShoot();w.fireCooldown=w.fireRate;if(w.ammo<=0)startReload(w);
  if(w.id==='minigun'&&!G.adminMingunNoCool){w.cooldown=(w.cooldown||0)+1;if(w.cooldown>=w.cooldownMax){w.cooling=true;w.cooldown=0;setTimeout(()=>{if(w)w.cooling=false;},w.coolLen/60*1000);}}
}
function getBulletColor(id){return{pistol:'#ffe066',rifle:'#88ccff',shotgun:'#ff8844',sniper:'#aaffaa',minigun:'#ff4444',rpg:'#ff6600',molotov:'#ff8800'}[id]||'#ffe066';}
function startReload(w){if(!w||w.reloading||w.mag===999)return;w.reloading=true;w.reloadTimer=w.reloadTime;}
function updateKunai(dt){const w=G.ownedWpns.find(x=>x.id==='kunai');if(!w)return;w.kunaiCd=(w.kunaiCd||0)-dt;if(w.kunaiCd>0)return;w.kunaiCd=w.kunaiRate;const sorted=[...G.enemies].sort((a,b)=>dist2(G.px,G.py,a.x,a.y)-dist2(G.px,G.py,b.x,b.y));const targets=sorted.slice(0,w.kunaiCount||1);if(G.bossActive&&G.boss&&targets.length<(w.kunaiCount||1))targets.push(G.boss);targets.forEach(t=>{if(!t)return;const ang=Math.atan2(t.y-G.py,t.x-G.px);G.kunais.push({x:G.px,y:G.py,vx:Math.cos(ang)*12,vy:Math.sin(ang)*12,dmg:w.dmg,life:80,rot:0});});if(targets.length)sfxKunai();}
function spawnWave(){const df=DIFF[G.diff]||DIFF.normal;const[mn,mx]=df.waveSize;const count=mn+Math.floor(Math.random()*(mx-mn+1));for(let i=0;i<count;i++){const side=Math.floor(Math.random()*4);const off=360;let x,y;if(side===0){x=G.px+Math.random()*off*2-off;y=G.py-off;}else if(side===1){x=G.px+off;y=G.py+Math.random()*off*2-off;}else if(side===2){x=G.px+Math.random()*off*2-off;y=G.py+off;}else{x=G.px-off;y=G.py+Math.random()*off*2-off;}const w2=G.wave;const types=[
      {type:'a',speed:(1.2+w2*.03)*df.speedMul,hp:28+w2*4,  size:18,dmg:8, ar:75,hat:Math.random()<.2},
      {type:'b',speed:(1.7+w2*.06)*df.speedMul,hp:14+w2*2,  size:14,dmg:5, ar:60},
      {type:'c',speed:(.65+w2*.02)*df.speedMul,hp:85+w2*10, size:22,dmg:16,ar:100},
      {type:'d',speed:(1.0+w2*.02)*df.speedMul,hp:20+w2*3,  size:15,dmg:3, ar:50, explosive:true},
      {type:'e',speed:(.5+w2*.01)*df.speedMul, hp:60+w2*8,  size:20,dmg:12,ar:90, healer:true},
      {type:'f',speed:(.3+w2*.01)*df.speedMul, hp:200+w2*20,size:30,dmg:25,ar:120,giant:true},
    ];
    const maxType=w2<3?3:w2<5?4:w2<7?5:6;
    const tt=types[Math.floor(Math.random()*maxType)];G.enemies.push({x,y,...tt,maxHp:tt.hp,attackCd:0,id:++G._eid,isBoss:false,tick:0});}}

function update(dt){
  if(paused||!gameRunning)return;
  globalTick++;G.gameTime+=dt;
  if(!G._eid)G._eid=0;
  if(G.regen>0){G.regenTick+=dt;if(G.regenTick>=300){G.regenTick=0;G.playerHp=Math.min(G.playerHp+G.regen,G.playerMaxHp);}}
  if(G.invincible>0)G.invincible-=dt;
  if(G.dashActive){G.dashTimer-=dt;if(G.dashTimer<=0)G.dashActive=false;}
  if(G.dashCd>0)G.dashCd-=dt;
  let mx=0,my=0;
  if(keys['w']||keys['arrowup'])my=-1;if(keys['s']||keys['arrowdown'])my=1;
  if(keys['a']||keys['arrowleft'])mx=-1;if(keys['d']||keys['arrowright'])mx=1;
  if(mx||my){const l=Math.sqrt(mx*mx+my*my);mx/=l;my/=l;}
  G.px+=mx*G.playerSpeed*(G.dashActive?3.2:1)*dt;G.py+=my*G.playerSpeed*(G.dashActive?3.2:1)*dt;
  G.camX=G.px-W/2;G.camY=G.py-H/2;
  G.facing=Math.atan2(mouse.y+G.camY-G.py,mouse.x+G.camX-G.px);
  G.ownedWpns.forEach(w=>{if(w.fireCooldown>0)w.fireCooldown-=dt;if(w.reloading){w.reloadTimer-=dt;if(w.reloadTimer<=0){w.reloading=false;w.ammo=w.maxAmmo;sfxReload();}}});
  if(mouse.down)tryShoot();
  updateKunai(dt);
  updateGuardianLogic(dt);
  updateRockets(dt);
  updateFireZones(dt);

  // MP: report position to server
  if(G.isMP && socket && socket.connected){
    socket.emit('game:move',{x:Math.round(G.px),y:Math.round(G.py),facing:G.facing});
  }

  // SOLO: handle boss timer / spawn
  if(!G.isMP){
    if(G.bossWarn>0)G.bossWarn-=dt;
    G.bossTimer=(G.bossTimer||0)+dt;
    if(!G.bossActive&&G.bossTimer>=3600){G.bossTimer=0;G.bossWarn=120;setTimeout(()=>{if(gameRunning&&!G.bossActive)spawnBoss();},2000);}  // 1 min
    if(!G.bossActive){G.spawnCd-=dt;if(G.spawnCd<=0){spawnWave();G.spawnCd=Math.max((DIFF[G.diff]||DIFF.normal).spawnMin,G.spawnRate-G.wave*3);}}
  }

  // MP: sync enemy positions from server snapshot
  if(G.isMP&&G.mpSnapshot){
    const snap=G.mpSnapshot;
    G.enemies=snap.enemies.map(se=>{const existing=G.enemies.find(e=>e.id===se.id);return existing?{...existing,...se}:{...se,type:'a',size:18,dmg:8,ar:75,isBoss:false,tick:0,attackCd:0,hat:false,maxHp:se.maxHp};});
    if(snap.boss&&G.bossActive){G.boss={...G.boss,...snap.boss};}
    G.wave=snap.wave;
    updateMPPlayerCards();
  }

  // Boss AI (solo)
  if(!G.isMP&&G.bossActive&&G.boss){
    const b=G.boss;b.tick=(b.tick||0)+dt;moveTo(b,G.px,G.py);b.attackCd-=dt;b.slamCd=(b.slamCd||300)-dt;
    if(b.slamAnim>0)b.slamAnim=Math.max(0,b.slamAnim-.05*dt);
    const d=distE(b,{x:G.px,y:G.py});
    if(d<b.size+18&&b.attackCd<=0){if(!G.dashActive&&G.invincible<=0)takeDmg(b.dmg);b.attackCd=80;}
    if(b.slamCd<=0&&d<200){b.slamCd=300;b.slamAnim=1;G.aoeRings.push({x:b.x,y:b.y,r:0,maxR:130,life:45});setTimeout(()=>{if(!G.bossActive||!G.boss)return;if(dist2(G.px,G.py,G.boss.x,G.boss.y)<130*130&&G.invincible<=0&&!G.dashActive)takeDmg(38);spawnFT(G.boss.x,G.boss.y-65,'SLAM!','#c0392b');triggerFlash('#ff3300',.3,10);},500);}
  }
  // Enemy AI (solo; in MP enemies come from server)
  if(!G.isMP){
    G.enemies.forEach(e=>{
      e.tick=(e.tick||0)+dt;
      moveTo(e,G.px,G.py);
      e.attackCd-=dt;
      if(distE(e,{x:G.px,y:G.py})<e.size+14&&e.attackCd<=0){
        if(!G.dashActive&&G.invincible<=0)takeDmg(e.dmg);
        e.attackCd=e.ar||70;
      }
      if(e.healer){
        e.healTick=(e.healTick||0)+dt;
        if(e.healTick>=60){
          e.healTick=0;
          G.enemies.forEach(n=>{if(n!==e&&n.hp>0&&dist2(e.x,e.y,n.x,n.y)<8100){n.hp=Math.min(n.hp+5,n.maxHp);}});
          spawnFT(e.x,e.y-e.size,'💚','#27ae60');
        }
      }
    });
  }

  // Bullets
  G.bullets.forEach(b=>{if(b.target&&b.target.hp>0){const tx=b.target.x-b.x,ty=b.target.y-b.y;const d=Math.sqrt(tx*tx+ty*ty);if(d>5){b.vx+=(tx/d)*10*.15-b.vx*.015;b.vy+=(ty/d)*10*.15-b.vy*.015;}}b.x+=b.vx*(dt/60*6);b.y+=b.vy*(dt/60*6);b.life-=dt;});
  G.bullets.forEach(b=>{
    if(b.life<=0||b.hits>=b.pierce)return;
    const targets=[...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies];
    targets.forEach(e=>{
      if(!e||e.hp<=0||b.hits>=b.pierce)return;
      if(dist2(b.x,b.y,e.x,e.y)<(e.size+b.size)**2){
        e.hp-=b.dmg;b.hits++;spawnBlood(e.x,e.y,6);spawnFT(e.x,e.y-e.size,'-'+b.dmg,'#ff6b5b');sfxHit();
        // Report hit to server in MP
        if(G.isMP&&socket)socket.emit('game:hit',{enemyId:e.isBoss?'boss':e.id,dmg:b.dmg});
        if(e.hp<=0)killEnemy(e);
      }
    });
  });
  G.bullets=G.bullets.filter(b=>b.life>0&&b.hits<b.pierce);
  G.kunais.forEach(k=>{k.x+=k.vx*(dt/60*6);k.y+=k.vy*(dt/60*6);k.rot+=.4;k.life-=dt;});
  G.kunais.forEach(k=>{if(k.life<=0)return;[...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies].forEach(e=>{if(!e||e.hp<=0)return;if(dist2(k.x,k.y,e.x,e.y)<(e.size+8)**2){e.hp-=k.dmg;k.life=0;spawnBlood(e.x,e.y,5);spawnFT(e.x,e.y-e.size,'-'+k.dmg,'#aaffaa');sfxHit();if(G.isMP&&socket)socket.emit('game:hit',{enemyId:e.isBoss?'boss':e.id,dmg:k.dmg});if(e.hp<=0)killEnemy(e);}});});
  G.kunais=G.kunais.filter(k=>k.life>0);
  G.enemies=G.enemies.filter(e=>e.hp>0);
  G.aoeRings.forEach(r=>{r.r+=4*dt/60*60;r.life-=dt;});G.aoeRings=G.aoeRings.filter(r=>r.life>0);
  G.particles.forEach(p=>{p.x+=p.vx*(dt/60*60);p.y+=p.vy*(dt/60*60);p.vx*=.9;p.vy*=.9;p.life-=dt;});G.particles=G.particles.filter(p=>p.life>0);
  G.floatingTexts.forEach(tt=>{tt.y+=tt.vy;tt.life--;tt.alpha=Math.max(0,tt.life/55);});G.floatingTexts=G.floatingTexts.filter(tt=>tt.life>0);
  G.lootDrops.forEach(l=>{l.bob+=.08;l.life--;});G.lootDrops=G.lootDrops.filter(l=>l.life>0);
  G.lootDrops.forEach(l=>{if(dist2(l.x,l.y,G.px,G.py)<32**2){sfxPickup();showLoot();G.lootDrops=[];}});
  if(!G.isMP){G.waveTimer+=dt;if(G.waveTimer>=7200){G.waveTimer=0;G.wave++;spawnFT(G.px,G.py-55,'WELLE '+G.wave+'!','#7ecff7');}}
  if(!G.isMP) updateLevelTimer(dt);
}

function spawnBoss(){const df=DIFF[G.diff]||DIFF.normal;const side=Math.floor(Math.random()*4);const off=400;let x,y;if(side===0){x=G.px;y=G.py-off;}else if(side===1){x=G.px+off;y=G.py;}else if(side===2){x=G.px;y=G.py+off;}else{x=G.px-off;y=G.py;}const hp=Math.round((800+G.wave*150)*df.bossHpMul);G.boss={x,y,hp,maxHp:hp,speed:.85*df.speedMul,size:52,dmg:22,isBoss:true,type:'boss',attackCd:0,attackRate:80,slamCd:300,slamAnim:0,tick:0};G.bossActive=true;document.getElementById('boss-bar').style.display='block';sfxBossAppear();}
function killEnemy(e){
  if(e.isBoss){
    spawnBlood(e.x,e.y,20);spawnFT(e.x,e.y-65,'BOSS!','#f7c948');
    G.bossActive=false;G.boss=null;document.getElementById('boss-bar').style.display='none';
    G.lootDrops.push({x:G.px,y:G.py,bob:0,life:600});G.kills++;G.earnedCoins+=15;
  } else {
    spawnBlood(e.x,e.y,8);sfxDie();G.kills++;e.hp=-1;G.earnedCoins+=1;checkUpgrade();
    if(e.explosive){
      sfxExplosion();
      G.aoeRings.push({x:e.x,y:e.y,r:0,maxR:80,life:30});
      spawnFT(e.x,e.y-20,'💥','#ff6600');
      [...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies].forEach(en=>{
        if(en.hp>0&&dist2(e.x,e.y,en.x,en.y)<6400){en.hp-=30;}
      });
      if(dist2(e.x,e.y,G.px,G.py)<6400&&G.invincible<=0&&!G.dashActive)takeDmg(25);
    }
  }
}
function takeDmg(d){if(G.godMode){spawnFT(G.px,G.py-20,'GOD!','#e74c3c');return;}if(G.shield){G.shield=false;spawnFT(G.px,G.py-24,'GEBLOCKT!','#3498db');return;}triggerFlash('#cc0000',.25,8);G.playerHp-=d;G.invincible=30;if(G.playerHp<=0){G.playerHp=0;if(G.isMP&&socket)socket.emit('game:died');endRound(false);}}
function checkUpgrade(){if(G.kills>=G.killsForNext){G.killsForNext=Math.floor(G.killsForNext*1.7);paused=true;showUpgradeMenu();}}
function spawnBlood(x,y,n=6){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,s=1+Math.random()*4;
    const r=2+Math.random()*4;
    G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r,life:30+Math.random()*20,color:Math.random()<.3?'#cc2200':'#8b0000'});
  }
  // Small spark particles
  for(let i=0;i<Math.floor(n/2);i++){
    const a=Math.random()*Math.PI*2,s=2+Math.random()*6;
    G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1,life:15+Math.random()*10,color:'#ffaa00'});
  }
}
function spawnFT(x,y,text,color='#f7c948'){G.floatingTexts.push({x,y,vy:-1.1,text,color,life:55,alpha:1});}

// Guardian
function updateGuardianLogic(dt){if(!G.guardianLvl)return;G.guardianAngle=(G.guardianAngle||0)+.04*dt;const lvl=G.guardianLvl,max=[0,2,3,4,5,5,6][Math.min(lvl,6)],perm=lvl>=6;if(!perm){G.guardianTimer=(G.guardianTimer||0)+dt;const t=G.guardianTimer%(30*60+15*60);G.guardianVisible=t<30*60;}else{G.guardianVisible=true;}G.guardians=[];if(G.guardianVisible){for(let i=0;i<max;i++){const a=G.guardianAngle+i*(Math.PI*2/max),r=42;G.guardians.push({x:G.px+Math.cos(a)*r,y:G.py+Math.sin(a)*r,angle:a+Math.PI/2});}G.enemies.forEach(e=>{G.guardians.forEach(gd=>{if(dist2(gd.x,gd.y,e.x,e.y)<(e.size+10)**2){e.hp-=.5*dt;if(e.hp<=0)killEnemy(e);}});});if(G.bossActive&&G.boss){G.guardians.forEach(gd=>{if(dist2(gd.x,gd.y,G.boss.x,G.boss.y)<(G.boss.size+10)**2){G.boss.hp-=.3*dt;if(G.boss.hp<=0)killEnemy(G.boss);}});}}}
G.enemies=G.enemies?(G.enemies.filter(e=>e.hp>0)):[];

// Rockets & fire zones
function updateRockets(dt){if(!G.rockets)return;G.rockets.forEach(r=>{r.x+=r.vx*(dt/60*6);r.y+=r.vy*(dt/60*6);r.life-=dt;});G.rockets.forEach(r=>{if(r.life<=0||r.exploded)return;const targets=[...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies];const hit=targets.find(e=>e.hp>0&&dist2(r.x,r.y,e.x,e.y)<(e.size+r.size)**2);if(hit||r.life<2){r.exploded=true;const ex=r.x,ey=r.y;G.aoeRings.push({x:ex,y:ey,r:0,maxR:90,life:30});spawnBlood(ex,ey,16);spawnFT(ex,ey-30,'💥 BOOM!','#ff6600');[...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies].forEach(e=>{if(e.hp>0&&dist2(ex,ey,e.x,e.y)<90**2){e.hp-=r.dmg;if(e.hp<=0)killEnemy(e);else{spawnBlood(e.x,e.y,5);spawnFT(e.x,e.y-e.size,'-'+r.dmg,'#ff6600');}}});}});G.rockets=G.rockets.filter(r=>!r.exploded&&r.life>0);}
function updateFireZones(dt){if(!G.fireZones)return;G.fireZones.forEach(fz=>{fz.life-=dt;fz.dmgTick=(fz.dmgTick||0)+dt;if(fz.dmgTick>=fz.dmgRate){fz.dmgTick=0;[...(G.bossActive&&G.boss?[G.boss]:[]),...G.enemies].forEach(e=>{if(e.hp>0&&dist2(fz.x,fz.y,e.x,e.y)<fz.r**2){e.hp-=fz.dmg;if(e.hp<=0)killEnemy(e);}});}});G.fireZones=G.fireZones.filter(fz=>fz.life>0);G.enemies=G.enemies.filter(e=>e.hp>0);}
// ═══════════════════════════════════════════════════════
//  UI helpers
// ═══════════════════════════════════════════════════════
function showUpgradeMenu(){
  paused = true;
  mouse.down = false;
  sfxLevelUp();
  triggerFlash('#f7c948',.2,12);
  const ov = document.getElementById('ov-upgrade');
  ov.classList.remove('h');

  const killsEl = document.getElementById('upg-kills');
  if(killsEl) killsEl.textContent = G.kills;

  const cont = document.getElementById('upg-cards');
  cont.innerHTML = '';

  // Defensive copy so spread/slice issues can't corrupt originals
  const safePool = pickRandom(ALL_UPGRADES.map(u=>({...u})), 3);

  if(!safePool.length){
    // Failsafe: should never happen but give player an exit
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.textContent = 'Weiter';
    skip.className = 'btn green';
    skip.addEventListener('click', ()=>{ ov.classList.add('h'); mouse.down=false; paused=false; });
    cont.appendChild(skip);
    return;
  }

  safePool.forEach(u=>{
    const btn = document.createElement('button');
    btn.type = 'button';

    // Inline styles so CSS class issues can't interfere
    btn.style.cssText = [
      'background:#0d1825',
      'border:2.5px solid #f7c948',
      'border-radius:12px',
      'padding:0.8rem 0.65rem',
      'width:145px',
      'min-height:110px',
      'cursor:pointer',
      'text-align:center',
      'font-family:inherit',
      'transition:transform 0.15s',
      'display:inline-block',
      'vertical-align:top',
      'margin:0 4px',
    ].join(';');

    btn.onmouseenter = ()=>{ btn.style.transform='scale(1.07)'; btn.style.borderColor='#ffe577'; };
    btn.onmouseleave = ()=>{ btn.style.transform=''; btn.style.borderColor='#f7c948'; };

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size:1.6rem;margin-bottom:0.3rem;line-height:1.2;';
    icon.textContent = u.icon || '⬆️';
    btn.appendChild(icon);

    const name = document.createElement('div');
    name.style.cssText = "font-family:'Bangers',cursive;font-size:1rem;color:#f7c948;letter-spacing:0.5px;";
    name.textContent = u.name || '?';
    btn.appendChild(name);

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:0.7rem;color:#8aa8c0;line-height:1.3;margin-top:0.25rem;';
    desc.textContent = u.desc || '';
    btn.appendChild(desc);

    // Use stored reference to apply function – not the spread copy's apply
    const applyFn = ALL_UPGRADES.find(x=>x.id===u.id)?.apply;

    btn.addEventListener('click', function handler(){
      btn.removeEventListener('click', handler);
      try { if(applyFn) applyFn(G); } catch(e){ console.error('Upgrade apply error:', e); }
      G.activeUpgrades.push(u);
      ov.classList.add('h');
      mouse.down = false;
      paused = false;
    });

    cont.appendChild(btn);
  });
}
function forceCloseUpgrade(){
  document.getElementById('ov-upgrade').classList.add('h');
  mouse.down=false;
  paused=false;
}

function showLoot(){
  paused=true;
  const ov=document.getElementById('ov-loot');
  showOverlay('ov-loot');
  const pool=pickRandom(LOOT_POOL,3),cont=document.getElementById('loot-items');
  cont.innerHTML='';
  pool.forEach(u=>{
    const d=document.createElement('button');
    d.className='loot-item';
    d.type='button';
    d.style.cssText='background:#0d1825;border:2.5px solid var(--green,#27ae60);border-radius:12px;padding:.8rem .65rem;width:145px;cursor:pointer;text-align:center;font-family:inherit;';
    const ic2=document.createElement('div');ic2.className='upg-icon';ic2.textContent=u.icon;
    const nm2=document.createElement('div');nm2.className='upg-name';nm2.style.color='#27ae60';nm2.textContent=u.name;
    const ds2=document.createElement('div');ds2.className='upg-desc';ds2.textContent=u.desc;
    d.appendChild(ic2);d.appendChild(nm2);d.appendChild(ds2);
    d.addEventListener('click',()=>{
      u.apply(G);
      if(!['heal','nuke','shield','ammo'].includes(u.id)) G.activeUpgrades.push(u);
      ov.classList.add('h');
      mouse.down=false;
      paused=false;
    });
    cont.appendChild(d);
  });
}
function togglePause(){if(!gameRunning)return;paused=!paused;const po=document.getElementById('ov-pause');if(paused){showOverlay('ov-pause');const list=document.getElementById('pause-upg-list');list.innerHTML='';if(!G.activeUpgrades.length)list.innerHTML='<li style="color:#555;">Noch keine</li>';else G.activeUpgrades.forEach(u=>{const li=document.createElement('li');li.textContent=u.icon+' '+u.name;list.appendChild(li);});}else{po.classList.add('h');CV.style.pointerEvents='auto';}}
// ═══════════════════════════════════════════════════════
//  SCORE SAVING & ROUND END
// ═══════════════════════════════════════════════════════
async function saveScore(secs,mode){
  const tStr=Math.floor(secs/60)+'m '+(secs%60)+'s';
  try{await api('POST','/api/scores',{time:tStr,secs,kills:G.kills,wave:G.wave,diff:selectedDiff,mode});}catch(e){console.error('Score save:',e.message);}
}

async function endRound(manual){
  gameRunning=false;stopMusic();if(animId)cancelAnimationFrame(animId);hideAll();
  const secs=Math.floor(G.gameTime/60);
  const tStr=Math.floor(secs/60)+'m '+(secs%60)+'s';
  const mul=(DIFF[G.diff]||DIFF.normal).coinMul;
  const earned=Math.round(G.earnedCoins*mul);
  if(currentUser){currentUser.coins=(currentUser.coins||0)+earned;await saveUserServer({coins:currentUser.coins});}
  await saveScore(secs, G.isMP ? mpMode : 'solo');
  document.getElementById('end-title').textContent=t(manual?'gave_up':'game_over');
  document.getElementById('end-stats').innerHTML=`${t('time_label')}: <b>${tStr}</b> | ${t('kills_stat')}: <b>${G.kills}</b> | ${t('wave_stat')}: <b>${G.wave}</b>`;
  const mulLabel={easy:'×0.5',normal:'×1',hard:'×1.5',nightmare:'×2'}[G.diff]||'';
  document.getElementById('end-coins').innerHTML=`+${earned} 🪙 <span style="font-size:.8rem;color:#9db4c8;">(${G.kills} Kills ${mulLabel})</span>`;
  show('ov-end');
  document.getElementById('wpn-bar').style.display='none';
  document.getElementById('acct-bar').style.display='none';
  document.getElementById('boss-bar').style.display='none';
  document.getElementById('admin-btn').style.display='none';
  document.getElementById('mp-player-bar').style.display='none';
  CV.style.pointerEvents='auto';
}

async function handleMPGameOver(results, wave, gameTime){
  gameRunning=false;stopMusic();if(animId)cancelAnimationFrame(animId);hideAll();
  const secs=Math.floor(gameTime/60);
  const myResult=results.find(r=>r.username===currentUser?.username)||{kills:0};
  const earned=Math.round(myResult.kills*1.5);
  if(currentUser){currentUser.coins=(currentUser.coins||0)+earned;await saveUserServer({coins:currentUser.coins});}
  await saveScore(secs, mpMode||'coop');
  let resultText='';
  if(mpMode==='versus'){
    const winner=results.reduce((a,b)=>(a.kills||0)>(b.kills||0)?a:b);
    resultText=`${t('mp_versus_winner')}: ${winner.username} (${winner.kills} Kills)`;
  } else {
    resultText=results.map(r=>`${r.username}: ☠${r.kills}`).join(' | ');
  }
  document.getElementById('end-title').textContent=t('mp_game_over');
  document.getElementById('end-stats').innerHTML=resultText;
  const mulLabel={easy:'×0.5',normal:'×1',hard:'×1.5',nightmare:'×2'}[G.diff]||'';
  document.getElementById('end-coins').innerHTML=`+${earned} 🪙 <span style="font-size:.8rem;color:#9db4c8;">(${G.kills} Kills ${mulLabel})</span>`;
  show('ov-end');
  document.getElementById('wpn-bar').style.display='none';
  document.getElementById('acct-bar').style.display='none';
  document.getElementById('mp-player-bar').style.display='none';
}

function goMenu(){hideAll();openMenu();}
// ═══════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════
function loop(ts){if(!gameRunning)return;const dt=Math.min((ts-lastTime)/16.667,3);lastTime=ts;update(dt);draw();animId=requestAnimationFrame(loop);}

function startSoloGame(){
  ensureAC();hideAll();mpMode='solo';initGame(false);
  document.getElementById('acct-bar').style.display='flex';
  const isAdmin=['mrmaik','mrmaik'].includes(currentUser?.username?.toLowerCase());
  document.getElementById('admin-btn').style.display=isAdmin?'block':'none';
  document.getElementById('admin-panel').style.display='none';
  document.getElementById('mp-player-bar').style.display='none';
  gameRunning=true;paused=false;lastTime=performance.now();
  if(animId)cancelAnimationFrame(animId);animId=requestAnimationFrame(loop);startMusic();
}

function startMPGame(){
  ensureAC();hideAll();initGame(true);
  document.getElementById('acct-bar').style.display='flex';
  document.getElementById('mp-player-bar').style.display='flex';
  const isAdmin=['mrmaik','mrmaik'].includes(currentUser?.username?.toLowerCase());
  document.getElementById('admin-btn').style.display=isAdmin?'block':'none';
  document.getElementById('admin-panel').style.display='none';
  gameRunning=true;paused=false;lastTime=performance.now();
  if(animId)cancelAnimationFrame(animId);animId=requestAnimationFrame(loop);startMusic();
}
// ═══════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════
window.addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key==='r'||e.key==='R'){const w=curWpn();if(w&&gameRunning)startReload(w);}
  if(e.key==='Escape'&&gameRunning)togglePause();
  if(e.key===' '&&gameRunning)togglePause();
  if(e.key==='Shift'&&G&&G.hasDash&&G.dashCd<=0){G.dashActive=true;G.dashTimer=18;G.dashCd=220;}
  const n=parseInt(e.key);if(n>=1&&n<=8&&G&&G.ownedWpns&&G.ownedWpns[n-1])switchWpn(n-1);
  // Never block input when user is typing in a text field
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
  if(gameRunning && !isTyping) e.preventDefault();
});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
CV.addEventListener('mousemove',e=>{const r=CV.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
CV.addEventListener('mousedown',e=>{
  if(e.button===0){
    // Only register shot if NO overlay is currently visible
    const anyOpen=[...document.querySelectorAll('.ov')].some(o=>!o.classList.contains('h'));
    if(!anyOpen) mouse.down=true;
    ensureAC();
  }
});
CV.addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
window.addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
CV.addEventListener('contextmenu',e=>e.preventDefault());
// ═══════════════════════════════════════════════════════
//  OVERLAY helpers
// ═══════════════════════════════════════════════════════
function hideAll(){
  document.querySelectorAll('.ov').forEach(o=>o.classList.add('h'));
  document.getElementById('boss-bar').style.display='none';
  document.getElementById('boss-warn').style.display='none';
}
function showOverlay(id){
  document.getElementById(id).classList.remove('h');
  mouse.down=false;
  // Don't set pointer-events:none on canvas – overlays catch clicks via z-index
}
function show(id){
  document.getElementById(id).classList.remove('h');
  mouse.down=false;
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
