// v1.3.6 – 修正：重力 dt 正規化、不自動清 LOG、開場強制隱藏 Stage Clear、偵錯面板防抖
const VERSION = (window.__APP_VERSION__ || "1.3.6");

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // ===== Logger =====
  const Logger = (() => {
    const BUF_MAX = 400, buf = [];
    const nowISO = () => new Date().toISOString();
    function push(level, evt, data) {
      const rec = { ts: nowISO(), level, evt };
      if (data && typeof data === 'object' && Object.keys(data).length) rec.data = data;
      buf.push(JSON.stringify(rec)); if (buf.length > BUF_MAX) buf.shift();
    }
    return {
      debug:(e,d)=>push('DEBUG',e,d), info:(e,d)=>push('INFO',e,d), warn:(e,d)=>push('WARN',e,d), error:(e,d)=>push('ERROR',e,d),
      lines:()=>buf.slice(), clear:()=>{ buf.length = 0; }
    };
  })();
  window.LOG = Logger;

  // LOG 工具列（只留 Copy/Clear）
  const logCopyBtn  = document.getElementById('log-copy');
  const logClearBtn = document.getElementById('log-clear');
  if (logCopyBtn) logCopyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(Logger.lines().join('\n')); } catch(_) {}
  });
  if (logClearBtn) logClearBtn.addEventListener('click', () => Logger.clear());

  // 版本膠囊
  function setVersionBadge(){
    const el = document.getElementById('version-pill');
    if (el) el.textContent = `v${VERSION}`;
  }

  // ===== 遊戲常數 & 狀態 =====
  const TILE=48, GRAVITY=0.88, FRICTION=0.8, MOVE_SPEED=0.7, MAX_RUN=5.2, JUMP_VEL=-17.8;
  const LEVEL_H=12, LEVEL_W=100;
  const level = Array.from({length:LEVEL_H},(_,y)=>{const r=Array.from({length:LEVEL_W},()=>0); if(y>=LEVEL_H-2) r.fill(1); return r;});
  for(let x=10;x<15;x++) level[8][x]=2;
  for(let x=20;x<23;x++) level[7][x]=2, level[8][x]=2;
  for(let x=30;x<36;x++) level[9][x]=2;
  for(let x=45;x<48;x++) level[6][x]=2;
  for(let x=70;x<76;x++) level[9][x]=2;
  const coins=new Set(); const addCoin=(cx,cy)=>{ level[cy][cx]=3; coins.add(`${cx},${cy}`); };
  addCoin(12,7); addCoin(21,6); addCoin(31,8); addCoin(33,8); addCoin(46,5); addCoin(72,8);

  const player={ x:3*TILE,y:6*TILE,w:28,h:40, vx:0,vy:0, onGround:false, facing:1 };
  const camera={ x:0,y:0 };
  const keys={ left:false,right:false,jump:false,action:false };

  // 緩衝/土狼
  let jumpBufferMs=0,coyoteMs=0; const JUMP_BUFFER_MAX=120,COYOTE_MAX=100;
  let dbgPress=0,dbgFired=0;

  // 偵錯 HUD 參照
  const dbg={
    fpsEl:document.getElementById('dbg-fps'),
    posEl:document.getElementById('dbg-pos'),
    velEl:document.getElementById('dbg-vel'),
    groundEl:document.getElementById('dbg-ground'),
    coyoteEl:document.getElementById('dbg-coyote'),
    bufferEl:document.getElementById('dbg-buffer'),
    keysEl:document.getElementById('dbg-keys'),
    pressEl:document.getElementById('dbg-press'),
    firedEl:document.getElementById('dbg-fired'),
  };
  let fpsLast=performance.now(), fpsCnt=0, fpsVal=0;
  function updFps(t){ fpsCnt++; if(t-fpsLast>=250){ const now=performance.now(); fpsVal=Math.round(1000*fpsCnt/(now-fpsLast)); fpsLast=now; fpsCnt=0; if(dbg.fpsEl) dbg.fpsEl.textContent=`${fpsVal}`; }}

  // Stage Clear 控制
  const clearLayer=document.getElementById('clear-layer');
  function hideStageClear(){ if(clearLayer) clearLayer.hidden=true; }
  function showStageClear(){ if(clearLayer) clearLayer.hidden=false; }
  let cleared=false;

  // 初始化與輸入
  canvas.setAttribute('tabindex','0');
  function refocus(e){ try{ if(e) e.preventDefault(); canvas.focus(); }catch(_){} }
  window.addEventListener('load', ()=>{ hideStageClear(); refocus(); setVersionBadge(); Logger.debug('stage_clear_hide'); Logger.info('app_start',{version:VERSION}); });
  window.addEventListener('pointerdown',(e)=>{ Logger.debug('pointerdown',{x:e.clientX,y:e.clientY}); refocus(e); },{passive:false});
  window.addEventListener('touchstart',(e)=>{ Logger.debug('touchstart',{points:e.touches?.length||0}); refocus(e); },{passive:false});
  window.addEventListener('keydown',(e)=>{
    const c=e.code||e.key;
    if(c==='Space'||c==='ArrowUp'||c==='ArrowDown'||c==='ArrowLeft'||c==='ArrowRight') e.preventDefault();
  },{passive:false});

  function pressJump(src){ jumpBufferMs=JUMP_BUFFER_MAX; keys.jump=true; dbgPress++; Logger.debug('jump_press',{src}); }
  function releaseJump(){ keys.jump=false; }

  window.addEventListener('keydown',(e)=>{
    const code=e.code||e.key;
    if(code==='ArrowLeft'){ e.preventDefault(); keys.left=true; }
    if(code==='ArrowRight'){ e.preventDefault(); keys.right=true; }
    if(code==='KeyZ' || code==='Space'){ e.preventDefault(); pressJump('kb'); }
    if(code==='KeyX'){ e.preventDefault(); keys.action=true; Logger.debug('action',{src:'kb'}); }
  },{passive:false});
  window.addEventListener('keyup',(e)=>{
    const code=e.code||e.key;
    if(code==='ArrowLeft') keys.left=false;
    if(code==='ArrowRight') keys.right=false;
    if(code==='KeyZ' || code==='Space') releaseJump();
    if(code==='KeyX') keys.action=false;
  });

  // 觸控鍵
  const btn=(id)=>document.getElementById(id);
  const bindHold=(el,prop)=>{
    if(!el) return;
    const on=()=>{ keys[prop]=true; el.classList.add('hold'); if(prop==='jump') pressJump('touch'); };
    const off=()=>{ if(prop==='jump') releaseJump(); keys[prop]=false; el.classList.remove('hold'); };
    const start=(e)=>{ e.preventDefault(); on(); };
    const end=(e)=>{ e.preventDefault(); off(); };
    el.addEventListener('pointerdown',start,{passive:false});
    el.addEventListener('pointerup',end,{passive:false});
    el.addEventListener('pointercancel',end,{passive:false});
    el.addEventListener('pointerleave',end,{passive:false});
    el.addEventListener('touchstart',(e)=>{ e.preventDefault(); on(); },{passive:false});
    el.addEventListener('touchend',(e)=>{ e.preventDefault(); off(); },{passive:false});
    el.addEventListener('touchcancel',(e)=>{ e.preventDefault(); off(); },{passive:false});
  };
  bindHold(btn('left'),'left');
  bindHold(btn('right'),'right');
  bindHold(btn('jump'),'jump');
  bindHold(btn('action'),'action');

  // 地圖工具
  const worldToTile=(px)=>Math.floor(px/TILE);
  const rectVsTileSolid=(x,y)=>{
    const tx=worldToTile(x), ty=worldToTile(y);
    if(ty<0||ty>=LEVEL_H||tx<0||tx>=LEVEL_W) return 0;
    const t=level[ty][tx]; return (t===1||t===2)?t:0;
  };

  function resolveCollisions(e){
    // 水平
    e.x+=e.vx;
    if(e.vx<0){
      const left=e.x-e.w/2, top=e.y-e.h/2+4, bottom=e.y+e.h/2-1;
      for(let y=top;y<=bottom;y+=TILE/2) if(rectVsTileSolid(left,y)){ e.x=Math.floor(left/TILE)*TILE+TILE+e.w/2+0.01; e.vx=0; break; }
    }
    if(e.vx>0){
      const right=e.x+e.w/2, top=e.y-e.h/2+4, bottom=e.y+e.h/2-1;
      for(let y=top;y<=bottom;y+=TILE/2) if(rectVsTileSolid(right,y)){ e.x=Math.floor(right/TILE)*TILE-e.w/2-0.01; e.vx=0; break; }
    }
    // 垂直
    e.y+=e.vy;
    const was=e.onGround; e.onGround=false;
    if(e.vy>0){
      const bottom=e.y+e.h/2, left=e.x-e.w/2+6, right=e.x+e.w/2-6;
      for(let x=left;x<=right;x+=TILE/2) if(rectVsTileSolid(x,bottom)){ e.y=Math.floor(bottom/TILE)*TILE-e.h/2-0.01; e.vy=0; e.onGround=true; break; }
    }else if(e.vy<0){
      const top=e.y-e.h/2, left=e.x-e.w/2+6, right=e.x+e.w/2-6;
      for(let x=left;x<=right;x+=TILE/2){
        const tx=worldToTile(x), ty=worldToTile(top);
        if(ty>=0 && level[ty][tx]===2){ level[ty][tx]=0; e.vy=2; Logger.info('brick_hit',{tx,ty}); coins.add(`${tx},${ty-1}`); level[ty-1][tx]=3; }
        if(rectVsTileSolid(x,top)){ e.y=Math.floor(top/TILE)*TILE+TILE+e.h/2+0.01; e.vy=0; break; }
      }
    }
    if(!was && e.onGround) Logger.debug('ground_enter',{y:e.y});
    if(was && !e.onGround) Logger.debug('ground_leave',{y:e.y});
  }

  // 分數 / 金幣
  let score=0; const scoreEl=document.getElementById('score');
  function collectCoins(e){
    const cx=worldToTile(e.x), cy=worldToTile(e.y);
    for(let y=cy-1;y<=cy+1;y++){
      for(let x=cx-1;x<=cx+1;x++){
        if(y<0||y>=LEVEL_H||x<0||x>=LEVEL_W) continue;
        if(level[y][x]===3){
          const rx=x*TILE+TILE/2, ry=y*TILE+TILE/2;
          if(Math.abs(e.x-rx)<26 && Math.abs(e.y-ry)<26){
            level[y][x]=0; coins.delete(`${x},{y}`);
            score+=10; if(scoreEl) scoreEl.textContent=score;
            e.vy=Math.min(e.vy,-3);
            Logger.info('coin_collect',{x,y,score});
          }
        }
      }
    }
  }

  function clampLeft(e){ const minX=e.w/2+0.01; if(e.x<minX){ e.x=minX; if(e.vx<0) e.vx=0; } }

  const GOAL_X=(LEVEL_W*TILE)-(2*TILE);

  // 迴圈
  let last=0;
  function loop(t){ const dt=Math.min(32,t-last); last=t; update(dt/16.6667); render(); updFps(t); requestAnimationFrame(loop); }

  function update(dt){
    const dtMs=dt*16.6667;
    if(!cleared){
      if(keys.left)  player.vx-=MOVE_SPEED*dt;
      if(keys.right) player.vx+=MOVE_SPEED*dt;
      player.vx=Math.max(Math.min(player.vx,MAX_RUN),-MAX_RUN);

      if(player.onGround) coyoteMs=COYOTE_MAX; else coyoteMs=Math.max(0,coyoteMs-dtMs);
      jumpBufferMs=Math.max(0,jumpBufferMs-dtMs);

      if(jumpBufferMs>0 && (player.onGround || coyoteMs>0)){
        player.vy=JUMP_VEL; player.onGround=false; jumpBufferMs=0; coyoteMs=0;
        dbgFired++; Logger.info('jump_fired',{vy:player.vy});
      }

      // ✅ 正確的重力（dt 已正規化，不能再乘 60）
      player.vy += GRAVITY * dt;
      if(player.vy>24) player.vy=24;

      if(player.onGround && !keys.left && !keys.right){ player.vx*=FRICTION; if(Math.abs(player.vx)<0.05) player.vx=0; }
      if(player.vx!==0) player.facing = player.vx>0?1:-1;

      resolveCollisions(player);
      clampLeft(player);
      collectCoins(player);

      if(player.x>GOAL_X){ cleared=true; showStageClear(); Logger.info('stage_clear',{score}); }
    }else{ player.vx*=0.9; player.vy*=0.9; }

    camera.x=Math.max(0,Math.min(player.x-canvas.width/2,LEVEL_W*TILE-canvas.width));
    camera.y=0;

    // 偵錯 HUD 每幀固定格式輸出（防抖）
    const f2=(n)=>Number(n).toFixed(2).padStart(6);
    const rd=(n)=>String(Math.round(n)).padStart(4);
    if(dbg.posEl)   dbg.posEl.textContent    = `${rd(player.x)}, ${rd(player.y)}`;
    if(dbg.velEl)   dbg.velEl.textContent    = `${f2(player.vx)}, ${f2(player.vy)}`;
    if(dbg.groundEl)dbg.groundEl.textContent = player.onGround?'✔':'—';
    if(dbg.coyoteEl)dbg.coyoteEl.textContent = String(Math.ceil(coyoteMs)).padStart(3);
    if(dbg.bufferEl)dbg.bufferEl.textContent = String(Math.ceil(jumpBufferMs)).padStart(3);
    const k = `${keys.left?'L':''}${keys.right?'R':''}${keys.jump?'/J':''}${keys.action?'/X':''}`;
    if(dbg.keysEl)  dbg.keysEl.textContent   = k || '—';
    if(dbg.pressEl) dbg.pressEl.textContent  = `${dbgPress}`;
    if(dbg.firedEl) dbg.firedEl.textContent  = `${dbgFired}`;
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<6;i++){ const cx=(i*300-(camera.x*0.4)%300); const cy=60+(i%2)*40; drawCloud(cx,cy); drawCloud(cx+150,cy+15); }
    ctx.save(); ctx.translate(-camera.x,-camera.y);
    for(let y=0;y<LEVEL_H;y++){ for(let x=0;x<LEVEL_W;x++){ const t=level[y][x]; const px=x*TILE, py=y*TILE;
      if(t===1) drawGround(px,py);
      if(t===2) drawBrick(px,py);
      if(t===3) drawCoin(px+TILE/2, py+TILE/2);
    }}
    drawPlayer(player);
    ctx.restore();
    ctx.fillStyle='#72bf53'; ctx.fillRect(0,canvas.height-28,canvas.width,28);
  }

  function drawGround(x,y){ ctx.fillStyle='#8b5a2b'; ctx.fillRect(x,y,TILE,TILE);
    ctx.fillStyle='#976939'; for(let i=0;i<2;i++) ctx.fillRect(x,y+i*24,TILE,2);
    ctx.fillStyle='#6b3f17'; ctx.fillRect(x,y+32,TILE,16); }
  function drawBrick(x,y){ ctx.fillStyle='#b84a2b'; ctx.fillRect(x,y,TILE,TILE);
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=2;
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) ctx.strokeRect(x+c*16+1,y+r*16+1,14,14); }
  function drawCoin(cx,cy){ ctx.save(); ctx.translate(cx,cy);
    const t=(performance.now()/200)%(Math.PI*2);
    const sx=Math.abs(Math.cos(t))*0.8+0.2; ctx.scale(sx,1);
    ctx.beginPath(); ctx.fillStyle='#ffd400'; ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffea80'; ctx.fillRect(-3,-6,6,12); ctx.restore(); }
  function drawCloud(x,y){ ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath();
    ctx.arc(x,y,24,0,Math.PI*2); ctx.arc(x+24,y+6,18,0,Math.PI*2); ctx.arc(x-24,y+6,18,0,Math.PI*2); ctx.fill(); }
  function drawPlayer(p){ const x=p.x,y=p.y; ctx.save(); ctx.translate(x,y); ctx.scale(p.facing,1);
    ctx.fillStyle='#3b3b3b'; ctx.fillRect(-12,18,10,8); ctx.fillRect(2,18,10,8);
    ctx.fillStyle='#e83f3f'; ctx.fillRect(-14,-8,28,24);
    ctx.fillStyle='#f0c090'; ctx.fillRect(-12,-28,24,20);
    ctx.fillStyle='#d22f2f'; ctx.fillRect(-12,-32,24,8); ctx.fillRect(-12,-32,26,4);
    ctx.fillStyle='#222'; ctx.fillRect(-4,-20,4,4); ctx.fillRect(2,-20,4,4);
    ctx.restore(); }

  requestAnimationFrame(loop);
})();
