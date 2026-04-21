// ═══════════════════════════════════════════════════════
//  AUDIO
// ═══════════════════════════════════════════════════════
let AC=null,musicGain=null,musicNodes=[],volVal=.35;
function ensureAC(){if(AC)return;AC=new(window.AudioContext||window.webkitAudioContext)();musicGain=AC.createGain();musicGain.gain.value=volVal;musicGain.connect(AC.destination);}
function setVol(v){volVal=parseFloat(v);['vol-settings','vol-pause'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=v;});if(musicGain)musicGain.gain.setTargetAtTime(volVal,AC.currentTime,.05);}
function stopMusic(){musicNodes.forEach(n=>{try{n.stop();}catch(e){}});musicNodes=[];}
function startMusic(){
  ensureAC();stopMusic();
  playML([55,55,58,55],[.5,.5,.5,.5],'sawtooth',.15);
  playML([220,246,220,196,220,246,261,220],[.3,.3,.3,.3,.3,.3,.3,.3],'square',.05);
  playML([440,494,523,494,440,415,440,494],[.15,.15,.15,.15,.15,.15,.15,.15],'triangle',.04);
  playPL([0,.5,1,1.5],2,.2);
}
function playML(freqs,durs,type,amp){
  ensureAC();const tot=durs.reduce((a,b)=>a+b,0);
  function sc(st){freqs.forEach((f,i)=>{const tt=st+durs.slice(0,i).reduce((a,b)=>a+b,0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(amp,tt+.02);g.gain.linearRampToValueAtTime(0,tt+durs[i]-.02);o.connect(g);g.connect(musicGain);o.start(tt);o.stop(tt+durs[i]);musicNodes.push(o);});if(gameRunning)setTimeout(()=>sc(AC.currentTime+.05),(tot-.1)*1000);}
  sc(AC.currentTime+.05);
}
function playPL(beats,barLen,amp){
  ensureAC();
  function sc(st){beats.forEach(b=>{const tt=st+b,buf=AC.createBuffer(1,AC.sampleRate*.08,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(d.length*.15));const src=AC.createBufferSource(),g=AC.createGain();g.gain.value=amp;src.buffer=buf;src.connect(g);g.connect(musicGain);src.start(tt);musicNodes.push(src);});if(gameRunning)setTimeout(()=>sc(AC.currentTime+.05),(barLen-.1)*1000);}
  sc(AC.currentTime+.05);
}
function sfx(freq,dur,type='square',vol=.1,freqEnd){
  if(!AC)return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,AC.currentTime);
  if(freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd,AC.currentTime+dur);
  g.gain.setValueAtTime(vol,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+dur);
}

function sfxNoise(dur,vol=.1,filterFreq=2000){
  if(!AC)return;
  const buf=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(d.length*.3));
  const src=AC.createBufferSource();
  const filt=AC.createBiquadFilter();filt.type='bandpass';filt.frequency.value=filterFreq;
  const g=AC.createGain();g.gain.setValueAtTime(vol,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
  src.buffer=buf;src.connect(filt);filt.connect(g);g.connect(AC.destination);src.start();src.stop(AC.currentTime+dur);
}

// Per-weapon sound effects
function sfxShootWeapon(wpnId){
  if(!AC) return;
  switch(wpnId){
    case 'pistol':
      sfxNoise(.08,.14,1800);
      sfx(320,.06,'square',.05,80);
      break;
    case 'rifle':
      sfxNoise(.05,.18,2400);
      sfx(280,.04,'square',.07,120);
      break;
    case 'shotgun':
      // Multiple blasts
      sfxNoise(.15,.25,800);
      sfx(90,.12,'sawtooth',.12,40);
      setTimeout(()=>sfxNoise(.1,.15,600),30);
      break;
    case 'sniper':
      sfxNoise(.04,.22,4000);
      sfx(180,.18,'square',.15,40);
      sfx(400,.05,'sine',.05);
      break;
    case 'rpg':
      sfx(80,.2,'sawtooth',.2,30);
      sfxNoise(.25,.3,300);
      break;
    case 'molotov':
      sfx(300,.1,'sine',.06,200);
      sfxNoise(.12,.1,1200);
      break;
    case 'minigun':
      sfxNoise(.04,.15,2200);
      sfx(400,.03,'square',.05);
      break;
    case 'kunai':
      sfx(1400,.06,'sine',.07,800);
      break;
    default:
      sfxNoise(.06,.12,1800);
  }
}

function sfxShoot(){sfxShootWeapon(G?.ownedWpns?.[G?.activeWpn]?.id||'pistol');}
function sfxKunai(){sfx(1400,.06,'sine',.07,800);}
function sfxHit(){sfxNoise(.08,.12,500);sfx(180,.08,'sawtooth',.08,100);}
function sfxDie(){sfx(70,.25,'sawtooth',.15,30);sfxNoise(.2,.2,200);}
function sfxLevelUp(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>sfx(f,.15,'sine',.12),i*80));}
function sfxBossAppear(){sfx(55,.6,'sawtooth',.25);setTimeout(()=>sfx(40,.4,'sawtooth',.2),300);sfxNoise(.5,.3,100);}
function sfxExplosion(){sfx(60,.4,'sawtooth',.3,20);sfxNoise(.35,.35,180);setTimeout(()=>sfxNoise(.2,.2,100),100);}
function sfxReload(){sfx(600,.06,'square',.04);setTimeout(()=>sfx(900,.08,'square',.05),120);}
function sfxPickup(){sfx(880,.1,'sine',.08);setTimeout(()=>sfx(1100,.12,'sine',.06),80);}


function triggerFlash(color='#ff0000',alpha=0.35,dur=8){
  screenFlash={alpha,color,duration:dur,max:alpha};
}

