const D=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const PAL=['#1a6dff','#00b4d8','#8b5cf6','#ec4899','#f97316','#10b981','#eab308','#ef4444'];
const fa=n=>typeof n==='string'?n.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]):Number(n).toLocaleString('fa-IR');
const $=id=>document.getElementById(id);
const todayI=(new Date().getDay()+1)%7;let sel=todayI,data={};
try{data=JSON.parse(localStorage.getItem('plan')||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem('plan',JSON.stringify(data))}catch(e){}};
// theme (default: night)
let th='dark';try{th=localStorage.getItem('theme')||'dark'}catch(e){}
const TH=[['light','روز','linear-gradient(135deg,#fff,#7ab8ff)'],['dark','شب','linear-gradient(135deg,#0a2252,#1a6dff)'],['neon','نئون','linear-gradient(135deg,#b24bff,#ff3dcf)'],['sunset','غروب','linear-gradient(135deg,#ff6a3d,#ffb02e)']];
const TC={light:'#eaf3ff',dark:'#050d22',neon:'#0b0618',sunset:'#1f0a1d'};
function mark(t){document.querySelectorAll('.tdot').forEach(b=>b.classList.toggle('on',b.dataset.t===t));const m=document.querySelector('meta[name=theme-color]');m&&m.setAttribute('content',TC[t])}
function setTh(t){th=t;document.documentElement.dataset.theme=t;mark(t);try{localStorage.setItem('theme',t)}catch(e){}}
$('themes').innerHTML=TH.map(x=>`<button class="tdot" data-t="${x[0]}" title="${x[1]}" style="background:${x[2]}"></button>`).join('');
$('themes').onclick=e=>{const b=e.target.closest('.tdot');if(b)setTh(b.dataset.t)};
if(!TC[th])th='dark';setTh(th);
// greeting
const dateTxt=new Date().toLocaleDateString('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const left=(data[todayI]||[]).filter(t=>!t.done).length;
const sub=$('sub');sub.className='sub hello';
sub.innerHTML='درود امین، خوش برگشتی 👋<br><em></em>';
sub.querySelector('em').textContent=left?`بیا که کلی کار مونده! (${fa(left)} کار)`:'امروز هیچ کاری نموند 🎉';
setTimeout(()=>{sub.classList.add('hide');setTimeout(()=>{sub.className='sub hide';sub.textContent=dateTxt;requestAnimationFrame(()=>sub.classList.remove('hide'))},650)},20000);
// helpers
const find=id=>{for(const d in data){const t=(data[d]||[]).find(x=>x.id==id);if(t)return{t,d:+d}}return null};
const rc=p=>`hsl(${Math.round(p*1.2)} 88% 50%)`;
let shown=0,raf;
function paint(v){const r=$('ring');r.style.setProperty('--p',v);r.style.setProperty('--rc',rc(v));$('pct').textContent=fa(Math.round(v))+'٪'}
function animRing(to){cancelAnimationFrame(raf);const from=shown,t0=performance.now(),dur=1400;
  const step=n=>{const k=Math.min(1,(n-t0)/dur),e=1-Math.pow(1-k,3);shown=from+(to-from)*e;paint(shown);if(k<1)raf=requestAnimationFrame(step);else shown=to};
  raf=requestAnimationFrame(step)}
function render(){
  const tasks=(data[sel]||[]).slice().sort((a,b)=>a.time.localeCompare(b.time));
  $('days').innerHTML=D.map((d,i)=>`<button class="day ${i==sel?'active':''} ${i==todayI?'today':''}" data-i="${i}"><b>${d}</b><small>${fa((data[i]||[]).length)} کار</small></button>`).join('');
  $('dayTitle').textContent='برنامه‌ی '+D[sel];
  const L=$('list');L.innerHTML='';
  if(!tasks.length)L.innerHTML='<div class="empty">هنوز کاری برای این روز نداری 🌤️</div>';
  tasks.forEach(t=>{
    const el=document.createElement('div');el.className='task'+(t.done?' done':'');el.style.setProperty('--c',t.c||PAL[0]);el.dataset.o=t.id;
    el.innerHTML='<button class="chk" data-c="1"></button><span class="time"></span><span class="t"></span><span class="note"></span><button class="del" data-d="1">✕</button>';
    el.querySelector('.chk').textContent=t.done?'✓':'';
    el.querySelector('.time').textContent=fa(t.time);
    el.querySelector('.t').textContent=t.t;
    el.querySelector('.note').textContent=t.d?'📝':'';
    L.appendChild(el);
  });
  const done=tasks.filter(t=>t.done).length,p=tasks.length?Math.round(done/tasks.length*100):0;
  animRing(p);$('ptitle').textContent='پیشرفت '+D[sel]+(sel===todayI?' (امروز)':'');$('rsub').textContent=fa(done)+'/'+fa(tasks.length)+' کار';
  $('week').innerHTML=D.map((d,i)=>{const l=data[i]||[];return `<div class="week"><span>${d}</span><i>${fa(l.filter(t=>t.done).length)} / ${fa(l.length)}</i></div>`}).join('');
}
$('days').onclick=e=>{const b=e.target.closest('.day');if(b){sel=+b.dataset.i;render()}};
(()=>{const d=$('days');let down=false,sx=0,sl=0,moved=false;
  d.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=d.scrollLeft});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;d.scrollLeft=sl-dx});
  window.addEventListener('pointerup',()=>{down=false});
  d.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true);
  d.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){d.scrollLeft-=e.deltaY;e.preventDefault()}},{passive:false});
})();
$('f').onsubmit=e=>{e.preventDefault();const f=e.target;(data[sel]=data[sel]||[]).push({id:Date.now(),time:f.time.value,t:f.t.value.trim(),c:f.c.value,d:'',done:false});save();f.t.value='';f.time.value='';f.c.value=PAL[Math.floor(Math.random()*PAL.length)];render()};
$('f').c.value=PAL[Math.floor(Math.random()*PAL.length)];
$('list').onclick=e=>{const el=e.target.closest('.task');if(!el)return;const id=el.dataset.o;
  if(e.target.closest('[data-c]')){const x=find(id);x.t.done=!x.t.done;save();render()}
  else if(e.target.closest('[data-d]')){data[sel]=data[sel].filter(x=>x.id!=id);save();render()}
  else location.hash='t-'+id};
