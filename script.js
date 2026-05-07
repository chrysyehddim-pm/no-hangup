const bg = document.getElementById('bg');
const screen = document.getElementById('screen');
const ghost = document.getElementById('ghost');
const dynamic = document.getElementById('dynamic');
const tapHint = document.getElementById('tapHint');
const startBtn = document.getElementById('startBtn');
const coverUI = document.getElementById('coverUI');

const audio = {
  bgm: document.getElementById('bgm'),
  normal: document.getElementById('ringNormal'),
  breath: document.getElementById('ringBreath'),
  jump: document.getElementById('jump'),
  notify: document.getElementById('notify'),
  mirror: document.getElementById('mirror'),
};

let score = { curiosity: 0, avoid: 0, observe: 0 };
let stage = 'cover';

function safePlay(a, vol = 0.8) {
  try {
    a.volume = vol;
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch(e) {}
}
function stop(a) { try { a.pause(); a.currentTime = 0; } catch(e) {} }
function stopRings(){ stop(audio.normal); stop(audio.breath); }

function tryVibrate(pattern = [80, 40, 120]) {
  if (!('vibrate' in navigator)) return false;
  try {
    navigator.vibrate(pattern);
    return true;
  } catch (e) {
    return false;
  }
}
function clearTransientLayers(){
  screen.classList.remove('shake', 'extra-impact');
  screen.querySelectorAll('.flash,.glitch-layer,.bottom-fog,.scary-text,.scary-text-img').forEach(el => el.remove());
}
function setImage(src, cls='scene') {
  clearTransientLayers();
  bg.classList.remove('fade'); void bg.offsetWidth; bg.src = src; bg.classList.add('fade');
  screen.className = 'screen ' + cls;
  dynamic.classList.add('hidden');
  dynamic.classList.remove('jumpscare-ui');
  ghost.classList.add('hidden'); ghost.classList.remove('show');
  [...screen.querySelectorAll('.hotspot:not(#startBtn)')].forEach(el=>el.remove());
  coverUI.classList.add('hidden');
  tapHint.style.display = 'none';
}
function hotspot(name, fn){
  const b=document.createElement('button');
  b.className='hotspot '+name;
  b.setAttribute('aria-label', name);
  b.onclick=fn;
  screen.appendChild(b);
}
function showDynamic(lines, choices, speaker='旁白', opts = {}) {
  dynamic.classList.remove('hidden');
  dynamic.classList.toggle('jumpscare-ui', !!opts.jumpscare);
  const dialogueHTML = opts.hideDialogue ? '' : `<div class="dialogue"><div class="speaker">${speaker}</div><p>${lines.join('<br>')}</p></div>`;
  dynamic.innerHTML = `${dialogueHTML}<div class="choices">${choices.map(c=>`<button class="choiceBtn" data-k="${c.k || ''}">${c.t}</button>`).join('')}</div>`;
  dynamic.querySelectorAll('button').forEach((btn,i)=>btn.onclick=choices[i].fn);
}

function startGame(){
  score = { curiosity: 0, avoid: 0, observe: 0 };
  safePlay(audio.bgm, .30);
  scene1();
}
function scene1(){
  stage='scene1';
  setImage('assets/images/scene-call-01.jpg','scene scene1');
  safePlay(audio.normal, .42);
  showDynamic(['電話沒有接通。','答鈴卻沒有停止。'], [
    {t:'繼續聽', k:'curiosity', fn:()=>{ score.curiosity++; scene2(); }},
    {t:'掛掉', k:'avoid', fn:()=>{ score.avoid++; scene2(); }},
    {t:'開擴音', k:'observe', fn:()=>{ score.observe++; scene2(); }},
  ]);
}
function scene2(){
  stage='scene2';
  setImage('assets/images/scene-call-02-closeup.jpg','scene scene2');
  stop(audio.normal); safePlay(audio.breath, .40);
  showDynamic(['有人，在答鈴裡呼吸。','那聲音，越來越近。'], [
    {t:'靠近聽', k:'curiosity', fn:()=>{ score.curiosity++; jumpScene(); }},
    {t:'看號碼', k:'observe', fn:()=>{ score.observe++; jumpScene(); }},
    {t:'掛斷', k:'avoid', fn:()=>{ score.avoid++; jumpScene(); }},
  ]);
}
function jumpScene(){
  stage='jump';
  setImage('assets/images/scene-jumpscare-base.jpg','scene jumpbase');
  stopRings();
  showDynamic(['你聽見一個聲音。','那不是從手機裡傳來的。'], []);
  setTimeout(()=>{ triggerGhost(); }, 1200);
}
function addGlitch(){
  const glitch = document.createElement('div');
  glitch.className = 'glitch-layer show';
  screen.appendChild(glitch);
}
function addFog(){
  const fog = document.createElement('div');
  fog.className = 'bottom-fog';
  screen.appendChild(fog);
}
function addScaryText(){
  const msg = document.createElement('img');
  msg.className = 'scary-text-img show';
  msg.src = 'assets/images/scary-text-nearby.png';
  msg.alt = '我就在你身旁';
  screen.appendChild(msg);
}
function triggerGhost(){
  dynamic.classList.add('hidden');
  const vibrated = tryVibrate([80, 40, 120]);
  if (!vibrated) screen.classList.add('extra-impact');
  safePlay(audio.jump, .88);
  screen.classList.add('shake');
  const flash = document.createElement('div'); flash.className='flash'; screen.appendChild(flash); setTimeout(()=>flash.remove(),450);
  addGlitch();
  ghost.classList.remove('hidden'); ghost.classList.add('show');
  addFog();
  setTimeout(addScaryText, 520);
  setTimeout(()=>{
    showDynamic([], [
      {t:'立刻回頭', k:'curiosity', fn:()=>{ score.curiosity++; endRoute(); }},
      {t:'衝去開燈', k:'observe', fn:()=>{ score.observe++; endRoute(); }},
      {t:'直接掛斷', k:'avoid', fn:()=>{ score.avoid++; endRoute(); }},
    ], '', { jumpscare: true, hideDialogue: true });
  }, 920);
}
function endRoute(){
  stopRings();
  let ending='ending-03';
  if(score.observe >= score.curiosity && score.observe >= score.avoid) ending='ending-03';
  else if(score.curiosity >= score.avoid) ending='ending-01';
  else ending='ending-02';
  showEnding(ending);
}
function showEnding(id){
  stage=id;
  if(id==='ending-02') safePlay(audio.notify, .65);
  if(id==='ending-03') safePlay(audio.mirror, .45);
  setImage(`assets/images/${id}.jpg`, 'scene ending');
  setTimeout(()=>{
    dynamic.classList.remove('hidden');
    dynamic.innerHTML = `<div class="choices"><button class="restartBtn" style="grid-column: 1 / -1">重新開始</button></div>`;
    dynamic.querySelector('button').onclick = reset;
  }, 350);
}
function reset(){
  stopRings(); stop(audio.mirror); stop(audio.notify); stop(audio.jump);
  clearTransientLayers();
  bg.src='assets/images/cover-start.jpg';
  screen.className='screen cover';
  dynamic.classList.add('hidden');
  dynamic.classList.remove('jumpscare-ui');
  ghost.classList.add('hidden'); ghost.classList.remove('show');
  [...screen.querySelectorAll('.hotspot:not(#startBtn)')].forEach(el=>el.remove());
  coverUI.classList.remove('hidden'); tapHint.style.display='block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

startBtn.onclick = startGame;
