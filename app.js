function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const w=document.createElement('div');w.className='confetti';const C=['#f7931a','#b35500','#ffd9a6','#17804f','#2a2118'];for(let i=0;i<40;i++){const p=document.createElement('i');p.style.cssText=`left:${Math.random()*100}%;background:${C[i%5]};animation-delay:${Math.random()*.3}s;--x:${(Math.random()-.5)*160}px;--r:${Math.random()*720}deg`;w.appendChild(p)}document.body.appendChild(w);setTimeout(()=>w.remove(),2200)}
const $=id=>document.getElementById(id),enc=new TextEncoder();
async function sha(s){const b=await crypto.subtle.digest('SHA-256',enc.encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
// nav
const chs=[...document.querySelectorAll('.ch')];let cur=0;const seen=new Set();
chs.forEach((c,i)=>{const s=document.createElement('span');s.title=(i+1)+' '+c.dataset.t;s.innerHTML='<b>'+(i+1)+'</b><i>'+c.dataset.t+'</i>';s.onclick=()=>go(i);$('prog').append(s)});
function go(i){cur=Math.max(0,Math.min(chs.length-1,i));seen.add(cur);if(!$('app').hidden)try{localStorage.setItem('sw-btc',JSON.stringify({cur,seen:[...seen]}))}catch(e){}if(cur==chs.length-1)confetti();chs.forEach((c,j)=>c.classList.toggle('on',j==cur));[...$('prog').children].forEach((s,j)=>{s.className=j==cur?'on':seen.has(j)?'seen':''});$('prev').disabled=cur==0;$('next').style.visibility=cur==chs.length-1?'hidden':'visible';$('pos').textContent=(cur+1)+' / '+chs.length;scrollTo(0,0)}
$('prev').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);$('again').onclick=()=>go(0);let SAVED;try{SAVED=JSON.parse(localStorage.getItem('sw-btc'))}catch(e){}go(0);
$('start').onclick=()=>{$('hero').hidden=true;$('app').hidden=false;go(0)};
(()=>{const d=SAVED;if(!d||!(d.cur>0))return;const r=$('resume');r.hidden=false;r.textContent='▶ 続きから('+chs[d.cur].dataset.t+')';(d.seen||[]).forEach(j=>seen.add(j));r.onclick=()=>{$('hero').hidden=true;$('app').hidden=false;go(d.cur)}})();
(()=>{let n=0;const c=document.querySelector('.hero .coin');c.onclick=()=>{if(++n%5==0){c.classList.remove('spin');void c.offsetWidth;c.classList.add('spin');confetti()}}})();
const U='https://lokuyow.github.io/sawatte-wakaru-bitcoin/';
$('share').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('「さわってわかるビットコイン」8章ぜんぶクリアしました!ハッシュもマイニングも署名も、さわってみると意外とわかります ₿')+'&url='+encodeURIComponent(U);
// quizzes
const Q=[['試してみよう: 「。」を1個足したら、ハッシュはどうなる?',['ちょっとだけ変わる','まったく別のものになる','変わらない'],1,'1文字でも変わると、指紋はほぼ全部入れかわります。だから改ざんがすぐバレます。'],
['ブロック#1のデータを書きかえたら、こわれるのはどこ?',['ブロック#1だけ','#1より前ぜんぶ','#1の次から後ろぜんぶ'],2,'#1のハッシュが変わるので、それを「前のハッシュ」として持っている#2以降がつながらなくなります。'],
['むずかしさを3→4にしたら、だいたい何倍たいへん?',['2倍','16倍','4倍'],1,'ハッシュは16進数(0〜9とa〜fの16種類の文字)で書かれています。先頭の1文字が0になる確率は1/16なので、0を1個増やすと約16倍です。'],
['署名を確かめるのに必要なのはどれ?',['公開鍵','秘密鍵','パスワード'],0,'確認は公開鍵だけでできます。秘密鍵は署名する本人だけが持っておくものです。'],
['アリスが5コインを、ボブとキャロルに同時に5コインずつ送ろうとしたら?',['両方とおる','先に記録された方だけとおる','両方はじかれる'],1,'みんなの台帳で先に記録された方が有効です。2つ目は「もう持っていない」のではじかれます。'],
['発行されるビットコインの合計は?',['無限に増える','ぴったり2100万BTCを超える','2100万BTC少し手前で止まる'],2,'報酬が半分ずつになっていくから、合計は2100万BTCにじわじわ近づいて止まります。']];
Q.push(['秘密鍵が他人に当てられないいちばんの理由は?',['ひみつの計算式で作るから','組み合わせが数えきれないほど多いから','銀行が守っているから'],1,'秘密鍵はただのランダムな数。でも組み合わせが約10の77乗通りもあるので、総当たりでは当てられません。']);const QI=[0,1,2,3,5,6,4];
Q.forEach(([q,o,k,e],i)=>{i=QI[i];const d=document.createElement('div');d.className='quiz';d.innerHTML=`<h3>💡 1問クイズ</h3><p>${q}</p><div class="opts">${o.map((x,j)=>`<button data-j="${j}">${x}</button>`).join('')}</div><div class="ans" hidden></div>`;chs[i].append(d);
d.querySelectorAll('button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.j==k;b.classList.add(ok?'right':'wrong');if(!ok)b.classList.add('shake');else{d.querySelectorAll('button').forEach(x=>x.disabled=x!=b);const a=d.querySelector('.ans');a.hidden=false;a.textContent='⭕ せいかい! '+e}})});
// hash flip render
function flipTo(el,h,old){el.innerHTML=[...h].map((c,i)=>`<span${old&&old[i]!=c?' class="flip"':''}>${c}</span>`).join('')}
// 1 hash
let lastH='';async function h1(){const t=$('hIn').value;const a=await sha(t);flipTo($('hOut'),a,lastH);lastH=a;const t2=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');const b=await sha(t2);$('hOut2').innerHTML=[...b].map((c,i)=>c==a[i]?c:'<i>'+c+'</i>').join('');let d=0;for(let i=0;i<64;i++)if(a[i]!=b[i])d++;$('hDiff').textContent=`↑「${t2}」のハッシュ(緑が変わった文字): 64文字中 ${d}文字ちがいます!`}
$('hIn').oninput=h1;$('hTweak').onclick=()=>{const t=$('hIn').value;$('hIn').value=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');h1()};h1();
// 2 chain (notebook analogy)
const init=['アリス→ボブ 2コイン','ボブ→キャロル 1コイン','キャロル→デイブ 1コイン','デイブ→アリス 3コイン'];let data=[...init],prevs=[],fixing=false;const Z='0'.repeat(64);
const fp=h=>`<span class="fp" style="--c:hsl(${parseInt(h.slice(0,4),16)%360} 70% 45%)">${h.slice(0,6)}</span>`;
async function hashes(){const hs=[];for(let i=0;i<data.length;i++)hs.push(await sha(i+prevs[i]+data[i]));return hs}
async function seal(){prevs=[Z];for(let i=0;i<data.length;i++){const h=await sha(i+prevs[i]+data[i]);prevs.push(h)}prevs.length=data.length}
let good=[],repaired=false;
async function chain(build){const el=$('chain');const hs=await hashes();
if(build){el.innerHTML=data.map((d,i)=>`${i?`<div class="link" id="l${i}"><span>↓</span><small>指紋を引きつぐ</small></div>`:''}<div class="blk" id="b${i}"><div class="bh"><b>ページ #${i}</b><span class="st"></span></div><input data-i="${i}" aria-label="ページ${i}の中身"><div class="fps"><div><small>前のページの指紋</small><span class="pv"></span></div><div><small>このページの指紋</small><span class="hh"></span></div></div></div>`).join('');
el.querySelectorAll('input').forEach(n=>{n.value=data[n.dataset.i];n.oninput=()=>{repaired=false;data[n.dataset.i]=n.value;chain()}})}
let broken=-1;hs.forEach((h,i)=>{if(broken<0&&h!==good[i])broken=i});
hs.forEach((h,i)=>{const b=$('b'+i),was=b.className;const st=broken<0||i<broken?'':i==broken?'edit':'bad';
b.className='blk'+(st?' '+st:'');if(st&&was!=b.className){b.style.animationDelay=(i-broken)*0.15+'s';b.classList.add('shake')}
b.querySelector('.pv').innerHTML=i?fp(prevs[i]):'<span class="fp z">なし</span>';b.querySelector('.hh').innerHTML=fp(h);
b.querySelector('.st').textContent=st=='edit'?'✏️ 書きかえた':st=='bad'?'❌ ハンコが合わない':'✅ OK';
if(i){const l=$('l'+i),bad=broken>=0&&i>broken;l.className='link'+(bad?' bad':'');l.querySelector('span').textContent=bad?'≠':'↓';l.querySelector('small').textContent=bad?(i==broken+1?'前の指紋と一致しない!':'その先も信用できない'):'指紋を引きつぐ'}});
const li=[...$('cSteps').children];const step=fixing?2:broken<0?(repaired?3:0):1;li.forEach((x,j)=>x.className=j<step?'done':j==step?'on':'');
$('cFix').hidden=broken<0;}
$('cFix').onclick=async()=>{fixing=true;$('cFix').disabled=true;const hs=await hashes();let from=hs.findIndex((h,i)=>h!==good[i]);
for(let i=from;i<data.length;i++){$('b'+i).querySelector('.st').textContent='⛏ 計算中…';await new Promise(r=>setTimeout(r,500));prevs[i]=i?await sha((i-1)+prevs[i-1]+data[i-1]):Z;good[i]=await sha(i+prevs[i]+data[i]);await chain()}
fixing=false;repaired=true;$('cFix').disabled=false;await chain();$('cTake').innerHTML='💡 直せました。でも本物のビットコインでは、1ページごとに大量のマイニングが必要です。そのうえ世界中が先へ先へと書き足しているので、追いついて全部やり直すのは現実的ではありません。'};
$('cReset').onclick=async()=>{repaired=false;data=[...init];await seal();good=await hashes();$('cTake').innerHTML='💡 1か所でも書きかえると、その先のハンコが全部合わなくなる。だから昔の記録はこっそり変えられません。';chain(true)};
(async()=>{await seal();good=await hashes();chain(true)})();
// 3 mining (small async batches so the UI stays responsive)
const fmtT=s=>s<60?s.toFixed(1)+'秒':s<3600?Math.floor(s/60)+'分'+Math.floor(s%60)+'秒':(s/3600).toFixed(1)+'時間';let mining=false,stopReq=false,rate=1e5;
function dUp(){const n=+$('diff').value,e=16**n;$('dV').textContent=n;$('mExp').textContent=e.toLocaleString();const w=$('mWarn');w.hidden=n<5;w.textContent=`⏳ このむずかしさだと、この端末では平均${fmtT(e/rate)}くらいかかりそうです。途中でストップもできます。`}
$('diff').oninput=dUp;dUp();
$('mStop').onclick=()=>stopReq=true;
$('mGo').onclick=async()=>{if(mining)return;mining=true;stopReq=false;$('mGo').hidden=true;$('mStop').hidden=false;$('diff').disabled=true;$('mHash').className='hash';const n=+$('diff').value,z='0'.repeat(n);let nonce=0,h,found=false;const t0=performance.now();
const ui=()=>{const s=(performance.now()-t0)/1000;$('mNonce').textContent=nonce;$('mTry').textContent=(nonce+1).toLocaleString();$('mTime').textContent=fmtT(s);if(s>.3){rate=nonce/s;$('mRate').textContent=Math.round(rate).toLocaleString()}};
while(!stopReq){const tb=performance.now();while(performance.now()-tb<12){h=await sha('ブロック#5 アリス→ボブ'+nonce);if(h.startsWith(z)){found=true;break}nonce++}if(found)break;ui();$('mHash').textContent=h;await new Promise(r=>setTimeout(r))}
ui();if(found){$('mHash').innerHTML='<i>'+z+'</i>'+h.slice(n)+'<br>見つけた!';$('mHash').className='hash found burst';confetti()}else $('mHash').textContent='ストップしました('+(nonce).toLocaleString()+'回ためして、まだ当たりなし)';
mining=false;$('mGo').hidden=false;$('mStop').hidden=true;$('diff').disabled=false;dUp()};
// 4 sig
let kp,sig,signed;const alg={name:'ECDSA',namedCurve:'P-256'},sa={name:'ECDSA',hash:'SHA-256'};
$('sKey').onclick=async()=>{kp=await crypto.subtle.generateKey(alg,true,['sign','verify']);$('sPub').textContent='公開鍵(みんなに見せてOK): '+hex(await crypto.subtle.exportKey('raw',kp.publicKey)).slice(0,48)+'…  秘密鍵: 🔒アリスだけが持っている(表示しません)';sig=null;$('sSig').textContent='';$('sRes').textContent=''};
$('sSign').onclick=async()=>{if(!kp)await $('sKey').onclick();signed=$('sMsg').value;sig=await crypto.subtle.sign(sa,kp.privateKey,enc.encode(signed));$('sSig').textContent='署名: '+hex(sig).slice(0,48)+'…';$('sCheck').value=signed;$('sRes').textContent=''};
$('sVer').onclick=async()=>{if(!sig){$('sRes').textContent='先に署名してください';return}const ok=await crypto.subtle.verify(sa,kp.publicKey,sig,enc.encode($('sCheck').value));$('sRes').innerHTML=ok?'<span style="color:var(--ok)">✅ 本物!アリスの署名です</span>':'<span style="color:var(--ng)">❌ 確認失敗!中身が書きかえられています</span>'};
// 5 ledger
const ppl=[['アリス','👩'],['ボブ','👨'],['キャロル','👧'],['デイブ','🧔']];let bal={アリス:5,ボブ:2,キャロル:0,デイブ:1};
function rp(){$('people').innerHTML=ppl.map(([n,e])=>`<div class="p">${e}<div>${n}<br><b>${bal[n]}</b> コイン</div></div>`).join('')}
['tFrom','tTo'].forEach((s,k)=>$(s).innerHTML=ppl.map(([n],i)=>`<option ${i==k?'selected':''}>${n}</option>`).join(''));
function tx(f,t,a){const li=document.createElement('li');if(f==t||!(a>0)){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}: おかしな取引です`}else if(bal[f]<a){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}コイン: 台帳を見たら${f}は${bal[f]}コインしか持っていません。却下!`}else{bal[f]-=a;bal[t]+=a;li.className='ok';li.textContent=`✅ ${f}→${t} ${a}コイン: みんなで確認してOK。台帳に記録しました`}$('log').prepend(li);rp();if(li.className=='ng')document.querySelectorAll('.p')[ppl.findIndex(p=>p[0]==f)]&&document.querySelectorAll(".p")[ppl.findIndex(p=>p[0]==f)].classList.add('bump')}
$('tSend').onclick=()=>tx($('tFrom').value,$('tTo').value,+$('tAmt').value);
$('tDouble').onclick=()=>{const a=bal['アリス'];if(!a){tx('アリス','ボブ',1);return}tx('アリス','ボブ',a);tx('アリス','キャロル',a)};rp();
// 6 halving
function hv(){const h=+$('hgt').value,n=Math.floor(h/210000);let r=n<64?Math.floor(5e9/2**n):0,s=0;for(let i=0;i<=n&&i<64;i++){const sat=Math.floor(5e9/2**i),blocks=i<n?210000:h-i*210000+1;s+=sat*blocks}
$('hH').textContent=h.toLocaleString();$('hN').textContent=n;$('hR').textContent=(r/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hS').textContent=(s/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hBar').style.width=(s/2.1e15*100)+'%'}
$('hgt').oninput=hv;hv();
// bonus game: spot the fake transactions
(()=>{const N=['アリス','ボブ','キャロル'],E={アリス:'👩',ボブ:'👨',キャロル:'👧'};let B,q,i,score,t,tl,spent,res;
const draw=()=>$('gBal').innerHTML=N.map(n=>`<div><span>${E[n]}</span>${n}<b>${B[n]}</b></div>`).join('');
function mk(){const r=Math.random(),f=N[Math.floor(Math.random()*3)],to=N.filter(x=>x!=f)[Math.floor(Math.random()*2)];
if(r<.45&&B[f]>0)return{f,to,a:1+Math.floor(Math.random()*B[f]),sig:true,ok:true};
if(r<.65)return{f,to,a:B[f]+1+Math.floor(Math.random()*3),sig:true,ok:false,why:`${f}は${B[f]}コインしか持っていません`};
if(r<.82&&spent)return{...spent,to:N.find(x=>x!=spent.f&&x!=spent.to),sig:true,ok:false,dbl:true,why:'さっき使ったのと同じコインです(二重払い)'};
const a=Math.max(1,Math.min(B[f],2));return{f,to,a,sig:false,ok:false,why:'署名が公開鍵と一致しません'}}
function show(){if(i>=8)return end();q=mk();tl=8;$('gStage').innerHTML=`<div class="gq">${i+1} / 8 ・ スコア ${score}</div><div class="tx"><div class="tx-m">${E[q.f]} ${q.f} → ${E[q.to]} ${q.to}</div><div class="tx-a">${q.a} コイン</div><div class="tx-s">署名チェック: ${q.sig?'<span class="g">✓ 一致</span>':'<span class="r">✗ 不一致</span>'}${q.dbl?'<br><small>使うコイン: さっきと同じ「コイン#'+q.id+'」</small>':'<br><small>使うコイン: 新しい「コイン#'+(q.id=100+i)+'」</small>'}</div><div class="timer"><div id="gT"></div></div></div><div class="gbtn"><button id="gNo" class="no">✗ 却下</button><button id="gYes" class="yes">✓ 承認</button></div><div id="gMsg" class="gmsg"></div>`;
$('gYes').onclick=()=>ans(true);$('gNo').onclick=()=>ans(false);clearInterval(t);t=setInterval(()=>{tl-=.1;const g=$('gT');if(g)g.style.width=tl/8*100+'%';if(tl<=0)ans(null)},100)}
function ans(y){clearInterval(t);const right=y===q.ok;if(right)score++;if(q.ok){B[q.f]-=q.a;B[q.to]+=q.a;spent={...q}}draw();
res.push(right);const m=$('gMsg');$('gYes').disabled=$('gNo').disabled=true;m.className='gmsg '+(right?'g':'r');m.textContent=(y===null?'⏰ 時間切れ! ':right?'⭕ せいかい! ':'❌ ざんねん! ')+(q.ok?'正しい取引です。台帳に記録しました。':q.why+'。');
document.querySelector('.tx').classList.add(right?'pass':'shake');i++;setTimeout(show,1500)}
function end(){$('gStage').innerHTML='';const e=$('gEnd');e.hidden=false;const rank=score==8?'伝説のノード':score>=6?'頼れるノード':score>=4?'見習いノード':'まだまだこれから';
if(score>=6)confetti();e.innerHTML=`<div class="gscore">${score}<small> / 8</small></div><p class="c"><b>${rank}</b></p><div class="note"><b>このゲームでわかったこと</b><br>ビットコインでは、世界中のノードがあなたと同じように「残高は足りる?」「署名は本人のもの?」「同じコインを2回使っていない?」を1件ずつチェックしています。ひとつでもおかしな取引は、誰が送ってきてもブロックに入れてもらえません。</div><div class="share"><a class="btn x" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`「ニセ取引を見破れ!」で ${score}/8 点、${rank}でした ₿ #さわってわかるビットコイン`)}&url=${encodeURIComponent(U)}">𝕏 でスコアをシェア</a><button id="gAgain" class="ghost">もう一回あそぶ</button></div>`;$('gAgain').onclick=start}
function start(){B={アリス:5,ボブ:3,キャロル:2};i=0;score=0;spent=null;res=[];$('gEnd').hidden=true;draw();show()}
B={アリス:5,ボブ:3,キャロル:2};draw();$('gStart').onclick=start})();

// entropy chapter
(()=>{const g=$('eGrid');const flip=()=>{const r=crypto.getRandomValues(new Uint8Array(32));let bits='';r.forEach(x=>bits+=x.toString(2).padStart(8,'0'));g.innerHTML=[...bits].map((b,i)=>`<span class="b${b}" style="animation-delay:${i*3}ms">${b}</span>`).join('');g.classList.add('on')};
flip();$('eFlip').onclick=flip;
let rate=5e6,run=0;const big=(n)=>{const e=Math.floor(Math.log10(n));return e<6?Math.round(n).toLocaleString():`約10<sup>${e}</sup>`};
const dur=s=>{const y=s/31557600;if(s<1)return '一瞬';if(s<60)return Math.round(s)+'秒';if(s<3600)return Math.round(s/60)+'分';if(s<86400)return Math.round(s/3600)+'時間';if(y<1)return Math.round(s/86400)+'日';if(y<1e4)return Math.round(y).toLocaleString()+'年';const u=y/1.38e10;return u<1?big(y)+'年':`宇宙の年齢の${big(u)}倍`};
const rows=()=>$('eRows').innerHTML=[8,16,24,32,64,128,256].map(b=>`<div${b==256?' class="hl"':''}><span>${b}ビット</span><span>${dur(2**b/2/rate)}</span><span>${dur(2**b/2/1e21)}</span></div>`).join('');rows();
document.querySelectorAll('#eBits button').forEach(btn=>btn.onclick=async()=>{const B=+btn.dataset.b,N=2**B,target=crypto.getRandomValues(new Uint32Array(1))[0]%N;const id=++run;
document.querySelectorAll('#eBits button').forEach(x=>x.classList.toggle('on',x==btn));$('eComb').innerHTML=big(N);$('eRes').textContent='さがし中…';const t0=performance.now();let k=0;
while(id==run){const tb=performance.now();while(performance.now()-tb<12){if(k==target)break;k++}const s=(performance.now()-t0)/1000;$('eTry').textContent=(k+1).toLocaleString();$('eTime').textContent=s.toFixed(1)+'秒';if(k==target){if(s>.05){rate=(k+1)/s;rows()}$('eRes').innerHTML=`<span style="color:var(--ok)">🎯 当たり! ${(k+1).toLocaleString()}回目</span>`;break}await new Promise(r=>setTimeout(r))}})})();