// detail page (#t-ID)
let cur=null;
function route(){
  const m=location.hash.match(/^#t-(\d+)$/),x=m&&find(m[1]);
  if(!x){cur=null;$('detail').style.display='none';$('home').style.display='block';render();return}
  cur=x;$('home').style.display='none';$('detail').style.display='block';
  $('dday').textContent=D[x.d];$('dt').value=x.t.t;$('dtime').value=x.t.time;$('dc').value=x.t.c||PAL[0];$('dd').value=x.t.d||'';
  $('ddone').textContent=x.t.done?'↩ برگردوندن به انجام‌نشده':'✓ انجام شد';
  alLbl();window.scrollTo(0,0);
}
const upd=(k,v)=>{if(cur){cur.t[k]=v;save()}};
$('dt').oninput=e=>upd('t',e.target.value);
$('dtime').oninput=e=>upd('time',e.target.value);
$('dc').oninput=e=>upd('c',e.target.value);
$('dd').oninput=e=>upd('d',e.target.value);
$('ddone').onclick=()=>{if(cur){cur.t.done=!cur.t.done;save();route()}};
$('ddel').onclick=()=>{if(cur){data[cur.d]=data[cur.d].filter(x=>x!==cur.t);save();location.hash=''}};
$('back').onclick=()=>{if(cur)sel=cur.d;location.hash=''};
window.addEventListener('hashchange',route);
// money
const CUR=[['IRT','تومان'],['USD','دلار'],['USDT','تتر'],['CNY','یوان'],['IQD','دینار عراق'],['RUB','روبل'],['QAR','ریال قطر'],['AED','درهم امارات'],['TRY','لیر ترکیه']];
const CN=Object.fromEntries(CUR);
let M={e:{},r:{}};try{M=JSON.parse(localStorage.getItem('money'))||M}catch(e){}
M.e=M.e||{};M.r=M.r||{};
const saveM=()=>{try{localStorage.setItem('money',JSON.stringify(M))}catch(e){}};
let mOff=0,mType='e';
const dkey=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const nf=n=>Number(n).toLocaleString('fa-IR',{maximumFractionDigits:2});
const en=v=>parseFloat(String(v).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[,٬]/g,'').replace('٫','.'))||0;
function renderM(){
  const L=M.e[dkey(mOff)]||[];
  $('mdate').textContent=mOff===0?'امروز':new Date(Date.now()+mOff*864e5).toLocaleDateString('fa-IR',{weekday:'long',month:'long',day:'numeric'});
  let inc=0,exp=0;const miss={},cur={};
  L.forEach(x=>{const rt=x.c==='IRT'?1:(+M.r[x.c]||0);(cur[x.c]=cur[x.c]||{i:0,e:0})[x.k]+=x.a;
    if(rt){if(x.k==='i')inc+=x.a*rt;else exp+=x.a*rt}else miss[x.c]=1});
  const net=inc-exp;
  $('mbig').style.setProperty('--mc',net>=0?'#22c55e':'#ef4444');
  $('mnet').textContent=(net>0?'+':'')+nf(net)+' تومان';$('minc').textContent=nf(inc);$('mexp').textContent=nf(exp);
  const parts=Object.keys(cur).filter(c=>c!=='IRT'||Object.keys(cur).length>1).map(c=>CN[c]+': '+nf(cur[c].i-cur[c].e));
  const mk=Object.keys(miss).map(c=>CN[c]);
  $('mcur').textContent=(parts.length?'به تفکیک ارز → '+parts.join(' | '):'')+(mk.length?(parts.length?'\n':'')+'⚠️ نرخ تبدیل '+mk.join('، ')+' رو بزن تا تو جمع بالا حساب بشه.':'');
  $('mcur').style.whiteSpace='pre-line';
  const ML=$('mlist');ML.innerHTML='';
  if(!L.length)ML.innerHTML='<div class="empty" style="padding:14px 0">هنوز چیزی ثبت نشده</div>';
  L.forEach(x=>{const el=document.createElement('div');el.className='mi';el.style.setProperty('--ic',x.k==='i'?'#22c55e':'#ef4444');
    el.innerHTML='<span class="r"></span><b class="a"></b><button class="del" data-id="'+x.id+'" style="color:var(--muted)">✕</button>';
    el.querySelector('.r').textContent=x.r;el.querySelector('.a').textContent=(x.k==='i'?'+':'−')+nf(x.a)+' '+CN[x.c];ML.appendChild(el)});
}
$('mc').innerHTML=CUR.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('');
$('rates').innerHTML=CUR.slice(1).map(c=>`<div class="rr"><span>۱ ${c[1]} =</span><input data-c="${c[0]}" inputmode="decimal" placeholder="چند تومان؟" value="${M.r[c[0]]||''}"></div>`).join('');
$('rates').oninput=e=>{const i=e.target;if(!i.dataset.c)return;M.r[i.dataset.c]=en(i.value);saveM();renderM()};
$('mprev').onclick=()=>{mOff--;renderM()};$('mnext').onclick=()=>{mOff++;renderM()};
$('mt').onclick=e=>{const b=e.target.closest('.mt');if(!b)return;mType=b.dataset.k;document.querySelectorAll('.mt').forEach(x=>x.classList.toggle('on',x===b))};
$('mf').onsubmit=e=>{e.preventDefault();const f=e.target,a=en(f.a.value);if(!(a>0))return;
  const k=dkey(mOff);(M.e[k]=M.e[k]||[]).push({id:Date.now(),k:mType,r:f.r.value.trim(),a,c:f.c.value});saveM();f.r.value='';f.a.value='';renderM()};
