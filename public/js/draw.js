// ═══════════════════════════════════════════════════════
//  MAP (infinite tiled)
// ═══════════════════════════════════════════════════════
const TILE=64;
function tileAt(col,row){const h=(col*2654435761^row*1234567891)>>>0,v=h%100;if(col%6===0&&row%5===0)return 1;if(col%6===1&&row%5===0)return 2;if(col%6===0&&row%5===1)return 3;if(v<5)return 4;if(v<8)return 5;if(v<11)return 6;return 0;}
function drawMap(camX,camY){
  const lvl=LEVELS.find(l=>l.id===selectedLevel)||LEVELS[0];
  // Draw themed background fill
  ctx.fillStyle=lvl.bgColor||'#1e3a2f';
  ctx.fillRect(0,0,W,H);
  const c0=Math.floor(camX/TILE)-1,r0=Math.floor(camY/TILE)-1,c1=c0+Math.ceil(W/TILE)+2,r1=r0+Math.ceil(H/TILE)+2;
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)drawTile(c,r,c*TILE-camX,r*TILE-camY,lvl.mapTheme);
}
function drawTile(col,row,sx,sy,theme){const type=tileAt(col,row),seed=((col*31+row*17)>>>0)%8;switch(type){case 0:ctx.fillStyle=seed<4?'#252525':'#222';ctx.fillRect(sx,sy,TILE,TILE);if(col%4===0){ctx.strokeStyle='rgba(180,160,50,.12)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+TILE/2,sy);ctx.lineTo(sx+TILE/2,sy+TILE);ctx.stroke();}if(row%3===0){ctx.strokeStyle='rgba(180,160,50,.08)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,sy+TILE/2);ctx.lineTo(sx+TILE,sy+TILE/2);ctx.stroke();}break;case 1:case 2:case 3:{const clrs=['#1a2535','#1e2d1e','#231e1e'];ctx.fillStyle=clrs[type-1];ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='rgba(255,220,80,.12)';[[6,6],[6,28],[32,6],[32,28]].forEach(([ox,oy])=>{if((seed+ox)%3!==0)ctx.fillRect(sx+ox,sy+oy,14,12);});ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;ctx.strokeRect(sx,sy,TILE,TILE);break;}case 4:ctx.fillStyle='#2a2520';ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='#3a3028';[[4,8,22,16],[22,6,18,22],[8,28,26,18]].forEach(([rx,ry,rw,rh])=>ctx.fillRect(sx+rx,sy+ry,rw,rh));break;case 5:{ctx.fillStyle='#222';ctx.fillRect(sx,sy,TILE,TILE);const clrs2=['#7a1a1a','#1a3a7a','#1a6a2a'];ctx.fillStyle=clrs2[seed%3];ctx.fillRect(sx+4,sy+14,TILE-8,30);ctx.fillStyle='rgba(150,220,255,.25)';ctx.fillRect(sx+8,sy+17,18,10);ctx.fillRect(sx+36,sy+17,18,10);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(sx+12,sy+42,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(sx+50,sy+42,6,0,Math.PI*2);ctx.fill();break;}case 6:ctx.fillStyle='#302828';ctx.fillRect(sx,sy,TILE,TILE);for(let bx=0;bx<TILE;bx+=12)for(let by=0;by<TILE;by+=8){ctx.fillStyle=(bx+by)%16===0?'#3a3030':'#282020';ctx.fillRect(sx+bx,sy+by,11,7);}break;}}
// ═══════════════════════════════════════════════════════
//  DRAW (identical to V4)
// ═══════════════════════════════════════════════════════
function draw(){
  ctx.clearRect(0,0,W,H);drawMap(G.camX,G.camY);
  const cx=-G.camX,cy=-G.camY;
  G.aoeRings.forEach(r=>{ctx.save();ctx.translate(r.x+cx,r.y+cy);ctx.strokeStyle=`rgba(192,57,43,${r.life/45*.8})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r.r,0,Math.PI*2);ctx.stroke();ctx.fillStyle=`rgba(192,57,43,${r.life/45*.1})`;ctx.beginPath();ctx.arc(0,0,r.r,0,Math.PI*2);ctx.fill();ctx.restore();});
  G.lootDrops.forEach(l=>{const by=Math.sin(l.bob)*5;ctx.save();ctx.translate(l.x+cx,l.y+cy+by);ctx.fillStyle='#f7c948';ctx.strokeStyle='#b8860b';ctx.lineWidth=2;rr(ctx,-18,-12,36,26,6);ctx.fill();ctx.stroke();ctx.fillStyle='#b8860b';ctx.font='bold 9px Nunito';ctx.textAlign='center';ctx.fillText('BEUTE!',0,5);ctx.restore();});
  G.particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/40);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x+cx,p.y+cy,p.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  G.enemies.forEach(e=>{
    const sx=e.x+cx,sy=e.y+cy;
    if(sx<-80||sx>W+80||sy<-100||sy>H+100)return;
    if(e.type==='a')      drawZombieA(sx,sy,e.size,e.hp,e.maxHp,e.hat,e.tick||0);
    else if(e.type==='b') drawZombieB(sx,sy,e.size,e.hp,e.maxHp,e.tick||0);
    else if(e.type==='c') drawZombieC(sx,sy,e.size,e.hp,e.maxHp,e.tick||0);
    else if(e.type==='d') drawZombieD(sx,sy,e.size,e.hp,e.maxHp,e.tick||0);
    else if(e.type==='e') drawZombieE(sx,sy,e.size,e.hp,e.maxHp,e.tick||0);
    else if(e.type==='f') drawZombieF(sx,sy,e.size,e.hp,e.maxHp,e.tick||0);
  });
  if(G.bossActive&&G.boss){const b=G.boss;drawBoss(b.x+cx,b.y+cy,b.hp,b.maxHp,b.tick||0,b.slamAnim||0);document.getElementById('boss-fill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';}

  // Draw other MP players
  if(G.isMP&&G.mpSnapshot){
    G.mpSnapshot.members.forEach(m=>{
      if(m.username===currentUser.username)return;
      const sx=m.x+cx,sy=m.y+cy;
      drawRemotePlayer(sx,sy,m.username);
    });
  }

  // Guardians
  if(G.guardians&&G.guardianVisible){G.guardians.forEach(gd=>{const sx=gd.x+cx,sy=gd.y+cy;ctx.save();ctx.translate(sx,sy);ctx.rotate(gd.angle);ctx.fillStyle='#c0392b';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(4,0);ctx.lineTo(0,5);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.fillStyle='#2c2c2c';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();for(let b=0;b<3;b++){ctx.save();ctx.rotate(b*Math.PI*2/3);ctx.fillStyle='#8b0000';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(4,-7);ctx.lineTo(-4,-7);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();});}

  // Rockets
  if(G.rockets)G.rockets.forEach(r=>{const sx=r.x+cx,sy=r.y+cy;const ang=Math.atan2(r.vy,r.vx);ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);ctx.fillStyle='#e74c3c';rr(ctx,-4,-3,14,6,3);ctx.fill();ctx.fillStyle='#ff6600';ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(-9,-4);ctx.lineTo(-9,4);ctx.closePath();ctx.fill();ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(-10,0,4,0,Math.PI*2);ctx.fill();ctx.restore();});

  // Fire zones
  if(G.fireZones)G.fireZones.forEach(fz=>{const sx=fz.x+cx,sy=fz.y+cy;const alpha=(fz.life/fz.maxLife)*.7;ctx.fillStyle=`rgba(255,100,0,${alpha*.4})`;ctx.beginPath();ctx.arc(sx,sy,fz.r,0,Math.PI*2);ctx.fill();ctx.fillStyle=`rgba(255,200,0,${alpha*.6})`;ctx.beginPath();ctx.arc(sx,sy,fz.r*.5,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++){const fa=i/6*Math.PI*2+globalTick*.1;const fr=fz.r*.6*Math.random();ctx.fillStyle=`rgba(255,${80+Math.random()*120|0},0,${alpha})`;ctx.beginPath();ctx.arc(sx+Math.cos(fa)*fr,sy+Math.sin(fa)*fr,4+Math.random()*5,0,Math.PI*2);ctx.fill();}});

  // Kunais
  G.kunais.forEach(k=>{const sx=k.x+cx,sy=k.y+cy;ctx.save();ctx.translate(sx,sy);ctx.rotate(k.rot);ctx.fillStyle='#2c2c2c';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(3,4);ctx.lineTo(0,8);ctx.lineTo(-3,4);ctx.closePath();ctx.fill();ctx.fillStyle='#c0392b';ctx.fillRect(-2,0,4,5);ctx.fillStyle='#555';ctx.beginPath();ctx.arc(0,10,4,0,Math.PI*2);ctx.fill();ctx.restore();});

  // Bullets
  G.bullets.forEach(b=>{const sx=b.x+cx,sy=b.y+cy;ctx.fillStyle=b.color+'44';ctx.beginPath();ctx.arc(sx,sy,b.size+4,0,Math.PI*2);ctx.fill();ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(sx,sy,b.size,0,Math.PI*2);ctx.fill();ctx.strokeStyle=b.color+'88';ctx.lineWidth=b.size*.6;ctx.beginPath();ctx.moveTo(sx-b.vx*2.5,sy-b.vy*2.5);ctx.lineTo(sx,sy);ctx.stroke();});

  drawPlayer(G.px+cx,G.py+cy,G.facing);

  const psx=G.px+cx,psy=G.py+cy;
  const hpPct=G.playerHp/G.playerMaxHp;
  ctx.fillStyle='rgba(0,0,0,.55)';rr(ctx,psx-22,psy+18,44,6,2);ctx.fill();
  ctx.fillStyle=hpPct>.5?'#27ae60':hpPct>.25?'#f39c12':'#c0392b';rr(ctx,psx-22,psy+18,44*hpPct,6,2);ctx.fill();
  if(G.shield){ctx.strokeStyle='rgba(52,152,219,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(psx,psy,20,0,Math.PI*2);ctx.stroke();}

  G.floatingTexts.forEach(tt=>{ctx.globalAlpha=Math.max(0,tt.alpha);ctx.fillStyle=tt.color;ctx.font='bold 13px Nunito';ctx.textAlign='center';ctx.fillText(tt.text,tt.x+cx,tt.y+cy);});ctx.globalAlpha=1;

  drawHUD();
  // Screen flash overlay
  if(screenFlash.alpha>0){
    ctx.fillStyle=screenFlash.color;
    ctx.globalAlpha=screenFlash.alpha;
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=1;
    screenFlash.alpha=Math.max(0,screenFlash.alpha-screenFlash.max/screenFlash.duration);
  }
}

function drawRemotePlayer(sx,sy,name){
  ctx.save();ctx.translate(sx,sy);
  ctx.fillStyle='rgba(52,152,219,.7)';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#3498db';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 10px Nunito';ctx.textAlign='center';ctx.fillText(name.substring(0,8),0,24);
  ctx.restore();
}

function px2(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawPlayer(sx,sy,angle){ctx.save();ctx.translate(sx,sy);ctx.rotate(angle);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,15,11,4,0,0,Math.PI*2);ctx.fill();px2(-8,8,7,13,'#5b2d8e');px2(1,8,7,13,'#5b2d8e');px2(-10,19,9,4,'#1a1a1a');px2(1,19,9,4,'#1a1a1a');px2(-10,-5,20,14,'#3a3a6a');px2(-3,-7,6,4,'#c8884a');px2(-10,-20,20,14,'#c8884a');px2(-6,-16,3,3,'#1a0a00');px2(4,-16,3,3,'#1a0a00');px2(-10,-24,20,6,'#c0392b');px2(-13,-22,4,4,'#c0392b');px2(9,-22,5,3,'#a93226');px2(-8,-24,14,2,'#e74c3c');const w=curWpn();if(w){if(w.id==='minigun'){ctx.fillStyle='#444';rr(ctx,5,-6,28,12,4);ctx.fill();ctx.fillStyle='#333';rr(ctx,29,-8,14,5,2);ctx.fill();rr(ctx,29,3,14,5,2);ctx.fill();}else if(w.id==='rpg'){ctx.fillStyle='#5a5a5a';rr(ctx,4,-4,26,8,3);ctx.fill();ctx.fillStyle='#c0392b';rr(ctx,6,-6,6,12,2);ctx.fill();}else if(w.id==='molotov'){ctx.fillStyle='#2e6b2e';rr(ctx,8,-5,12,10,4);ctx.fill();ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(20,-7,3,0,Math.PI*2);ctx.fill();}else if(w.id==='shotgun'){ctx.fillStyle='#5a3010';rr(ctx,6,-4,24,8,3);ctx.fill();ctx.fillStyle='#2c2c2c';rr(ctx,24,-5,14,5,2);ctx.fill();}else if(w.id==='sniper'){ctx.fillStyle='#2c3a2c';rr(ctx,6,-3,30,6,2);ctx.fill();ctx.fillStyle='rgba(150,220,255,.6)';ctx.fillRect(18,-8,8,5);}else{ctx.fillStyle='#2c2c2c';rr(ctx,6,-3,22,7,2);ctx.fill();ctx.fillStyle='#1a1a1a';rr(ctx,24,-5,10,4,1);ctx.fill();}}if(G.dashActive){ctx.strokeStyle='rgba(126,207,247,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.stroke();}ctx.restore();}

function drawZombieA(sx,sy,sz,hp,maxHp,hat,tick){ctx.save();ctx.translate(sx,sy);const s=sz/18;ctx.scale(s,s);const bob=Math.sin((tick||0)*.06)*2;ctx.translate(0,bob);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,22,12,4,0,0,Math.PI*2);ctx.fill();px2(-9,8,7,14,'#3d6b3d');px2(2,8,7,14,'#3d6b3d');px2(-11,20,9,5,'#1a1a1a');px2(2,20,9,5,'#1a1a1a');px2(-10,-2,20,12,'#3a6b4a');px2(-22,-2,13,7,'#4a8a4a');px2(9,-2,13,7,'#4a8a4a');px2(-26,-3,5,9,'#4a8a4a');px2(21,-3,5,9,'#4a8a4a');px2(-10,-18,20,18,'#4a8a4a');px2(-7,-12,5,5,'#cc2200');px2(2,-12,5,5,'#cc2200');px2(-6,-11,3,3,'#ff4400');px2(3,-11,3,3,'#ff4400');ctx.fillStyle='#1a1a1a';ctx.fillRect(-6,-5,12,3);ctx.fillStyle='#cc0000';ctx.fillRect(-4,-5,2,3);ctx.fillRect(0,-5,2,3);ctx.fillRect(4,-5,2,3);px2(-10,-19,20,3,'#1a1a1a');if(hat){px2(-4,-26,8,3,'#e67e22');px2(-6,-24,12,3,'#e67e22');px2(-3,-28,6,3,'#fff');px2(-2,-30,4,3,'#e67e22');}drawZHPbar(hp,maxHp);ctx.restore();}
function drawZombieB(sx,sy,sz,hp,maxHp,tick){ctx.save();ctx.translate(sx,sy);const s=sz/14;ctx.scale(s,s);const bob=Math.sin((tick||0)*.09)*2;ctx.translate(0,bob);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,19,9,3,0,0,Math.PI*2);ctx.fill();px2(-6,6,5,12,'#3d5a3d');px2(1,6,5,12,'#3d5a3d');px2(-8,16,7,4,'#222');px2(1,16,7,4,'#222');px2(-8,-2,16,10,'#c0392b');px2(-16,-1,9,6,'#4a8a4a');px2(7,-1,9,6,'#4a8a4a');px2(-10,-16,18,16,'#4a8a4a');px2(-6,-10,4,4,'#ff2200');px2(2,-10,4,4,'#ff2200');ctx.fillStyle='#111';ctx.fillRect(-5,-4,10,3);px2(-10,-17,18,3,'#222');drawZHPbar(hp,maxHp);ctx.restore();}
function drawZombieC(sx,sy,sz,hp,maxHp,tick){ctx.save();ctx.translate(sx,sy);const s=sz/22;ctx.scale(s,s);const bob=Math.sin((tick||0)*.05)*2;ctx.translate(0,bob);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,24,16,5,0,0,Math.PI*2);ctx.fill();px2(-12,10,10,16,'#2e5a2e');px2(2,10,10,16,'#2e5a2e');px2(-14,24,12,6,'#111');px2(2,24,12,6,'#111');px2(-14,-4,28,16,'#2e4a2e');px2(-24,-3,11,9,'#3a7a3a');px2(13,-3,11,9,'#3a7a3a');px2(-13,-22,26,20,'#3a7a3a');px2(-8,-14,6,6,'#cc2200');px2(2,-14,6,6,'#cc2200');ctx.fillStyle='#111';ctx.fillRect(-7,-4,14,4);px2(-13,-23,26,4,'#1a1a1a');drawZHPbar(hp,maxHp);ctx.restore();}
function drawZHPbar(hp,maxHp){if(hp>=maxHp)return;const bw=36;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(-bw/2,22,bw,5);ctx.fillStyle='#f7c948';ctx.fillRect(-bw/2,22,bw*(hp/maxHp),5);}
function drawBoss(sx,sy,hp,maxHp,tick,slamAnim){ctx.save();ctx.translate(sx,sy);const bob=Math.sin((tick||0)*.07)*2;ctx.translate(0,bob);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,42,28,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.ellipse(0,5,28,30,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1a4a1a';ctx.lineWidth=2;ctx.stroke();px2(-20,28,16,20,'#2a5a2a');px2(4,28,16,20,'#2a5a2a');px2(-22,46,18,8,'#1a1a1a');px2(4,46,18,8,'#1a1a1a');ctx.fillStyle='rgba(100,180,100,.18)';ctx.beginPath();ctx.ellipse(-5,-2,14,16,-.3,0,Math.PI*2);ctx.fill();px2(-38,-2,18,10,'#2e6b2e');px2(-44,-4,10,14,'#3a8a3a');ctx.save();ctx.translate(30,0);ctx.rotate(slamAnim>0?-0.8+slamAnim*1.5:-0.3);px2(0,-4,12,28,'#3a8a3a');ctx.fillStyle='#5a3a1a';ctx.fillRect(-4,-34,20,36);ctx.fillStyle='#6b4a2a';ctx.fillRect(-8,-42,28,14);ctx.restore();ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.arc(0,-30,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1a4a1a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#cc0000';ctx.beginPath();ctx.arc(-8,-32,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(8,-32,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(-8,-32,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(8,-32,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-12,-22,24,5);ctx.fillStyle='#eee';[-8,-4,0,4,8].forEach(tx=>ctx.fillRect(tx,-22,3,5));px2(-22,-48,44,18,'#5a7a3a');px2(-18,-52,36,8,'#4a6a2a');px2(-14,-58,28,10,'#3a5a1a');const bw=90;ctx.fillStyle='rgba(0,0,0,.6)';rr(ctx,-bw/2,52,bw,9,3);ctx.fill();ctx.fillStyle='#c0392b';rr(ctx,-bw/2,52,bw*(hp/maxHp),9,3);ctx.fill();ctx.restore();}

function drawZombieD(sx,sy,sz,hp,maxHp,tick){
  ctx.save();ctx.translate(sx,sy);const s=sz/15;ctx.scale(s,s);
  const bob=Math.sin((tick||0)*.1)*2;ctx.translate(0,bob);
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,16,8,3,0,0,Math.PI*2);ctx.fill();
  px2(-5,5,5,10,'#8b4513');px2(0,5,5,10,'#8b4513');px2(-7,13,6,4,'#111');px2(1,13,6,4,'#111');
  px2(-8,-1,16,8,'#cc5500');px2(-12,0,5,5,'#e07020');px2(7,0,5,5,'#e07020');
  px2(-8,-14,16,14,'#e06000');px2(-5,-9,4,4,'#ff3300');px2(1,-9,4,4,'#ff3300');
  ctx.fillStyle='#111';ctx.fillRect(-5,-4,10,3);
  px2(-1,-17,2,5,'#f7c948');
  ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(0,-18,3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=`rgba(255,100,0,${0.35+Math.sin((tick||0)*.25)*.25})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();
  drawZHPbar(hp,maxHp);ctx.restore();
}

function drawZombieE(sx,sy,sz,hp,maxHp,tick){
  ctx.save();ctx.translate(sx,sy);const s=sz/20;ctx.scale(s,s);
  const bob=Math.sin((tick||0)*.05)*1.5;ctx.translate(0,bob);
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,22,11,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5a0080';ctx.beginPath();ctx.moveTo(-12,20);ctx.lineTo(-10,-2);ctx.lineTo(10,-2);ctx.lineTo(12,20);ctx.closePath();ctx.fill();
  px2(-20,0,12,6,'#3a7a3a');px2(8,0,12,6,'#3a7a3a');
  ctx.fillStyle='rgba(50,255,80,.7)';ctx.beginPath();ctx.arc(-22,3,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(22,3,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a6b3a';ctx.beginPath();ctx.arc(0,-14,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a0055';ctx.beginPath();ctx.arc(0,-16,13,Math.PI,0);ctx.fill();
  px2(-6,-10,4,4,'#cc00ff');px2(2,-10,4,4,'#cc00ff');
  ctx.fillStyle='#111';ctx.fillRect(-5,-5,10,3);
  ctx.strokeStyle=`rgba(50,200,80,${0.2+Math.sin((tick||0)*.15)*.18})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.stroke();
  drawZHPbar(hp,maxHp);ctx.restore();
}

function drawZombieF(sx,sy,sz,hp,maxHp,tick){
  ctx.save();ctx.translate(sx,sy);const s=sz/30;ctx.scale(s,s);
  const bob=Math.sin((tick||0)*.04)*3;ctx.translate(0,bob);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,32,22,6,0,0,Math.PI*2);ctx.fill();
  px2(-16,14,13,22,'#1e4a1e');px2(3,14,13,22,'#1e4a1e');px2(-20,34,14,8,'#111');px2(6,34,14,8,'#111');
  ctx.fillStyle='#1a4a1a';ctx.beginPath();ctx.ellipse(0,2,22,20,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a4a4a';ctx.beginPath();ctx.ellipse(0,0,18,14,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2a2a2a';ctx.lineWidth=2;ctx.stroke();
  [[-10,-5],[0,-8],[10,-5],[-10,5],[0,8],[10,5]].forEach(([bx,by])=>{ctx.fillStyle='#777';ctx.beginPath();ctx.arc(bx,by,2,0,Math.PI*2);ctx.fill();});
  px2(-32,-4,16,10,'#1a4a1a');px2(16,-4,16,10,'#1a4a1a');px2(-38,-5,8,14,'#2a6a2a');px2(30,-5,8,14,'#2a6a2a');
  ctx.fillStyle='#1a4a1a';ctx.beginPath();ctx.arc(0,-22,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.beginPath();ctx.arc(0,-24,19,Math.PI,0);ctx.fill();
  ctx.fillStyle='#ff2200';ctx.beginPath();ctx.arc(-8,-24,7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(8,-24,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(-8,-24,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(8,-24,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#111';ctx.fillRect(-12,-18,24,6);ctx.fillStyle='#eee';[-8,-4,0,4,8].forEach(tx=>ctx.fillRect(tx,-18,3,5));
  const bw=60;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(-bw/2,36,bw,7);
  ctx.fillStyle=hp/maxHp>.5?'#27ae60':hp/maxHp>.25?'#f39c12':'#c0392b';ctx.fillRect(-bw/2,36,bw*(hp/maxHp),7);
  ctx.restore();
}

function drawHUD(){
  ctx.fillStyle='rgba(5,8,18,.82)';rr(ctx,W/2-250,8,500,36,8);ctx.fill();
  ctx.font='bold 13px Nunito';ctx.textAlign='center';
  const w=curWpn();
  ctx.fillStyle='#c0392b';ctx.fillText('❤ '+Math.max(0,Math.round(G.playerHp))+'/'+G.playerMaxHp,W/2-180,31);
  ctx.fillStyle='#7ecff7';ctx.fillText('Welle '+G.wave,W/2-65,31);
  // Level timer progress bar (thin bar under main HUD)
  if(!G.isMP){
    const lvlDef=LEVELS.find(l=>l.id===selectedLevel)||LEVELS[0];
    const prog=Math.min(1,levelTimer/lvlDef.survivalGoal);
    const barW=200,barX=W/2-barW/2;
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(barX,46,barW,4);
    ctx.fillStyle=levelGoalReached?'#27ae60':'#f7c948';ctx.fillRect(barX,46,barW*prog,4);
    if(!levelGoalReached){
      const remaining=Math.max(0,lvlDef.survivalGoal-Math.floor(levelTimer));
      ctx.fillStyle='rgba(200,200,200,.5)';ctx.font='9px Nunito';ctx.textAlign='center';
      ctx.fillText('Ziel: '+Math.floor(remaining/60)+'m'+('0'+(remaining%60)).slice(-2)+'s',W/2,56);
    }
  }
  ctx.fillStyle='#27ae60';ctx.fillText('☠ '+G.kills,W/2+40,31);
  ctx.fillStyle='#f7c948';ctx.fillText('🪙 '+G.earnedCoins,W/2+135,31);
  const secs=Math.floor(G.gameTime/60);ctx.fillStyle='#9db4c8';ctx.fillText('⏱ '+Math.floor(secs/60)+':'+(secs%60).toString().padStart(2,'0'),W/2+225,31);
  if(w){ctx.fillStyle='rgba(5,8,18,.82)';rr(ctx,W-172,8,160,50,8);ctx.fill();ctx.fillStyle='#f7c948';ctx.font='bold 11px Nunito';ctx.textAlign='left';ctx.fillText(w.icon+' '+w.name,W-162,25);if(w.id==='minigun'){if(w.cooling){ctx.fillStyle='#e74c3c';ctx.fillText('COOLDOWN',W-162,42);}else{ctx.fillStyle='#aaa';ctx.fillText('∞',W-162,42);}}else if(w.reloading){ctx.fillStyle='#e67e22';ctx.fillText('LADEN '+(((1-w.reloadTimer/w.reloadTime)*100)|0)+'%',W-162,42);}else{ctx.fillStyle=w.ammo<=w.maxAmmo*.25?'#e74c3c':'#aaa';ctx.fillText(w.ammo==='999'||w.ammo===999?'∞':w.ammo+'/'+w.maxAmmo,W-162,42);}}
  if(G.bossWarn>0&&Math.floor(G.bossWarn/8)%2===0){document.getElementById('boss-warn').style.display='block';}else{document.getElementById('boss-warn').style.display='none';}
  const tgt=nearestEnemy(G.px,G.py,(curWpn()||{range:300}).range||300);if(tgt){const tsx=tgt.x-G.camX,tsy=tgt.y-G.camY;ctx.strokeStyle='rgba(247,80,50,.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(mouse.x,mouse.y);ctx.lineTo(tsx,tsy);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(247,80,50,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(tsx,tsy,tgt.size+6,0,Math.PI*2);ctx.stroke();}
  ctx.strokeStyle='rgba(247,201,72,.9)';ctx.lineWidth=1.5;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(mouse.x-10,mouse.y);ctx.lineTo(mouse.x-4,mouse.y);ctx.stroke();ctx.beginPath();ctx.moveTo(mouse.x+4,mouse.y);ctx.lineTo(mouse.x+10,mouse.y);ctx.stroke();ctx.beginPath();ctx.moveTo(mouse.x,mouse.y-10);ctx.lineTo(mouse.x,mouse.y-4);ctx.stroke();ctx.beginPath();ctx.moveTo(mouse.x,mouse.y+4);ctx.lineTo(mouse.x,mouse.y+10);ctx.stroke();ctx.strokeStyle='rgba(247,201,72,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(mouse.x,mouse.y,5,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(150,170,190,.45)';ctx.font='10px Nunito';ctx.textAlign='left';ctx.fillText('[ESC] Pause  [R] Reload  [1-8] Waffe  [Shift] Dash',8,H-8);
  document.getElementById('ab-name').textContent=currentUser?.username||'';
  document.getElementById('ab-coins').textContent=(G.earnedCoins||0)+(currentUser?.coins||0);
}
