const bg = document.getElementById('bg');
const screen = document.getElementById('screen');
const ghost = document.getElementById('ghost');
const dynamic = document.getElementById('dynamic');
const tapHint = document.getElementById('tapHint');
const startBtn = document.getElementById('startBtn');

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
  try { a.volume = vol; a.currentTime = 0; a.play().catch(()=>{}); } catch(e) {}
}
function stop(a) { try { a.pause(); a.currentTime = 0; } catch(e) {} }
function stopRings(){ stop(audio.normal); stop(audio.breath); }
function setImage(src, cls='scene') {
  bg.classList.remove('fade'); void bg.offsetWidth; bg.src = src; bg.classList.add('fade');
  screen.className = 'screen ' + cls;
  dynamic.classList.add('hidden');
  ghost.classList.add('hidden'); ghost.classList.remove('show');
  [...screen.querySelectorAll('.hotspot:not(#startBtn)')].forEach(el=>el.remove());
  startBtn.style.display = 'none';
  tapHint.style.display = 'none';
}
function hotspot(name, fn){
  const b=document.createElement('button'); b.className='hotspot '+name; b.setAttribute('aria-label', name); b.onclick=fn; screen.appendChild(b);
}
function showDynamic(lines, choices, speaker='旁白') {
  dynamic.classList.remove('hidden');
  dynamic.innerHTML = `<div class="dialogue"><div class="speaker">${speaker}</div><p>${lines.join('<br>')}</p></div><div class="choices">${choices.map(c=>`<button class="choiceBtn" data-k="${c.k}">${c.t}</button>`).join('')}</div>`;
  dynamic.querySelectorAll('button').forEach((btn,i)=>btn.onclick=choices[i].fn);
}

function startGame(){
  score = { curiosity: 0, avoid: 0, observe: 0 };
  safePlay(audio.bgm, .32);
  scene1();
}
function scene1(){
  stage='scene1';
  setImage('assets/images/scene-call-01.jpg','scene scene1');
  safePlay(audio.normal, .45);
  hotspot('choice1',()=>{ score.curiosity++; scene2(); });
  hotspot('choice2',()=>{ score.avoid++; scene2(); });
  hotspot('choice3',()=>{ score.observe++; scene2(); });
}
function scene2(){
  stage='scene2';
  setImage('assets/images/scene-call-02-closeup.jpg','scene scene2');
  stop(audio.normal); safePlay(audio.breath, .42);
  hotspot('choice1',()=>{ score.curiosity++; jumpScene(); });
  hotspot('choice2',()=>{ score.observe++; jumpScene(); });
  hotspot('choice3',()=>{ score.avoid++; jumpScene(); });
}
function jumpScene(){
  stage='jump';
  setImage('assets/images/scene-jumpscare-base.jpg','scene jumpbase');
  stopRings();
  setTimeout(()=>{ triggerGhost(); }, 1400);
}
function triggerGhost(){
  safePlay(audio.jump, .85);
  const flash = document.createElement('div'); flash.className='flash'; screen.appendChild(flash); setTimeout(()=>flash.remove(),450);
  ghost.classList.remove('hidden'); ghost.classList.add('show');
  setTimeout(()=>{
    showDynamic(['我就在你旁邊。'],[
      {t:'回頭看', k:'curiosity', fn:()=>{ score.curiosity++; endRoute(); }},
      {t:'衝去開燈', k:'observe', fn:()=>{ score.observe++; endRoute(); }},
      {t:'掛電話', k:'avoid', fn:()=>{ score.avoid++; endRoute(); }},
    ], '？？？');
  }, 900);
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
    dynamic.innerHTML = `<div class="choices"><button class="restartBtn" style="grid-column: 1 / span 3">重新開始</button></div>`;
    dynamic.querySelector('button').onclick = reset;
  }, 350);
}
function reset(){
  stopRings(); stop(audio.mirror); stop(audio.notify);
  bg.src='assets/images/cover-start.jpg';
  screen.className='screen cover';
  dynamic.classList.add('hidden');
  ghost.classList.add('hidden'); ghost.classList.remove('show');
  [...screen.querySelectorAll('.hotspot:not(#startBtn)')].forEach(el=>el.remove());
  startBtn.style.display='block'; tapHint.style.display='block';
}

startBtn.onclick = startGame;