$('mlist').onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;const k=dkey(mOff);M.e[k]=(M.e[k]||[]).filter(x=>x.id!=b.dataset.id);saveM();renderM()};
renderM();
// alarms
let alarmOn=true;try{alarmOn=localStorage.getItem('alarm')!=='0'}catch(e){}
const bellUp=()=>{$('bell').textContent=alarmOn?'🔔':'🔕'};bellUp();
$('bell').onclick=()=>{alarmOn=!alarmOn;try{localStorage.setItem('alarm',alarmOn?'1':'0')}catch(e){}
  if(alarmOn&&window.Notification&&Notification.permission==='default')Notification.requestPermission();bellUp()};
let ac,beepT,snT,ringing=null;
document.addEventListener('pointerdown',()=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}});
function beep(){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=880;g.gain.value=.25;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.3)}
function notify(t){try{if(!window.Notification||Notification.permission!=='granted')return;const o={body:'وقتشه!',vibrate:[400,200,400],requireInteraction:true,tag:'a'+t.id};
  (navigator.serviceWorker?navigator.serviceWorker.getRegistration():Promise.resolve()).then(r=>r?r.showNotification('⏰ '+t.t,o):new Notification('⏰ '+t.t,o)).catch(()=>{})}catch(e){}}
function ring(t){stopRing();ringing=t;$('alt').textContent=t.t;$('alm').style.display='flex';
  const go=()=>{beep();try{navigator.vibrate&&navigator.vibrate([400,200,400])}catch(e){}};go();beepT=setInterval(go,1000);notify(t)}
function stopRing(){clearInterval(beepT);$('alm').style.display='none'}
$('astop').onclick=()=>{stopRing();ringing=null};
$('asn').onclick=()=>{const t=ringing;stopRing();ringing=null;clearTimeout(snT);snT=setTimeout(()=>t&&ring(t),300000)};
const fired={};
setInterval(()=>{if(!alarmOn)return;const n=new Date(),nm=n.getHours()*60+n.getMinutes(),k=n.toDateString();
  (data[(n.getDay()+1)%7]||[]).forEach(t=>{const [h,m]=t.time.split(':'),d=nm-(+h*60+ +m);
    if(!t.done&&t.a!==false&&d>=0&&d<=2&&fired[t.id]!==k){fired[t.id]=k;ring(t)}})},4000);
function alLbl(){if(cur)$('dal').textContent=cur.t.a===false?'🔕 هشدار خاموش':'🔔 هشدار روشن'}
$('dal').onclick=()=>{if(cur){cur.t.a=cur.t.a===false;save();alLbl()}};
$('dphone').onclick=()=>{if(!cur)return;
  if(!/Android/i.test(navigator.userAgent)){alert('این دکمه فقط روی گوشی اندروید کار می‌کنه.');return}
  const [h,m]=cur.t.time.split(':');
  location.href='intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR='+(+h)+';i.android.intent.extra.alarm.MINUTES='+(+m)+';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(cur.t.t)+';end'};
if('serviceWorker' in navigator&&location.protocol==='https:'){navigator.serviceWorker.register('sw.js').catch(()=>{})}
route();
