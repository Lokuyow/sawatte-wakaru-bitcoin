const EN=document.documentElement.lang=='en',L=(j,e)=>EN?e:j,NM={アリス:'Alice',ボブ:'Bob',キャロル:'Carol',デイブ:'Dave'},nm=n=>EN?NM[n]||n:n;
if(EN){document.getElementById('hIn').value='Hello Bitcoin';document.getElementById('sMsg').value='Alice pays Bob 1 BTC'}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const w=document.createElement('div');w.className='confetti';const C=['#f7931a','#b35500','#ffd9a6','#17804f','#2a2118'];for(let i=0;i<40;i++){const p=document.createElement('i');p.style.cssText=`left:${Math.random()*100}%;background:${C[i%5]};animation-delay:${Math.random()*.3}s;--x:${(Math.random()-.5)*160}px;--r:${Math.random()*720}deg`;w.appendChild(p)}document.body.appendChild(w);setTimeout(()=>w.remove(),2200)}
const $=id=>document.getElementById(id),enc=new TextEncoder();
async function sha(s){const b=await crypto.subtle.digest('SHA-256',enc.encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
// nav
const chs=[...document.querySelectorAll('.ch')];let cur=0;const seen=new Set();
const PT=[['👋','はじめに'],['1','お金の持ち主'],['2','記録のしくみ'],['3','お金のルール'],['🎮','ゲーム'],['4','総まとめ']],TT=x=>window.T?T(x):x,mq=matchMedia('(min-width:1024px)');
const pts=PT.map((p,k)=>{const w=document.createElement('div');w.className='pt';const h=document.createElement('button');h.type='button';h.className='ph';const nm=(/\d/.test(p[0])?L('ステージ','Stage ')+p[0]+' ':'')+TT(p[1]);h.title=nm;h.innerHTML=`<b>${p[0]}</b><i>${p[1]}</i><small></small>`;h.setAttribute('aria-expanded','false');const c=document.createElement('div');c.className='pc';w.append(h,c);$('prog').append(w);h.onclick=()=>{if(!mq.matches||!w.classList.contains('on')&&!w.classList.contains('open'))go(chs.findIndex(x=>x.dataset.p==k));else{w.classList.toggle('open');h.setAttribute('aria-expanded',w.classList.contains('open'))}};return{w,h,c,nm}});
chs.forEach((c,i)=>{const s=document.createElement('span');const em=c.querySelector('h2 em'),n=em?em.textContent:'·';if(n=='🎮')s.dataset.gm=1;s.title=n+' '+c.dataset.t;s.innerHTML='<b>'+(n=='🎮'?'🎮':n.replace(/^\d-/,''))+'</b><i>'+c.dataset.t+'</i>';s.onclick=()=>go(i);s.tabIndex=0;s.onkeydown=e=>{if(e.key=='Enter')go(i)};pts[+c.dataset.p].c.append(s)});
function go(i){cur=Math.max(0,Math.min(chs.length-1,i));seen.add(cur);if(!$('app').hidden)try{localStorage.setItem('sw-btc2',JSON.stringify({cur:chs[cur].dataset.t,seen:[...seen].map(j=>chs[j].dataset.t)}))}catch(e){}if(cur==chs.length-1)confetti();chs.forEach((c,j)=>c.classList.toggle('on',j==cur));const cp=+chs[cur].dataset.p;pts.forEach((p,k)=>{const ids=chs.map((c,j)=>+c.dataset.p==k?j:-1).filter(j=>j>=0),dn=ids.filter(j=>seen.has(j)).length;p.w.className='pt'+(k==cp?' on open':dn==ids.length?' seen':'');p.w.style.setProperty('--f',k==cp?(ids.indexOf(cur)+1)/ids.length:dn==ids.length?1:0);p.h.querySelector('small').textContent=ids.length>1?dn+'/'+ids.length:'';p.h.setAttribute('aria-expanded',k==cp);p.h.toggleAttribute('aria-current',k==cp)});chs.forEach((c,j)=>{const sp=pts[+c.dataset.p].c.children[[...chs].filter(x=>x.dataset.p==c.dataset.p).indexOf(c)];sp.className=(j==cur?'on':seen.has(j)?'seen':'')+(sp.dataset.gm?' gm':'')});{const ids=chs.filter(c=>+c.dataset.p==cp);$('pcap').textContent=pts[cp].nm+(ids.length>1?'  '+(ids.indexOf(chs[cur])+1)+' / '+ids.length:'')}$('prev').disabled=cur==0;$('next').style.visibility=cur==chs.length-1?'hidden':'visible';{const ids=chs.filter(c=>c.dataset.p==chs[cur].dataset.p);$('pos').textContent=ids.length>1?(ids.indexOf(chs[cur])+1)+' / '+ids.length:''}scrollTo(0,0)}
$('prev').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);$('again').onclick=()=>go(0);let SAVED;try{const ix=t=>chs.findIndex(c=>c.dataset.t==t);let d=JSON.parse(localStorage.getItem('sw-btc2'));if(d)SAVED={cur:ix(d.cur),seen:(d.seen||[]).map(ix).filter(j=>j>=0)};else{const o=JSON.parse(localStorage.getItem('sw-btc'));if(o){const U=['はじめに','ハッシュ','チェーン','マイニング','署名','鍵の強さ','台帳','手数料','半減期','ライトニング','ゲーム','ニセ取引','マイニング競争','51%攻撃','全体の流れ','まとめ'],T0=U.filter(x=>x!='ゲーム'),Q=[o.cur,...(o.seen||[])].some(j=>j==15)?U:T0,m=j=>ix(Q[j]);SAVED={cur:m(o.cur),seen:(o.seen||[]).map(m).filter(j=>j>=0)}}}if(SAVED&&!(SAVED.cur>=0))SAVED.cur=0}catch(e){SAVED=null}go(0);
$('start').onclick=()=>{$('hero').hidden=true;$('app').hidden=false;go(0)};
(()=>{const d=SAVED;if(!d||!(d.cur>0))return;const r=$('resume');r.hidden=false;r.textContent=L('▶ 続きから('+chs[d.cur].dataset.t+')','▶ Continue ('+(window.T?T(chs[d.cur].dataset.t):chs[d.cur].dataset.t)+')');(d.seen||[]).forEach(j=>seen.add(j));r.onclick=()=>{$('hero').hidden=true;$('app').hidden=false;go(d.cur)}})();
(()=>{let n=0;const c=document.querySelector('.hero .coin');c.onclick=()=>{if(++n%5==0){c.classList.remove('spin');void c.offsetWidth;c.classList.add('spin');confetti()}}})();
const U='https://lokuyow.github.io/sawatte-wakaru-bitcoin/';
$('share').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(L('「さわってわかるビットコイン」4つのステージと3つのゲームをぜんぶクリアしました!ハッシュもマイニングも署名も、さわってみると意外とわかります ₿','I finished all 4 stages and 3 games of “Touch & Learn Bitcoin”! Hashing, mining and signatures make sense once you try them ₿'))+'&url='+encodeURIComponent(U);
// quizzes
const Q=[['試してみよう: 「。」を1個足したら、ハッシュはどうなる?',['ちょっとだけ変わる','まったく別のものになる','変わらない'],1,'1文字でも変わると、指紋はほぼ全部入れかわります。だから改ざんがすぐバレます。'],
['ブロック#1のデータを書きかえたら、こわれるのはどこ?',['ブロック#1だけ','#1より前ぜんぶ','#1の次から後ろぜんぶ'],2,'#1のハッシュが変わるので、それを「前のハッシュ」として持っている#2以降がつながらなくなります。'],
['むずかしさを3→4にしたら、だいたい何倍たいへん?',['2倍','16倍','4倍'],1,'ハッシュは16進数(0〜9とa〜fの16種類の文字)で書かれています。先頭の1文字が0になる確率は1/16なので、0を1個増やすと約16倍です。'],
['署名を確かめるのに必要なのはどれ?',['公開鍵','秘密鍵','パスワード'],0,'確認は公開鍵だけでできます。秘密鍵は署名する本人だけが持っておくものです。'],
['アリスが5コインを、ボブとキャロルに同時に5コインずつ送ろうとしたら?',['両方とおる','先に記録された方だけとおる','両方はじかれる'],1,'みんなの台帳で先に記録された方が有効です。2つ目は「もう持っていない」のではじかれます。'],
['発行されるビットコインの合計は?',['無限に増える','ぴったり2100万BTCを超える','2100万BTC少し手前で止まる'],2,'報酬が半分ずつになっていくから、合計は2100万BTCにじわじわ近づいて止まります。']];
Q.push(['秘密鍵が他人に当てられないいちばんの理由は?',['ひみつの計算式で作るから','組み合わせが数えきれないほど多いから','銀行が守っているから'],1,'秘密鍵はただのランダムな数。でも組み合わせが約10の77乗通りもあるので、総当たりでは当てられません。']);Q.push(['混んでいるとき、早くブロックに入れてもらうには?',['手数料を高くする','取引を何回も送る','金額を小さくする'],0,'マイナーは手数料の高い取引から順にブロックに入れます。'],['ライトニングで100回払ったら、ブロックに記録されるのは?',['100回','開く・閉じるの2回だけ','0回'],1,'チャンネルの中の支払いはブロックの外。記録されるのは開くときと閉じるときだけです。']);const QI=['ハッシュ','チェーン','マイニング','署名','台帳','半減期','鍵の強さ','手数料','ライトニング'].map(t=>chs.findIndex(c=>c.dataset.t==t));
Q.forEach(([q,o,k,e],i)=>{i=QI[i];const d=document.createElement('div');d.className='quiz';d.innerHTML=`<h3>💡 1問クイズ</h3><p>${q}</p><div class="opts">${o.map((x,j)=>`<button data-j="${j}">${x}</button>`).join('')}</div><div class="ans" hidden></div>`;chs[i].append(d);
d.querySelectorAll('button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.j==k;b.classList.add(ok?'right':'wrong');if(!ok)b.classList.add('shake');else{d.querySelectorAll('button').forEach(x=>x.disabled=x!=b);const a=d.querySelector('.ans');a.hidden=false;a.textContent=L('⭕ せいかい! ','⭕ Correct! ')+(window.T?T(e):e)}})});
// hash flip render
function flipTo(el,h,old){el.innerHTML=[...h].map((c,i)=>`<span${old&&old[i]!=c?' class="flip"':''}>${c}</span>`).join('')}
// 1 hash
let lastH='';async function h1(){const t=$('hIn').value;const a=await sha(t);flipTo($('hOut'),a,lastH);lastH=a;const t2=t.slice(0,-1)+(({ン:'ソ',ソ:'ン',n:'m',m:'n'})[t.slice(-1)]||(EN?'n':'ン'));const b=await sha(t2);$('hOut2').innerHTML=[...b].map((c,i)=>c==a[i]?c:'<i>'+c+'</i>').join('');let d=0;for(let i=0;i<64;i++)if(a[i]!=b[i])d++;$('hDiff').textContent=L(`↑「${t2}」のハッシュ(緑が変わった文字): 64文字中 ${d}文字ちがいます!`,`↑ Hash of “${t2}” (changed characters in green): ${d} of 64 characters differ!`)}
$('hIn').oninput=h1;$('hTweak').onclick=()=>{const t=$('hIn').value;$('hIn').value=t.slice(0,-1)+(({ン:'ソ',ソ:'ン',n:'m',m:'n'})[t.slice(-1)]||(EN?'n':'ン'));h1()};h1();
// 2 chain (notebook analogy)
const init=EN?['Alice→Bob 2 coins','Bob→Carol 1 coin','Carol→Dave 1 coin','Dave→Alice 3 coins']:['アリス→ボブ 2コイン','ボブ→キャロル 1コイン','キャロル→デイブ 1コイン','デイブ→アリス 3コイン'];let data=[...init],prevs=[],fixing=false;const Z='0'.repeat(64);
const fp=h=>`<span class="fp" style="--c:hsl(${parseInt(h.slice(0,4),16)%360} 70% 45%)">${h.slice(0,6)}</span>`;
async function hashes(){const hs=[];for(let i=0;i<data.length;i++)hs.push(await sha(i+prevs[i]+data[i]));return hs}
async function seal(){prevs=[Z];for(let i=0;i<data.length;i++){const h=await sha(i+prevs[i]+data[i]);prevs.push(h)}prevs.length=data.length}
let good=[],repaired=false;
async function chain(build){const el=$('chain');const hs=await hashes();
if(build){el.innerHTML=data.map((d,i)=>`${i?`<div class="link" id="l${i}"><span>↓</span><small>指紋を引きつぐ</small></div>`:''}<div class="blk" id="b${i}"><div class="bh"><b>${L("ページ","Page")} #${i}</b><span class="st"></span></div><input data-i="${i}" aria-label="${L(`ページ${i}の中身`,`Page ${i} contents`)}"><div class="fps"><div><small>前のページの指紋</small><span class="pv"></span></div><div><small>このページの指紋</small><span class="hh"></span></div></div></div>`).join('');
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
const fmtT=s=>EN?(s<60?s.toFixed(1)+' s':s<3600?Math.floor(s/60)+' min '+Math.floor(s%60)+' s':(s/3600).toFixed(1)+' h'):s<60?s.toFixed(1)+'秒':s<3600?Math.floor(s/60)+'分'+Math.floor(s%60)+'秒':(s/3600).toFixed(1)+'時間';let mining=false,stopReq=false,rate=1e5;
function dUp(){const n=+$('diff').value,e=16**n;$('dV').textContent=n;$('mExp').textContent=e.toLocaleString();const w=$('mWarn');w.hidden=n<5;w.textContent=L(`⏳ このむずかしさだと、この端末では平均${fmtT(e/rate)}くらいかかりそうです。途中でストップもできます。`,`⏳ At this difficulty, this device needs about ${fmtT(e/rate)} on average. You can stop anytime.`)}
$('diff').oninput=dUp;dUp();
$('mStop').onclick=()=>stopReq=true;
$('mGo').onclick=async()=>{if(mining)return;mining=true;stopReq=false;$('mGo').hidden=true;$('mStop').hidden=false;$('diff').disabled=true;$('mHash').className='hash';const n=+$('diff').value,z='0'.repeat(n);let nonce=0,h,found=false;const t0=performance.now();
const ui=()=>{const s=(performance.now()-t0)/1000;$('mNonce').textContent=nonce;$('mTry').textContent=(nonce+1).toLocaleString();$('mTime').textContent=fmtT(s);if(s>.3){rate=nonce/s;$('mRate').textContent=Math.round(rate).toLocaleString()}};
while(!stopReq){const tb=performance.now();while(performance.now()-tb<12){h=await sha('ブロック#5 アリス→ボブ'+nonce);if(h.startsWith(z)){found=true;break}nonce++}if(found)break;ui();$('mHash').textContent=h;await new Promise(r=>setTimeout(r))}
ui();if(found){const s=(performance.now()-t0)/1000;if(s<=.3)$('mRate').textContent=s>.01?Math.round((nonce+1)/s).toLocaleString():'一瞬';$('mHash').innerHTML='<i>'+z+'</i>'+h.slice(n)+'<br>'+L('見つけた!','Found it!');$('mHash').className='hash found burst';confetti()}else $('mHash').textContent=L('ストップしました('+(nonce).toLocaleString()+'回ためして、まだ当たりなし)','Stopped ('+(nonce).toLocaleString()+' tries, no winner yet)');
mining=false;$('mGo').hidden=false;$('mStop').hidden=true;$('diff').disabled=false;dUp()};
// 4 sig
let kp,sig,signed;const alg={name:'ECDSA',namedCurve:'P-256'},sa={name:'ECDSA',hash:'SHA-256'};
$('sKey').onclick=async()=>{kp=await crypto.subtle.generateKey(alg,true,['sign','verify']);$('sPub').textContent=L('公開鍵(みんなに見せてOK): ','Public key (OK to share): ')+hex(await crypto.subtle.exportKey('raw',kp.publicKey)).slice(0,48)+L('…  秘密鍵: 🔒アリスだけが持っている(表示しません)','…  Private key: 🔒 only Alice has it (not shown)');sig=null;$('sSig').textContent='';$('sRes').textContent=''};
$('sSign').onclick=async()=>{if(!kp)await $('sKey').onclick();signed=$('sMsg').value;sig=await crypto.subtle.sign(sa,kp.privateKey,enc.encode(signed));$('sSig').textContent=L('署名: ','Signature: ')+hex(sig).slice(0,48)+'…';$('sCheck').value=signed;$('sRes').textContent=''};
$('sVer').onclick=async()=>{if(!sig){$('sRes').textContent='先に署名してください';return}const ok=await crypto.subtle.verify(sa,kp.publicKey,sig,enc.encode($('sCheck').value));$('sRes').innerHTML=ok?'<span style="color:var(--ok)">✅ 本物!アリスの署名です</span>':'<span style="color:var(--ng)">❌ 確認失敗!中身が書きかえられています</span>'};
// 5 ledger
const ppl=[['アリス','👩'],['ボブ','👨'],['キャロル','👧'],['デイブ','🧔']];let bal={アリス:5,ボブ:2,キャロル:0,デイブ:1};
function rp(){$('people').innerHTML=ppl.map(([n,e])=>`<div class="p">${e}<div>${n}<br><b>${bal[n]}</b> コイン</div></div>`).join('')}
['tFrom','tTo'].forEach((s,k)=>$(s).innerHTML=ppl.map(([n],i)=>`<option value="${i}" ${i==k?'selected':''}>${nm(n)}</option>`).join(''));
function tx(f,t,a){const li=document.createElement('li');if(f==t||!(a>0)){li.className='ng';li.textContent=L(`❌ ${f}→${t} ${a}: おかしな取引です`,`❌ ${nm(f)}→${nm(t)} ${a}: invalid transaction`)}else if(bal[f]<a){li.className='ng';li.textContent=L(`❌ ${f}→${t} ${a}コイン: 台帳を見たら${f}は${bal[f]}コインしか持っていません。却下!`,`❌ ${nm(f)}→${nm(t)} ${a} coins: the ledger shows ${nm(f)} has only ${bal[f]}. Rejected!`)}else{bal[f]-=a;bal[t]+=a;li.className='ok';li.textContent=L(`✅ ${f}→${t} ${a}コイン: みんなで確認してOK。台帳に記録しました`,`✅ ${nm(f)}→${nm(t)} ${a} coins: verified by everyone and recorded`)}$('log').prepend(li);rp();if(li.className=='ng')document.querySelectorAll('.p')[ppl.findIndex(p=>p[0]==f)]&&document.querySelectorAll(".p")[ppl.findIndex(p=>p[0]==f)].classList.add('bump')}
$('tSend').onclick=()=>tx(ppl[$('tFrom').value][0],ppl[$('tTo').value][0],+$('tAmt').value);
$('tDouble').onclick=()=>{const a=bal['アリス'];if(!a){tx('アリス','ボブ',1);return}tx('アリス','ボブ',a);tx('アリス','キャロル',a)};rp();
// 6 halving
function hv(){const h=+$('hgt').value,n=Math.floor(h/210000);let r=n<64?Math.floor(5e9/2**n):0,s=0;for(let i=0;i<=n&&i<64;i++){const sat=Math.floor(5e9/2**i),blocks=i<n?210000:h-i*210000+1;s+=sat*blocks}
$('hH').textContent=h.toLocaleString();$('hN').textContent=n;$('hR').textContent=(r/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hS').textContent=(s/1e8).toLocaleString('ja',{maximumFractionDigits:8});drawC(h,s/1e8);$('hY').textContent=Math.round(2009+h*10/525960)}
function supply(h){let s=0;for(let i=0;i<34;i++){const b=Math.min(210000,Math.max(0,h-i*210000));s+=b*50/2**i}return s}
function drawC(h,cur){const W=320,H=150,P=24,mx=7e6,x=v=>P+v/mx*(W-P-6),y=v=>H-18-v/21e6*(H-34);let d='';for(let v=0;v<=mx;v+=50000)d+=(v?'L':'M')+x(v).toFixed(1)+' '+y(supply(v)).toFixed(1);
$('hCurve').innerHTML=`<line x1="${P}" x2="${W-6}" y1="${y(21e6)}" y2="${y(21e6)}" class="cap"/><text x="${W-6}" y="${y(21e6)-4}" text-anchor="end">2100万</text><path d="${d}" class="ln0"/><path d="${d.split('L').filter((_,i)=>i*50000<=h).join('L')}" class="ln1"/><circle cx="${x(h)}" cy="${y(cur)}" r="5"/>${[2009,2050,2100,2140].map(yr=>`<text x="${x((yr-2009)*52596)}" y="${H-4}" text-anchor="middle">${yr}</text>`).join('')}`}
$('hgt').oninput=hv;hv();
let hT;$('hPlay').onclick=()=>{clearInterval(hT);const g=$('hgt');if(+g.value>=+g.max)g.value=0;hT=setInterval(()=>{g.value=+g.value+40000;hv();if(+g.value>=+g.max)clearInterval(hT)},30)};
// bonus game: spot the fake transactions (3 levels, one new rule per level)
(()=>{const N=['アリス','ボブ','キャロル'],E={アリス:'👩',ボブ:'👨',キャロル:'👧'},SL={アリス:'🌸',ボブ:'⭐',キャロル:'🍀'},FAKE=['👾','🐙','🦝'],PER=4,TOT=12;
const LV=[{i:'💰',t:L('残高チェック','Balance check'),r:L('持っている以上のコインは送れません。財布の中身と金額をくらべよう!','You can’t send more coins than you have. Compare the wallet with the amount!'),s:10},
{i:'🖋️',t:L('ハンコチェック','Seal check'),r:L('取引には本人のハンコ(本物では「署名」)が必要。上の見本とちがうハンコはニセモノ!','Every transaction needs the owner’s seal (a “signature” in real Bitcoin). A seal that doesn’t match the sample is fake!'),s:9},
{i:'🪙',t:L('二重払いチェック','Double-spend check'),r:L('コインには番号があります。もう使ったコイン(✕印)をもう一度使うのはズル!','Coins have numbers. Using a coin that was already spent (marked ✕) again is cheating!'),s:9}];
const MO=[L('ランチ代','lunch'),L('本代','books'),L('おこづかい','allowance'),L('誕生日プレゼント','birthday gift'),L('割り勘','split bill'),L('ぜったい本物です','100% real, trust me'),L('いそいで!!','hurry!!'),L('ジュース代','juice')];
let W,S,lv,k,q,score,combo,best,ok,hist,t,tl,busy,started=false;const R=a=>a[Math.floor(Math.random()*a.length)],sh=a=>a.sort(()=>Math.random()-.5);
const chip=(c,x)=>`<i class="cn${x?' used':''}">${lv>=2?c:''}</i>`;
function draw(){$('gBal').innerHTML=N.map(n=>`<div class="gw${q&&q.f==n?' on':''}"><div class="gwh"><span>${E[n]}</span>${nm(n)}${started&&lv>=1?`<span class="hk mini" title="${L('ハンコ見本','seal sample')}">${SL[n]}</span>`:''}<b>${W[n].length}</b></div><div class="cns">${W[n].map(c=>chip(c)).join('')}${started&&lv>=2?S[n].map(c=>chip(c,1)).join(''):''}</div></div>`).join('')}
function mk(bad){const has=N.filter(n=>W[n].length);let pool=bad=='dbl'?N.filter(n=>S[n].length):has;if(!pool.length){bad=null;pool=has}const f=R(pool),to=R(N.filter(x=>x!=f)),b=W[f].length;
let c={f,to,seal:SL[f],memo:R(MO),bad};
if(bad=='bal'){c.a=b+1+Math.floor(Math.random()*2);c.coins=[...W[f],...Array.from({length:c.a-b},()=>'?')];c.why=L(`${f}は${b}コインしか持っていないのに、${c.a}コイン送ろうとしています`,`${nm(f)} has only ${b} coins but tries to send ${c.a}`)}
else if(bad=='seal'){c.a=1+Math.floor(Math.random()*Math.min(b,2));c.coins=W[f].slice(0,c.a);c.seal=R(Math.random()<.5?FAKE:N.filter(x=>x!=f).map(x=>SL[x]));c.why=L(`ハンコが${f}の見本(${SL[f]})とちがいます。ニセモノです`,`The seal doesn’t match ${nm(f)}’s sample (${SL[f]}). It’s a fake`)}
else if(bad=='dbl'){const u=R(S[f]);c.coins=W[f].length?[W[f][0],u]:[u];c.a=c.coins.length;c.why=L(`コイン${u}は${f}がもう使ったコインです(二重払い)`,`Coin ${u} was already spent by ${nm(f)} (double spend)`)}
else{c.a=1+Math.floor(Math.random()*Math.min(b,3));c.coins=W[f].slice(0,c.a);c.why=L('残高もハンコもコインもOK。台帳に記録しました','Balance, seal and coins all check out. Recorded in the ledger')}
return c}
function intro(){clearInterval(t);const v=LV[lv];q=null;draw();$('gStage').innerHTML=`<div class="glv"><div class="glv-n">${L('レベル','Level')} ${lv+1} / 3</div><div class="glv-i">${v.i}</div><h3>${v.t}</h3><p>${v.r}</p>${lv?`<p class="glv-s">${L('前のレベルのルールも続きます。','Earlier rules still apply.')}</p>`:''}<button id="gGo">${L('スタート ▶','Start ▶')}</button></div>`;$('gGo').onclick=()=>{plan();next()};$('gGo').focus()}
let P;function plan(){const ng=[['bal','bal'],['seal','seal','bal'],['dbl','dbl','seal']][lv];P=sh([...ng,...Array(PER-ng.length).fill(null)]);k=0}
function next(){if(k>=PER){lv++;return lv>2?end():intro()}q=mk(P[k]);busy=false;draw();const v=LV[lv];tl=v.s;
const amt=lv>=2?`<div class="tx-c">${q.coins.map(c=>`<i class="cn big">${c}</i>`).join('')}</div>`:`<div class="tx-a">🪙 × ${q.a}</div>`;
$('gStage').innerHTML=`<div class="ghud"><span>${v.i} Lv${lv+1}</span><span>${k+1} / ${PER}</span><span id="gCombo" class="gcombo">${combo>1?'🔥'+combo:''}</span><span class="gpt">${score}<small>pt</small></span></div><div class="timer"><div id="gT"></div></div>
<div class="tx2" id="gCard"><div class="tx-who">${E[q.f]} ${nm(q.f)} <span class="arr">→</span> ${E[q.to]} ${nm(q.to)}</div>${amt}<div class="tx-memo">📝 ${q.memo}</div>${lv>=1?`<div class="tx-seal">${L('ハンコ','Seal')} <span class="hk">${q.seal}</span></div>`:''}<div id="gFx" class="gfx"></div></div>
<div class="gbtn"><button id="gNo" class="no">❌ ${L('ニセモノ','Fake')}</button><button id="gYes" class="yes">⭕ ${L('OK','OK')}</button></div><div id="gMsg" class="gmsg"><span class="mut">${L('← → キーやスワイプでも答えられます','You can also use ← → keys or swipe')}</span></div>`;
$('gYes').onclick=()=>ans(true);$('gNo').onclick=()=>ans(false);swipe($('gCard'));
t=setInterval(()=>{tl-=.1;const g=$('gT');if(g)g.style.width=Math.max(0,tl/v.s*100)+'%';if(tl<=0)ans(null)},100)}
function swipe(el){let x0=null;el.onpointerdown=e=>{x0=e.clientX;el.setPointerCapture(e.pointerId)};el.onpointermove=e=>{if(x0!=null&&!busy)el.style.transform=`translateX(${(e.clientX-x0)*.6}px) rotate(${(e.clientX-x0)/40}deg)`};
el.onpointerup=el.onpointercancel=e=>{if(x0==null)return;const d=e.clientX-x0;x0=null;el.style.transform='';if(Math.abs(d)>70)ans(d>0)}}
function ans(y){if(busy)return;busy=true;clearInterval(t);const valid=!q.bad,right=y===valid;
if(right){combo++;best=Math.max(best,combo);ok++;score+=100+(combo-1)*20}else combo=0;hist[lv].push(right);
if(valid){const mv=W[q.f].splice(0,q.a);W[q.to].push(...mv);S[q.f].push(...mv)}
const fx=$('gFx');fx.textContent=valid?L('承認','OK'):L('却下','FAKE');fx.className='gfx on '+(valid?'g':'r');
$('gCard').classList.add(right?'pass':'shake','done');$('gYes').disabled=$('gNo').disabled=true;draw();
const c=$('gCombo');if(c){c.textContent=combo>1?'🔥'+combo:'';if(combo>1)c.classList.add('pop')}
const m=$('gMsg');m.className='gmsg '+(right?'g':'r');m.textContent=(y===null?L('⏰ 時間切れ! ','⏰ Time’s up! '):right?(combo>2?L(`⭕ ${combo}連続! `,`⭕ ${combo} in a row! `):L('⭕ せいかい! ','⭕ Correct! ')):L('😵 おしい! ','😵 Oops! '))+q.why+L('。','.');
k++;setTimeout(next,right?1300:2400)}
function end(){started=false;q=null;draw();$('gStage').innerHTML='';const e=$('gEnd');e.hidden=false;
const rank=ok>=11?L('🏆 伝説のノード','🏆 Legendary node'):ok>=9?L('🛡️ 頼れるノード','🛡️ Reliable node'):ok>=6?L('🔰 見習いノード','🔰 Apprentice node'):L('🙈 だまされがちノード','🙈 Easily-fooled node');
if(ok>=9)confetti();e.innerHTML=`<div class="gscore">${score}<small> pt</small></div><p class="c"><b>${rank}</b></p><div class="gsum"><div><b>${ok}</b><small>/ ${TOT}</small><span>${L('正解','correct')}</span></div><div><b>🔥${best}</b><span>${L('最大コンボ','best combo')}</span></div></div>
<div class="glvs">${LV.map((v,j)=>`<div><span>${v.i} ${v.t}</span><span>${hist[j].map(x=>x?'⭕':'❌').join('')}</span></div>`).join('')}</div>
<div class="note"><b>${L('このゲームでわかったこと','What this game showed')}</b><br>${L('ビットコインでは、世界中のノードがあなたと同じように「残高は足りる?」「署名は本人のもの?」「同じコインを2回使っていない?」を1件ずつチェックしています。ひとつでもおかしな取引は、誰が送ってきてもブロックに入れてもらえません。','In Bitcoin, nodes all over the world check every transaction just like you did: “Is the balance enough?”, “Is the signature the owner’s?”, “Is the same coin being spent twice?” A transaction that fails even one check never gets into a block, no matter who sent it.')}</div>
<div class="share"><a class="btn x" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(L(`「ニセ取引を見破れ!」で ${score}点(${ok}/${TOT}問正解)、${rank}でした ₿ #さわってわかるビットコイン`,`I scored ${score} pts (${ok}/${TOT}) in “Spot the fake transactions!” — ${rank} ₿`))}&url=${encodeURIComponent(U)}">${L('𝕏 でスコアをシェア','Share score on 𝕏')}</a><button id="gAgain" class="ghost">${L('もう一回あそぶ','Play again')}</button></div>`;$('gAgain').onclick=start}
function start(){W={アリス:[1,2,3,4,5],ボブ:[6,7,8],キャロル:[9,10]};S={アリス:[],ボブ:[],キャロル:[]};lv=0;score=0;combo=0;best=0;ok=0;hist=[[],[],[]];started=true;$('gEnd').hidden=true;intro()}
document.addEventListener('keydown',e=>{if(!$('gYes')||busy||e.target.matches('input,textarea'))return;if(e.key=='ArrowRight'){e.preventDefault();ans(true)}if(e.key=='ArrowLeft'){e.preventDefault();ans(false)}});
W={アリス:[1,2,3,4,5],ボブ:[6,7,8],キャロル:[9,10]};S={アリス:[],ボブ:[],キャロル:[]};lv=0;draw();$('gStart').onclick=start})();

// entropy chapter
(()=>{const g=$('eGrid');const flip=()=>{const r=crypto.getRandomValues(new Uint8Array(32));let bits='';r.forEach(x=>bits+=x.toString(2).padStart(8,'0'));g.innerHTML=[...bits].map((b,i)=>`<span class="b${b}" style="animation-delay:${i*3}ms">${b}</span>`).join('');g.classList.add('on')};
flip();$('eFlip').onclick=flip;
let rate=5e6,run=0;const big=(n)=>{const e=Math.floor(Math.log10(n));return e<6?Math.round(n).toLocaleString():`${L('約','~')}10<sup>${e}</sup>`};
const dur=s=>{const y=s/31557600;if(EN){if(s<1)return 'instant';if(s<60)return Math.round(s)+' s';if(s<3600)return Math.round(s/60)+' min';if(s<86400)return Math.round(s/3600)+' h';if(y<1)return Math.round(s/86400)+' days';if(y<1e4)return Math.round(y).toLocaleString()+' years';const u=y/1.38e10;return u<1?big(y)+' years':`${big(u)}× the age of the universe`}if(s<1)return '一瞬';if(s<60)return Math.round(s)+'秒';if(s<3600)return Math.round(s/60)+'分';if(s<86400)return Math.round(s/3600)+'時間';if(y<1)return Math.round(s/86400)+'日';if(y<1e4)return Math.round(y).toLocaleString()+'年';const u=y/1.38e10;return u<1?big(y)+'年':`宇宙の年齢の${big(u)}倍`};
const rows=()=>$('eRows').innerHTML=[8,16,24,32,64,128,256].map(b=>`<div${b==256?' class="hl"':''}><span>${b}${L('ビット',' bits')}</span><span>${dur(2**b/2/rate)}</span><span>${dur(2**b/2/1e21)}</span></div>`).join('');rows();
document.querySelectorAll('#eBits button').forEach(btn=>btn.onclick=async()=>{const B=+btn.dataset.b,N=2**B,target=crypto.getRandomValues(new Uint32Array(1))[0]%N;const id=++run;
document.querySelectorAll('#eBits button').forEach(x=>x.classList.toggle('on',x==btn));$('eComb').innerHTML=big(N);$('eRes').textContent='さがし中…';const t0=performance.now();let k=0;
while(id==run){const tb=performance.now();while(performance.now()-tb<12){if(k==target)break;k++}const s=(performance.now()-t0)/1000;$('eTry').textContent=(k+1).toLocaleString();$('eTime').textContent=s.toFixed(1)+L('秒',' s');if(k==target){if(s>.05){rate=(k+1)/s;rows()}$('eRes').innerHTML=`<span style="color:var(--ok)">${L(`🎯 当たり! ${(k+1).toLocaleString()}回目`,`🎯 Found it on try ${(k+1).toLocaleString()}!`)}</span>`;break}await new Promise(r=>setTimeout(r))}})})();

// fee auction
(()=>{let pool;const mk=()=>{pool=Array.from({length:11},()=>({f:1+Math.floor(Math.random()**1.6*50),me:false}))};mk();
const sh=()=>{$('fV').textContent=$('fee').value;$('fPool').innerHTML=[...pool,{f:+$('fee').value,me:true}].map(t=>`<span class="${t.me?'me':''}">${t.me?'🙋':'📨'} ${t.f}</span>`).join('')};$('fee').oninput=sh;sh();
$('fGo').onclick=()=>{const all=[...pool,{f:+$('fee').value,me:true}].sort((a,b)=>b.f-a.f||(a.me?1:-1));const inb=all.slice(0,5);const ok=inb.some(t=>t.me);
$('fPool').innerHTML=all.map((t,i)=>`<span class="${t.me?'me ':''}${i<5?'in':'out'}">${t.me?'🙋':'📨'} ${t.f}</span>`).join('');
$('fRes').innerHTML=ok?`<span style="color:var(--ok)">✅ ブロックに入りました!</span>`:`<span style="color:var(--ng)">${L(`⏳ 入れませんでした。手数料が ${inb[4].f} サトシより高ければ入れました。`,`⏳ Didn’t make it. A fee above ${inb[4].f} sats would have.`)}</span>`;if(ok)confetti();mk()}})();
// lightning
(()=>{let A=100000,B=0,open=false,off=0,on=0;const log=t=>{const li=document.createElement('li');li.innerHTML=t;$('lLog').prepend(li)};
const ui=()=>{$('lA').textContent=A.toLocaleString();$('lB').textContent=B.toLocaleString();$('lOff').textContent=off.toLocaleString();$('lOn').textContent=on;$('lOpen').disabled=open;$('lPay').disabled=$('lPay100').disabled=$('lClose').disabled=!open;$('lCh').classList.toggle('on',open)};
const pay=n=>{let k=0;while(k<n&&A>=100){A-=100;B+=100;off++;k++}const b=$('lBolt');b.classList.remove('zap');void b.offsetWidth;b.classList.add('zap');$('lSt').textContent=k?L(`一瞬で${k}回送りました`,`Sent ${k}× instantly`):L('残高が足りません','Not enough balance');ui()};
$('lOpen').onclick=()=>{$('lOpen').disabled=true;$('lSt').textContent='ブロックに記録中…(本物は約10分)';setTimeout(()=>{open=true;on++;log(L('⛓ ブロックに記録: チャンネルを開く(アリスが100,000サトシ預ける)','⛓ On-chain: open channel (Alice locks 100,000 sats)'));$('lSt').textContent='チャンネルが開きました';ui()},900)};
$('lPay').onclick=()=>pay(1);$('lPay100').onclick=()=>pay(100);
$('lClose').onclick=()=>{open=false;ui();$('lClose').disabled=true;$('lSt').textContent='ブロックに記録中…';setTimeout(()=>{on++;log(L(`⛓ ブロックに記録: チャンネルを閉じる(アリス ${A.toLocaleString()} / ボブ ${B.toLocaleString()})`,`⛓ On-chain: close channel (Alice ${A.toLocaleString()} / Bob ${B.toLocaleString()})`));$('lSt').textContent=L(`${off}回の支払いが、記録2回ですみました`,`${off} payments, only 2 on-chain records`);ui();off=0;A=A+B;B=0;setTimeout(ui,2500)},900)};ui()})();
// mining race
(()=>{const M=[{n:'あなた',e:'🙋'},{n:'コンピューターA',e:'🤖',r:45},{n:'コンピューターB',e:'👾',r:70}];let run=false,tm,nonce=0;
const draw=()=>$('rBoard').innerHTML=M.map(m=>`<div class="rm"><span>${m.e}</span><b>${L(m.n,{あなた:'You',コンピューターA:'Computer A',コンピューターB:'Computer B'}[m.n])}</b><small>${m.t.toLocaleString()}${L('回',' tries')}</small><span class="blks">${'🧱'.repeat(m.b)}${'▫️'.repeat(3-m.b)}</span><code>${m.h||''}</code></div>`).join('');
const reset=()=>M.forEach(m=>{m.b=0;m.t=0;m.h=''});reset();draw();
const tryH=async(m,k)=>{for(let i=0;i<k&&run;i++){const h=await sha(m.n+':'+(nonce++));m.t++;m.h=h.slice(0,10);if(h.startsWith('00')){m.b++;m.h=L('00 見つけた!','00 Found it!');if(m.b>=3)return end(m)}}};
const end=m=>{run=false;clearInterval(tm);$('rTap').disabled=true;$('rStart').disabled=false;$('rStart').textContent=L('もう一回','Again');draw();$('rRes').innerHTML=m.e=='🙋'?'<span style="color:var(--ok)">🏆 あなたの勝ち!</span>':`<span style="color:var(--ng)">${L(m.n+'の勝ち。もっと連打!',{コンピューターA:'Computer A',コンピューターB:'Computer B'}[m.n]+' wins. Tap faster!')}</span>`;if(m.e=='🙋')confetti()};
$('rStart').onclick=()=>{reset();run=true;$('rRes').textContent='';$('rStart').disabled=true;$('rTap').disabled=false;tm=setInterval(()=>{M.slice(1).forEach(m=>tryH(m,Math.round(m.r/10*(0.6+Math.random()*0.8))));draw()},100)};
$('rTap').onclick=()=>{if(run){tryH(M[0],12);const b=$('rTap');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}}})();
// 51% attack
(()=>{const sim=p=>{let h=0,x=0,steps=[];while(steps.length<80){const a=Math.random()<p;a?x++:h++;steps.push(a);if(h>=6&&x>h)return{ok:true,steps};if(h-x>=8)return{ok:false,steps}}return{ok:false,steps}};let tm;
$('aP').oninput=()=>$('aV').textContent=$('aP').value;
$('aGo').onclick=()=>{clearInterval(tm);const p=$('aP').value/100,r=sim(p);let i=0,h=0,x=0;$('aRes').textContent='';$('aH').innerHTML=$('aX').innerHTML='';
tm=setInterval(()=>{if(i>=r.steps.length){clearInterval(tm);$('aRes').innerHTML=r.ok?'<span style="color:var(--ng)">😈 追い抜きました。二重払い成功…</span>':'<span style="color:var(--ok)">🛡 追いつけず失敗。みんなのチェーンが勝ちました</span>';return}
const a=r.steps[i++],el=document.createElement('i');el.textContent=a?'😈':(h==0?'🛒':'🧱');(a?$('aX'):$('aH')).appendChild(el);a?x++:h++},180)};
$('aMany').onclick=()=>{const p=$('aP').value/100;let k=0;for(let i=0;i<100;i++)if(sim(p).ok)k++;$('aRes').innerHTML=L(`100回中 <b>${k}回</b> 成功(計算力 ${$('aP').value}%)`,`<b>${k}</b> of 100 succeeded (power ${$('aP').value}%)`)}})();

// theme
(()=>{const r=document.documentElement,b=$('theme'),dk=()=>r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme: dark)').matches;const ui=()=>{b.classList.toggle('dk',dk())};ui();
b.onclick=()=>{r.dataset.theme=dk()?'light':'dark';try{localStorage.setItem('sw-theme',r.dataset.theme)}catch(e){}ui()}})();

// language
(()=>{const b=$('lang');b.querySelectorAll('button').forEach(x=>{const on=(x.dataset.l=='en')==EN;x.setAttribute('aria-pressed',on);x.onclick=()=>{if(on)return;try{localStorage.setItem('sw-lang',EN?'ja':'en');if(!$('app').hidden)sessionStorage.setItem('sw-go',cur)}catch(e){}location.reload()}});
let g=null;try{g=sessionStorage.getItem('sw-go');sessionStorage.removeItem('sw-go')}catch(e){}if(g!==null){$('hero').hidden=true;$('app').hidden=false;go(+g)}})();

// big-picture flow show: one stage, one scene per step
(()=>{const f=$('flow');if(!f)return;const L2=[...f.children],S=$('fStage'),ti=$('fTitle'),de=$('fDesc'),mo=$('fMore'),pb=$('fPlay');let k=-1,T=null,tm=[];
const t=x=>window.T?window.T(x):x,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let SP=1.5;const rate=()=>{if(!RM)S.getAnimations({subtree:true}).forEach(x=>x.playbackRate=1/SP)};const at=(ms,fn)=>tm.push(setTimeout(()=>{fn();rate()},RM?0:ms*SP)),clr=()=>{tm.forEach(clearTimeout);tm=[]};
const hx=n=>[...Array(n)].map(()=>'0123456789abcdef'[Math.random()*16|0]).join('');
const slip=(c='')=>`<div class="slip ${c}"><small>${t('取引')}</small><b>${t('アリス → ボブ')}</b><span class="amt">0.01 BTC</span></div>`;
const sc=[
()=>{S.innerHTML=`<div class="sc1"><div class="grid256" id="g256">${'<i></i>'.repeat(256)}</div><div class="keyout pend" id="kOut">🔑 <b>${t('秘密鍵')}</b><code>${hx(16)}…</code></div></div>`;const c=[...S.querySelectorAll('#g256 i')];let n=0;const st=()=>{for(let m=0;m<16&&n<256;m++,n++){c[n].textContent=Math.random()<.5?'0':'1';c[n].className='b'+c[n].textContent}if(n<256){if(!RM)at(45,st)}else $('kOut').classList.remove('pend')};if(RM)while(n<256)st();else st()},
()=>{S.innerHTML=`<div class="sc2"><div class="pill k">🔑 ${t('秘密鍵')}</div><div class="arr a1">→</div><div class="fun">▽<small>${t('一方通行')}</small></div><div class="arr a2">→</div><div class="pill pub">${t('公開鍵')}</div><div class="arr a3">→</div><div class="pill adr">${t('アドレス')}<code>bc1q${hx(6)}…</code></div></div><div class="back">← ✕ <span>${t('逆向きの計算はできない')}</span></div>`},
()=>{S.innerHTML=`<div class="sc3"><div class="slip big"><small>${t('取引')}</small><b id="ty"></b><span class="amt" id="ty2"></span><small class="fee" id="ty3"></small></div></div>`;const a=t('アリス → ボブ'),b='0.01 BTC',fe=t('手数料')+' 0.0001 BTC',e=$('ty');let n=0;const st=()=>{e.textContent=a.slice(0,++n);if(n<a.length)at(110,st);else at(250,()=>{$('ty2').textContent=b;at(300,()=>$('ty3').textContent=fe)})};if(RM){e.textContent=a;$('ty2').textContent=b;$('ty3').textContent=fe}else st()},
()=>{S.innerHTML=`<div class="sc4"><div class="slipw">${slip('big')}<div class="stamp">🔏</div><div class="seal">${t('署名')}</div></div><div class="chk">${t('公開鍵でチェック')} <b>✓ ${t('本人の署名')}</b></div></div>`},
()=>{const p=[[50,10],[86,30],[86,70],[50,90],[14,70],[14,30]];S.innerHTML=`<div class="sc5"><i class="rip"></i><i class="rip r2"></i>${p.map((q,i)=>`<span class="node" style="left:${q[0]}%;top:${q[1]}%;animation-delay:${.5+i*.25}s">🖥️<b style="animation-delay:${.7+i*.25}s">✓</b></span>`).join('')}<div class="mini">📄</div></div><div class="sub">${t('ノードが署名と残高をチェックして、となりに伝える')}</div>`},
()=>{const fs=[[t('ほかの取引'),2],[t('あなたの取引'),12,1],[t('ほかの取引'),25],[t('ほかの取引'),5]];S.innerHTML=`<div class="sc6"><div class="mph"><span>${t('メンプール(順番待ち)')}</span><span>${t('手数料')}</span></div><div class="mpl">${fs.map((x,i)=>`<div class="mp${x[2]?' me':''}" data-f="${x[1]}" style="top:${i*40}px"><span>📄 ${x[0]}</span><b>${x[1]} sat/vB</b></div>`).join('')}</div><div class="sub">${t('手数料が高い取引ほど上へ')}</div></div>`;at(900,()=>{[...S.querySelectorAll('.mp')].sort((a,b)=>b.dataset.f-a.dataset.f).forEach((e,i)=>e.style.top=i*40+'px')})},
()=>{S.innerHTML=`<div class="sc7"><div class="blkbox"><small>${t('新しいブロック')}</small><div class="tx3"><span>📄</span><span class="me">📄</span><span>📄</span></div></div><div class="mine"><div>${t('ナンス')} <b id="nn">0</b></div><code id="nh">${hx(16)}</code><div class="nfound" id="nf" hidden>⛏️ ${t('当たり!')}</div></div></div>`;let n=0;const st=()=>{n+=Math.random()*900+300|0;$('nn').textContent=n.toLocaleString();if(n<9000&&!RM){$('nh').textContent=hx(16);at(70,st)}else{$('nh').innerHTML='<em>0000</em>'+hx(12);$('nh').classList.add('ok');$('nf').hidden=false}};at(600,st)},
()=>{const h=[hx(4),hx(4),hx(4),hx(4)];S.innerHTML=`<div class="sc8">${[0,1,2].map(i=>`<div class="cb${i==2?' new':''}"><small>#${840001+i}</small><span>${t('前の指紋')}</span><code>00${h[i]}</code><span>${t('指紋')}</span><code class="own">00${h[i+1]}</code></div>${i<2?'<div class="lk">🔗</div>':''}`).join('')}</div><div class="sub">${t('新しいブロックが前のブロックの指紋を引きつぐ')}</div>`},
()=>{S.innerHTML=`<div class="sc9"><div class="stack" id="stk"></div><div class="side"><div class="conf">${t('承認')} <b id="cf">0</b>/6</div><div class="wal">👛 ${t('ボブの残高')}<b id="wb">0.000 BTC</b></div></div></div>`;let n=0;const st=()=>{n++;const d=document.createElement('div');d.className='sb'+(n==1?' me':'');d.textContent=n==1?t('あなたの取引入り'):'+1';$('stk').prepend(d);$('cf').textContent=n;if(n==1)$('wb').textContent='0.010 BTC';if(n==6)S.querySelector('.conf').classList.add('ok');else if(!RM)at(380,st)};if(RM)while(n<6)st();else at(300,st)}];
const set=n=>{clr();k=n;L2.forEach((l,i)=>{l.classList.toggle('on',i==k);l.classList.toggle('done',i<k)});
if(k<0){S.innerHTML='<div class="idle">₿</div>';ti.textContent=t('▶ 再生を押すと、最初から順番に進みます');de.textContent='';mo.hidden=true;return}
const l=L2[k];sc[k]();rate();ti.textContent=`${k+1}. ${t(l.querySelector('b').textContent)}`;de.textContent=t(l.querySelector('p').textContent);mo.textContent=t(l.querySelector('.more').textContent);mo.hidden=false;mo.onclick=e=>{e.preventDefault();stop();go(chs.findIndex(c=>c.dataset.t==l.dataset.g))};
if(k>=L2.length-1&&T){const d=dw();stop();bar(d);tm.push(setTimeout(()=>{ti.textContent=t('✅ これで支払い完了!全部の章がつながりました');window.confetti&&confetti()},d))}};
const A=[.8,2.4,1.8,2.1,2.4,1.8,1.9,.9,2.3],dw=()=>RM?4000:Math.max(SP>1?6000:4500,A[k]*1000*SP+(SP>1?4500:3000)),fb=$('fBar'),bar=d=>{fb.style.transition='none';fb.style.width='0';if(d){fb.offsetWidth;fb.style.transition=`width ${d}ms linear`;fb.style.width='100%'}};
const stop=()=>{clearTimeout(T);T=null;pb.textContent=t('▶ 再生');bar(0)};
const tick=()=>{const d=dw();bar(d);T=setTimeout(()=>{set(k+1);if(T)tick()},d)};
pb.onclick=()=>{if(T)return stop();if(k>=L2.length-1)k=-1;pb.textContent=t('⏸ 停止');T=1;set(k+1);if(T)tick()};
$('fNext').onclick=()=>{stop();set(k>=L2.length-1?0:k+1)};$('fPrev').onclick=()=>{stop();set(Math.max(0,k-1))};$('fReset').onclick=()=>{stop();set(-1)};document.querySelectorAll('#fSpd button').forEach(b=>b.onclick=()=>{SP=+b.dataset.s;document.querySelectorAll('#fSpd button').forEach(x=>x.setAttribute('aria-pressed',x==b));if(T){clearTimeout(T);tick()}});
L2.forEach((l,i)=>{l.onclick=e=>{e.preventDefault();stop();set(i)}});set(-1)})();

// intro
(()=>{const v=$('iView');if(!v)return;const T_=x=>window.T?window.T(x):x;
const show=all=>{$('iBank').setAttribute('aria-pressed',!all);$('iAll').setAttribute('aria-pressed',all);
v.innerHTML=all?`<div class="net">${'👤📒 '.repeat(6).trim().split(' ').map(x=>`<span>${x}</span>`).join('')}</div><p>${T_('台帳はみんなが同じものを持っています。1人がズルしても、ほかの全員と合わないのでバレます。')}</p>`:`<div class="net"><span>👤</span><span>👤</span><span class="big">🏦📒</span><span>👤</span><span>👤</span></div><p>${T_('台帳は銀行だけが持っています。銀行が書きかえたり、止めたりできます。')}</p>`};
$('iBank').onclick=()=>show(false);$('iAll').onclick=()=>show(true);show(false);
document.querySelectorAll('.rm0').forEach(b=>b.onclick=()=>go(chs.findIndex(c=>c.dataset.t==b.dataset.g)))})();

// 51% myth: catch-up chance (q/p)^z
(()=>{const z=$('zN');if(!z)return;const t=x=>window.T?window.T(x):x;const up=()=>{const q=+$('aP').value/100,p=1-q,n=+z.value,P=q>=p?1:Math.pow(q/p,n);$('zV').textContent=n;$('zB').style.width=(P*100)+'%';$('zT').textContent=t('計算力')+` ${Math.round(q*100)}% `+t('で追いつける確率')+`: ${P>=.9995?'100':P<.0001?'0.01'+t('未満'):(P*100).toFixed(P<.1?2:1)}%`};z.oninput=up;$('aP').addEventListener('input',up);up()})();
