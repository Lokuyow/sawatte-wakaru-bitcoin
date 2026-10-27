const EN=document.documentElement.lang=='en',L=(j,e)=>EN?e:j,NM={アリス:'Alice',ボブ:'Bob',キャロル:'Carol',デイブ:'Dave'},nm=n=>EN?NM[n]||n:n;
if(EN){document.getElementById('hIn').value='Hello'}
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
(()=>{const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,inp=$('hIn'),P=EN?['Hello','Hallo','Hello!','hello']:['こんにちは','こんにちわ','こんにちは!','こんばんは'];let prevT=null,prevH='',seq=0;
const esc=c=>c.replace(/[&<>"]/g,x=>'&#'+x.charCodeAt(0)+';');
$('hwP').innerHTML=P.map(p=>`<button class="ghost" data-p="${esc(p)}">${esc(p)}</button>`).join('');$('hwPl').textContent=L('前の指紋','Previous');$('hwNl').textContent=L('いまの指紋','Now');
const grid=h=>{let o='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const cc=c<4?c:7-c,v=parseInt(h[r*4+cc],16);o+=`<i class="g${v>11?3:v>7?2:v>3?1:0}"></i>`}return o};
const rng=(a,b)=>{a=[...a];b=[...b];let s=0;while(s<a.length&&s<b.length&&a[s]==b[s])s++;let e=0;while(e<a.length-s&&e<b.length-s&&a[a.length-1-e]==b[b.length-1-e])e++;return[s,b.length-e,Math.max(a.length-s-e,b.length-s-e)]};
const bz=p=>window.__bz&&__bz(p),bu=(e,n)=>window.__bu&&__bu(e,n);
async function run(anim){const my=++seq,t=inp.value,ch=[...t],h=await sha(t);if(my!=seq)return;
const [s,e,n]=prevT==null?[0,0,0]:rng(prevT,t);$('hwIn').innerHTML=ch.map((c,i)=>`<span class="${prevT!=null&&i>=s&&i<e?'chg':''}" style="--d:${i*40}ms">${esc(c==' '?'\u00a0':c)}</span>`).join('')||'&nbsp;';
const M=$('hwM'),fl=$('hwFl');if(anim&&!RM){fl.innerHTML=ch.slice(0,10).map((c,i)=>`<span style="--d:${i*45}ms">${esc(c)}</span>`).join('');M.classList.remove('go');void M.offsetWidth;M.classList.add('go');await new Promise(r=>setTimeout(r,520));if(my!=seq)return}
const same=prevH&&prevH!=h;$('hwG0').innerHTML=prevH?grid(prevH):'';$('hwH0').innerHTML=prevH?[...prevH].map((c,i)=>c!=h[i]?`<i>${c}</i>`:c).join(''):'';
$('hwG1').innerHTML=grid(h);$('hwH1').innerHTML=[...h].map((c,i)=>prevH&&c!=prevH[i]?`<i>${c}</i>`:c).join('');
const O=document.querySelector('.hwO');O.classList.toggle('one',!prevH);const C=document.querySelector('.hwC.now');if(anim&&!RM){C.classList.remove('st');void C.offsetWidth;C.classList.add('st')}
let d=0;if(prevH)for(let i=0;i<64;i++)if(h[i]!=prevH[i])d++;
$('hwR').innerHTML=!prevH||prevH==h?'':(n<=1?L(`1文字変えただけで、指紋がまるごと変わる <b>${d}/64</b>`,`Change 1 character and the whole fingerprint changes <b>${d}/64</b>`):L(`${n}文字の変更で、指紋がまるごと変わる <b>${d}/64</b>`,`${n} characters changed, the whole fingerprint changes <b>${d}/64</b>`));
if(anim&&prevH!=h){bz(12);bu(C,8)}if(prevH!=h){prevT=t;prevH=h}}
let tm;inp.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>run(true),250)};
$('hwP').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(inp.value==b.dataset.p)return;inp.value=b.dataset.p;run(true)};
prevT=null;run(false)})();

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
let kp,kp2;const alg={name:'ECDSA',namedCurve:'P-256'},sa={name:'ECDSA',hash:'SHA-256'};
(()=>{const R=$('sg');if(!R)return;const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,buzz=p=>window.__bz&&__bz(p),burst=(e,n)=>window.__bu&&__bu(e,n);const I={u:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',k:'<svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3m-4 4 3 3m-6-0 2 2"/></svg>',n:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8m-4-4v4"/></svg>'};
R.innerHTML=`<ol class="sgS"><li>${L('書く','Write')}</li><li>${L('署名','Sign')}</li><li>${L('確認','Check')}</li></ol>
<div class="sgSt"><div class="sgWho"><span class="sgAv">${I.u}</span><b>${L('アリス','Alice')}</b><span class="sgKey">${I.k}${L('秘密鍵','Private key')}</span></div>
<div class="sgSlip"><small>${L('取引','Transaction')}</small><div class="sgTx">${L('アリス','Alice')} → ${L('ボブ','Bob')} <b class="sgAmt">1 BTC</b></div><span class="sgSeal"></span></div>
<div class="sgNet"><div class="sgNs">${[0,1,2,3].map(()=>`<span class="sgN">${I.n}<i></i></span>`).join('')}</div><small>${L('みんな','Everyone')} · ${I.k}${L('公開鍵でチェック','check with public key')}</small></div></div>
<div class="sgSig"></div><div id="sRes" class="res" aria-live="polite"></div>
<button id="sgGo"></button><div class="sgX" hidden><button class="ghost" id="sgEd"></button><button class="ghost" id="sgFk">${L('ニセ者が署名','An impostor signs')}</button><button class="ghost" id="sgRe">${L('最初から','Start over')}</button></div>`;
const q=c=>R.querySelector(c),S=[...R.querySelectorAll('.sgS li')],N=[...R.querySelectorAll('.sgN')],go=q('#sgGo'),X=q('.sgX'),slip=q('.sgSlip'),seal=q('.sgSeal'),amt=q('.sgAmt'),res=q('#sRes'),sg=q('.sgSig'),key=q('.sgKey');
let st=0,sig=null,signedMsg='',amount=1,fake=false,busy=false;const msg=()=>`Alice->Bob ${amount} BTC`,wait=ms=>new Promise(r=>setTimeout(r,RM?0:ms));
const step=i=>S.forEach((l,j)=>{l.className=j<i?'dn':j==i?'on':''});
const lab=()=>{go.innerHTML=[I.u.replace('<svg','<svg class="ic"')+L('取引を書く','Write the transaction'),I.k.replace('<svg','<svg class="ic"')+L('秘密鍵で署名','Sign with the private key'),I.n.replace('<svg','<svg class="ic"')+L('みんなで確認','Everyone checks')][st]||'';go.hidden=st>2;q('#sgEd').textContent=amount==1?L('金額を 100 BTC に書きかえる','Change the amount to 100 BTC'):L('金額を 1 BTC に戻す','Change it back to 1 BTC')};
const reset=()=>{st=0;sig=null;amount=1;fake=false;amt.textContent='1 BTC';amt.classList.remove('ed');slip.className='sgSlip';seal.className='sgSeal';seal.innerHTML='';sg.textContent='';res.textContent='';key.classList.remove('use');N.forEach(n=>n.className='sgN');X.hidden=true;step(0);lab()};
const sign=async(fk)=>{if(!kp)kp=await crypto.subtle.generateKey(alg,false,['sign','verify']);if(fk&&!kp2)kp2=await crypto.subtle.generateKey(alg,false,['sign','verify']);fake=fk;key.classList.toggle('use',!fk);await wait(380);signedMsg=msg();sig=await crypto.subtle.sign(sa,(fk?kp2:kp).privateKey,enc.encode(signedMsg));seal.className='sgSeal on'+(fk?' fk':'');seal.innerHTML=fk?'?':L('ア','A');key.classList.remove('use');sg.textContent=L('署名: ','Signature: ')+hex(sig).slice(0,32)+'…';buzz(15);burst(seal,fk?4:10)};
const check=async()=>{N.forEach(n=>n.className='sgN');res.textContent='';const ok=await crypto.subtle.verify(sa,kp.publicKey,sig,enc.encode(msg()));for(const n of N){n.className='sgN chk';await wait(170);n.className='sgN '+(ok?'ok':'ng')}slip.classList.toggle('ok',ok);slip.classList.toggle('ng',!ok);
res.innerHTML=ok?`<span style="color:var(--ok)">✓ ${L('アリス本人の署名。支払いOK','Alice’s own signature. Payment accepted')}</span>`:`<span style="color:var(--ng)">✕ ${fake?L('アリスの秘密鍵の署名ではありません','Not signed with Alice’s private key'):L('中身が変わったので、署名が合いません','The content changed, so the signature no longer fits')}</span>`;buzz(ok?[12,40,12]:60);if(ok)burst(res,8)};
go.onclick=async()=>{if(busy)return;busy=true;try{if(st==0){slip.classList.add('in');st=1}else if(st==1){await sign(false);st=2}else if(st==2){await check();st=3;X.hidden=false}step(st);lab()}finally{busy=false}};
q('#sgEd').onclick=async()=>{if(busy)return;busy=true;amount=amount==1?100:1;amt.textContent=amount+' BTC';amt.classList.toggle('ed',amount!=1);buzz(8);await wait(250);await check();lab();busy=false};
q('#sgFk').onclick=async()=>{if(busy)return;busy=true;amount=1;amt.textContent='1 BTC';amt.classList.remove('ed');await sign(true);await wait(250);await check();lab();busy=false};
q('#sgRe').onclick=reset;reset()})();
// 5 ledger
const ppl=[['アリス','👩'],['ボブ','👨'],['キャロル','👧'],['デイブ','🧔']];let bal={アリス:5,ボブ:2,キャロル:0,デイブ:1};
function rp(){$('people').innerHTML=ppl.map(([n,e])=>`<div class="p">${e}<div>${n}<br><b>${bal[n]}</b> コイン</div></div>`).join('')}
['tFrom','tTo'].forEach((s,k)=>$(s).innerHTML=ppl.map(([n],i)=>`<option value="${i}" ${i==k?'selected':''}>${nm(n)}</option>`).join(''));
function tx(f,t,a){const li=document.createElement('li');if(f==t||!(a>0)){li.className='ng';li.textContent=L(`❌ ${f}→${t} ${a}: おかしな取引です`,`❌ ${nm(f)}→${nm(t)} ${a}: invalid transaction`)}else if(bal[f]<a){li.className='ng';li.textContent=L(`❌ ${f}→${t} ${a}コイン: 台帳を見たら${f}は${bal[f]}コインしか持っていません。却下!`,`❌ ${nm(f)}→${nm(t)} ${a} coins: the ledger shows ${nm(f)} has only ${bal[f]}. Rejected!`)}else{bal[f]-=a;bal[t]+=a;li.className='ok';li.textContent=L(`✅ ${f}→${t} ${a}コイン: みんなで確認してOK。台帳に記録しました`,`✅ ${nm(f)}→${nm(t)} ${a} coins: verified by everyone and recorded`)}$('log').prepend(li);rp();if(li.className=='ng')document.querySelectorAll('.p')[ppl.findIndex(p=>p[0]==f)]&&document.querySelectorAll(".p")[ppl.findIndex(p=>p[0]==f)].classList.add('bump')}
$('tSend').onclick=()=>tx(ppl[$('tFrom').value][0],ppl[$('tTo').value][0],+$('tAmt').value);
$('tDouble').onclick=()=>{const a=bal['アリス'];if(!a){tx('アリス','ボブ',1);return}tx('アリス','ボブ',a);tx('アリス','キャロル',a)};rp();
// 6 halving
function hv(q){const h=+$('hgt').value,n=Math.floor(h/210000);let r=n<64?Math.floor(5e9/2**n):0,s=0;for(let i=0;i<=n&&i<64;i++){const sat=Math.floor(5e9/2**i),blocks=i<n?210000:h-i*210000+1;s+=sat*blocks}
$('hH').textContent=h.toLocaleString();$('hN').textContent=n;$('hR').textContent=(r/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hS').textContent=(s/1e8).toLocaleString('ja',{maximumFractionDigits:8});if(!q)drawC(h);$('hY').textContent=Math.round(2009+h*10/525960)}
function supply(h){let s=0;for(let i=0;i<34;i++){const b=Math.min(210000,Math.max(0,h-i*210000));s+=b*50/2**i}return s}
let hC=null;function drawC(h,cur){const W=320,H=150,P=24,mx=7e6,x=v=>P+v/mx*(W-P-6),y=v=>H-18-v/21e6*(H-34);if(!hC){let d='';for(let v=0;v<=mx;v+=25000)d+=(v?'L':'M')+x(v).toFixed(1)+' '+y(supply(v)).toFixed(1);const sv=$('hCurve');sv.innerHTML=`<defs><clipPath id="hClip"><rect id="hClipR" x="${P}" y="0" width="0" height="${H}"/></clipPath></defs><line x1="${P}" x2="${W-6}" y1="${y(21e6)}" y2="${y(21e6)}" class="cap"/><text x="${W-6}" y="${y(21e6)-4}" text-anchor="end">2100万</text><path d="${d}" class="ln0"/><path d="${d}" class="ln1" clip-path="url(#hClip)"/><circle id="hDot" cx="0" cy="0" r="5"/>${[2009,2050,2100,2140].map(yr=>`<text x="${x((yr-2009)*52596)}" y="${H-4}" text-anchor="middle">${yr}</text>`).join('')}`;hC={r:$('hClipR'),c:$('hDot')}}const X=x(h);const Yd=y(supply(h));hC.r.setAttribute('width',Math.max(0,X-P));hC.r.setAttribute('y',Yd);hC.r.setAttribute('height',Math.max(0,H-Yd));hC.c.style.transform=`translate(${X.toFixed(2)}px,${y(supply(h)).toFixed(2)}px)`}
$('hgt').oninput=()=>{cancelAnimationFrame(hT);document.querySelectorAll('#hCurve .hBadge').forEach(e=>e.remove());hv()};hv();
let hT=0;$('hPlay').onclick=()=>{cancelAnimationFrame(hT);const g=$('hgt'),M=+g.max,MV=10000,PZ=900,RMq=matchMedia('(prefers-reduced-motion: reduce)').matches,sv=$('hCurve'),NS='http://www.w3.org/2000/svg',W=320,H=150,P=24,xs=v=>P+v/7e6*(W-P-6);g.value=0;hv();sv.querySelectorAll('.hMk,.hBadge').forEach(e=>e.remove());const YR=[2012,2016,2020,2024];let st=performance.now(),off=0,pzEnd=0,last=0,lt=0;
const mark=k=>{const X=xs(k*210000),ln=document.createElementNS(NS,'line');ln.setAttribute('class','hMk');ln.setAttribute('x1',X);ln.setAttribute('x2',X);ln.setAttribute('y1',16);ln.setAttribute('y2',H-18);sv.insertBefore(ln,sv.querySelector('.ln0'));const gg=document.createElementNS(NS,'g');gg.setAttribute('class','hBadge');const a=50/2**(k-1),b2=50/2**k,tx=document.createElementNS(NS,'text');tx.setAttribute('x',W/2+20);tx.setAttribute('y',36);tx.setAttribute('text-anchor','middle');tx.textContent=L(`半減期! ${a}→${b2} BTC(${YR[k-1]}年)`,`Halving! ${a}→${b2} BTC (${YR[k-1]})`);gg.appendChild(tx);sv.appendChild(gg);const bb=tx.getBBox(),r=document.createElementNS(NS,'rect');r.setAttribute('x',bb.x-8);r.setAttribute('y',bb.y-4);r.setAttribute('width',bb.width+16);r.setAttribute('height',bb.height+8);r.setAttribute('rx',8);gg.insertBefore(r,tx);if(!RMq){gg.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});ln.animate([{opacity:0},{opacity:1}],{duration:200});$('hR').animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:450,easing:'ease-out'})}return gg};let badge=null;
const f=now=>{if(pzEnd){if(now<pzEnd){hT=requestAnimationFrame(f);return}off+=now-pzEnd+PZ-16;pzEnd=0;if(badge){const bd=badge;badge=null;if(RMq)bd.remove();else bd.animate([{opacity:1},{opacity:0}],{duration:250}).onfinish=()=>bd.remove()}}const t=Math.min(1,(now-st-off)/MV);let h=M*t*t;const k=Math.floor(h/210000);if(k>last&&last<4){last++;h=last*210000;st=st;off-=0;const tt=Math.sqrt(h/M);off=now-st-tt*MV;drawC(h);g.value=Math.round(h);hv(1);badge=mark(last);pzEnd=now+PZ;hT=requestAnimationFrame(f);return}drawC(h);window.__hX=h;if(now-lt>100||t>=1){lt=now;g.value=Math.round(h);hv(1)}if(t<1)hT=requestAnimationFrame(f);else window.__hDur=now-st};hT=requestAnimationFrame(f)};
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
const SP=1.12;const rate=()=>{if(!RM)S.getAnimations({subtree:true}).forEach(x=>x.playbackRate=1/SP)};const at=(ms,fn)=>tm.push(setTimeout(()=>{fn();rate()},RM?0:ms*SP)),clr=()=>{tm.forEach(clearTimeout);tm=[]};
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
$('fNext').onclick=()=>{stop();set(k>=L2.length-1?0:k+1)};$('fPrev').onclick=()=>{stop();set(Math.max(0,k-1))};$('fReset').onclick=()=>{stop();set(-1)};
L2.forEach((l,i)=>{l.onclick=e=>{e.preventDefault();stop();set(i)}});set(-1)})();

// intro
(()=>{const v=$('iView');if(!v)return;const T_=x=>window.T?window.T(x):x;
const show=all=>{$('iBank').setAttribute('aria-pressed',!all);$('iAll').setAttribute('aria-pressed',all);
v.innerHTML=all?`<div class="net">${'👤📒 '.repeat(6).trim().split(' ').map(x=>`<span>${x}</span>`).join('')}</div><p>${T_('台帳はみんなが同じものを持っています。1人がズルしても、ほかの全員と合わないのでバレます。')}</p>`:`<div class="net"><span>👤</span><span>👤</span><span class="big">🏦📒</span><span>👤</span><span>👤</span></div><p>${T_('台帳は銀行だけが持っています。銀行が書きかえたり、止めたりできます。')}</p>`};
$('iBank').onclick=()=>show(false);$('iAll').onclick=()=>show(true);show(false);
document.querySelectorAll('.rm0').forEach(b=>b.onclick=()=>go(chs.findIndex(c=>c.dataset.t==b.dataset.g)))})();

// 51% myth: catch-up chance (q/p)^z
(()=>{const z=$('zN');if(!z)return;const t=x=>window.T?window.T(x):x;const up=()=>{const q=+$('aP').value/100,p=1-q,n=+z.value,P=q>=p?1:Math.pow(q/p,n);$('zV').textContent=n;$('zB').style.width=(P*100)+'%';$('zT').textContent=t('計算力')+` ${Math.round(q*100)}% `+t('で追いつける確率')+`: ${P>=.9995?'100':P<.0001?'0.01'+t('未満'):(P*100).toFixed(P<.1?2:1)}%`};z.oninput=up;$('aP').addEventListener('input',up);up()})();
// myth widgets
(()=>{const s=$('hmS');if(s){const E=[[L('2009年ごろ','around 2009'),100],[L('2016年ごろ','around 2016'),97],[L('2024年ごろ','around 2024'),90],[L('ずっと先','far future'),55],[L('2140年ごろ以降','after ~2140'),0]];
const u=()=>{const[e,r]=E[+s.value];$('hmE').textContent=e;$('hmR').style.width=r+'%';$('hmF').style.width=(100-r)+'%';$('hmR').textContent=r>12?L('報酬','Reward')+' '+r+'%':'';$('hmF').textContent=100-r>12?L('手数料','Fees')+' '+(100-r)+'%':''};s.oninput=u;u()}
const y=$('ymY');if(y){const u=()=>{const v=Math.max(0,Math.min(1e7,+y.value||0)),sat=Math.round(v*10);$('ymS').textContent=sat.toLocaleString();$('ymB').textContent=(sat/1e8).toFixed(8);$('ymP').style.width=Math.max(.5,sat/1e8*100)+'%'};y.oninput=u;u()}
const qo=$('qOut');if(qo){const st=f=>{$('qNow').className=f?'ghost':'on';$('qFut').className=f?'on':'ghost';qo.innerHTML=f?`<span class="qi">🛠️</span><b>${L('対策を準備中','Preparing countermeasures')}</b><small>${L('もし十分に強い量子コンピュータができたら、今の署名は弱くなるおそれがあります。そのため、量子に強い新しい署名への切りかえが話し合われています。','If a strong enough quantum computer is ever built, today’s signatures could become weaker. That’s why a switch to quantum-resistant signatures is being discussed.')}</small>`:`<span class="qi">🛡️</span><b>${L('鍵は安全','Keys are safe')}</b><small>${L('今の量子コンピュータは、ビットコインの鍵を破れる力にはまだほど遠いです。','Today’s quantum computers are still far from able to break Bitcoin keys.')}</small>`};$('qNow').onclick=()=>st(0);$('qFut').onclick=()=>st(1);st(0)}})();
/* feel + toys */
(()=>{const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,$=id=>document.getElementById(id);
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};window.__bz=buzz;window.__bu=(e,n)=>burst(e,n);
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b||RM)return;let L=document.getElementById('ripL');if(!L){L=document.createElement('div');L.id='ripL';L.setAttribute('aria-hidden','true');document.body.appendChild(L)}const r=b.getBoundingClientRect(),s=document.createElement('i'),d=Math.max(r.width,r.height);s.className='rip';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-d/2}px;top:${e.clientY-d/2}px;color:${getComputedStyle(b).color}`;L.appendChild(s);setTimeout(()=>s.remove(),600)},{passive:true});
function burst(el,n=10){if(RM||!el)return;const r=el.getBoundingClientRect();if(!r.width)return;const w=document.createElement('div');w.className='spark';w.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+Math.min(r.height,60)/2}px`;for(let i=0;i<n;i++){const p=document.createElement('i'),a=Math.PI*2*i/n+Math.random()*.4,d=28+Math.random()*26;p.style.setProperty('--x',Math.cos(a)*d+'px');p.style.setProperty('--y',Math.sin(a)*d+'px');w.appendChild(p)}document.body.appendChild(w);setTimeout(()=>w.remove(),700)}
window.__burst=burst;
const seen=new WeakMap();
new MutationObserver(ms=>{for(const m of ms){const t=m.target.nodeType==1?m.target:m.target.parentElement;if(!t)continue;const A=m.type=='attributes';
 const res=A?null:t.closest('.res,.qres,#eRes');if(res){const raw=res.textContent,x=raw.replace(window.__icRE||/(?!)/g,'');if(seen.get(res)===x)continue;seen.set(res,x);const ic=c=>res.querySelector(c);if(/✅|⭕/.test(raw)||ic('.ic-ok,.ic-o')||/正解|成功|Correct|Success|found|見つかった/.test(x)){burst(res);buzz(12);res.classList.remove('pp');void res.offsetWidth;res.classList.add('pp')}else if(/❌/.test(raw)||ic('.ic-x')||/失敗|Wrong|fail/i.test(x))buzz([8,40,8])}
 const hs=A?null:t.closest('.hash,.hh,.pv,#mHash');if(hs&&!RM){hs.classList.remove('roll');void hs.offsetWidth;hs.classList.add('roll')}
 if(A&&t.classList.contains('blk')&&(m.oldValue||'').includes('bad')!=t.classList.contains('bad')){const was=(m.oldValue||'').includes('bad'),is=t.classList.contains('bad');if(is&&!was){buzz(15);t.classList.remove('snap');void t.offsetWidth;t.classList.add('crack')}else if(was&&!is){t.classList.remove('crack');void t.offsetWidth;t.classList.add('snap')}}
}}).observe(document.querySelector('main')||document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
document.addEventListener('input',e=>{const r=e.target;if(r.type!='range')return;const v=r.closest('label')?.querySelector('b');if(v&&!RM){v.classList.remove('vb');void v.offsetWidth;v.classList.add('vb')}});
document.addEventListener('click',e=>{const q=e.target.closest('.quiz button,.opts button,[data-ok]');if(q&&q.classList.contains('ok'))burst(q,8)});
const EN_=document.documentElement.lang=='en';
/* sats split */
let sp=0;const U=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8];
if($('tCoin')){$('tCoin').onclick=()=>{const c=$('tCoin');sp=sp>=8?0:sp+1;const n=U[sp];c.classList.remove('pp');void c.offsetWidth;c.classList.add('pp');buzz(8);
 $('tS').textContent=sp==0?'1 BTC':(EN_&&n==1e8?'100,000,000 pieces × 1 sat':EN_?`${n.toLocaleString('en')} pieces × ${(1e8/n).toLocaleString('en')} sats`:`${n.toLocaleString('ja')}個 × ${(1e8/n).toLocaleString('ja')}サトシ`);
 if(sp==8){$('tSn').textContent=L('もう分けられない!1BTC = 1億サトシ','Can’t split further! 1 BTC = 100 million sats');burst(c,14)}else $('tSn').textContent=L('コインをタップして分けてみよう','Tap the coin to split it');
 c.style.setProperty('--n',Math.min(sp,6))}}
})();
/* icons: replace emoji in UI text with an SVG sprite */
(()=>{const P={
tip:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',o:'<circle cx="12" cy="12" r="7.5"/>',ok:'<path d="M5 12.5l4.5 4.5L19 7"/>',
q:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4M12 17h.01"/>',
pick:'<path d="M4 20l9-9M6 6.5a13 13 0 0 1 11.5 11.5M11.5 9.5l3 3"/>',
bad:'<path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-1.8L14.3 21 12 19.2 9.7 21l-2.4-1.8z"/><path d="M9.5 10.5h.01M14.5 10.5h.01"/>',
book:'<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
game:'<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7.5 10.5v4M5.5 12.5h4M15 11.5h.01M17.5 13.5h.01"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4h-4z"/>',
warn:'<path d="M12 3.5l9.5 16.5h-19zM12 10v4M12 17h.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14.5 8.5l2 2"/>',
link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
coin:'<circle cx="12" cy="12" r="9"/><path d="M9 7.5h3.25a2.25 2.25 0 0 1 0 4.5H9zM9 12h3.75a2.25 2.25 0 0 1 0 4.5H9zM9 7.5v9M10.25 6v1.5M12.25 6v1.5M10.25 16.5V18M12.25 16.5V18"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.7"/>',
hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-2.8l-2-3.7a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
doc:'<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
bank:'<path d="M3 10l9-6 9 6M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 21h18"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/>',pen:'<path d="M4 20l4.5-1L19 8.5 15.5 5 5 15.5zM13.5 7l3.5 3.5"/>',
box:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>',
flame:'<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-8.5z"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',pause:'<path d="M9 5v14M15 5v14"/>',
dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 15h.01M15 9h.01M9 15h.01M12 12h.01"/>',
down:'<path d="M12 5v14M6 13l6 6 6-6"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',r:'<path d="M5 12h14M13 6l6 6-6 6"/>',l:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5"/>',
frown:'<circle cx="12" cy="12" r="9"/><path d="M8.5 16.5a5 5 0 0 1 7 0M9 9.5h.01M15 9.5h.01"/>',
sprout:'<path d="M12 21v-9M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
eyeoff:'<path d="M3 3l18 18M10.6 6.1Q11.3 6 12 6c5 0 9 6 9 6a15 15 0 0 1-2.8 3.4M6.6 7.6C4.2 9.3 3 12 3 12s4 6 9 6a8 8 0 0 0 3.4-.8"/>',
eye:'<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12h.01"/>',
pin:'<path d="M12 16v5M8 3h8l-1 6 3 4H6l3-4z"/>',send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
puzzle:'<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>',
radio:'<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
cart:'<path d="M3 4h2l2.5 11h11L21 8H6.3"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
pc:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 21h8M12 16v5"/>',
wallet:'<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M7 7l9-3.5L17 7M16 13.5h.01"/>',
tool:'<path d="M15 4a5 5 0 0 0-5.5 6.5L3.5 16.5l4 4 6-6A5 5 0 0 0 20 9l-3 3-3-3 3-3a5 5 0 0 0-2-2z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
s1:'<g class="f"><circle cx="12" cy="6.5" r="3.6"/><circle cx="17.2" cy="10.3" r="3.6"/><circle cx="15.2" cy="16.5" r="3.6"/><circle cx="8.8" cy="16.5" r="3.6"/><circle cx="6.8" cy="10.3" r="3.6"/></g>',
s2:'<path class="f" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/>',
s3:'<g class="f"><circle cx="8.5" cy="8.5" r="4"/><circle cx="15.5" cy="8.5" r="4"/><circle cx="8.5" cy="15.5" r="4"/><circle cx="15.5" cy="15.5" r="4"/></g>',
s4:'<path class="f" d="M6 14C4 8 8 3 12 3s8 5 6 11l2.5 5-3.3-1.7-1 3.2-2.2-3-2 3-2-3-2.2 3-1-3.2L3.5 19z"/>',
s5:'<path class="f" d="M3.5 6l5.5 3h6l5.5-3-1.5 8.5L12 21l-7-6.5z"/>'};
const M={'₿':'coin','💡':'tip','❌':'x','✗':'x','✕':'x','⭕':'o','✅':'ok','✓':'ok','🤔':'q','⛏':'pick','😈':'bad','📖':'book','⚡':'zap','🎮':'game','🏆':'trophy','⚠':'warn','⏳':'clock','⏰':'clock','🔑':'key','⛓':'link','🔗':'link','🪙':'coin','💰':'coin','🔒':'lock','🔏':'lock','🔓':'unlock','🙋':'hand','👋':'hand','📄':'doc','📝':'doc','📒':'book','📨':'mail','👤':'user','👩':'user','👨':'user','👧':'user','🧔':'user','🏦':'bank','🌍':'globe','🔍':'search','✍':'pen','✏':'pen','🖋':'pen','🧱':'box','📦':'box','🔥':'flame','🛡':'shield','⏸':'pause','🎲':'dice','⬇':'down','↓':'down','↑':'up','→':'r','←':'l','👾':'bot','🤖':'bot','😵':'frown','🔰':'sprout','🙈':'eyeoff','🕵':'eye','🎯':'target','📌':'pin','💸':'send','🧩':'puzzle','📡':'radio','🎉':'spark','🛒':'cart','🖥':'pc','👛':'wallet','🛠':'tool','🌸':'s1','⭐':'s2','🍀':'s3','🐙':'s4','🦝':'s5'};
const NM={coin:['ビットコイン','Bitcoin'],ok:['できた','OK'],o:['正しい','True'],x:['ちがう','Wrong'],s1:['花','Flower'],s2:['星','Star'],s3:['クローバー','Clover'],s4:['タコ','Octopus'],s5:['ナゾの形','Odd shape'],trophy:['トロフィー','Trophy'],flame:['連続','Streak']};
const EN=document.documentElement.lang=='en';
const sp=document.createElementNS('http://www.w3.org/2000/svg','svg');sp.setAttribute('aria-hidden','true');sp.style.cssText='position:absolute;width:0;height:0;overflow:hidden';sp.innerHTML=Object.entries(P).map(([k,v])=>`<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('');document.body.prepend(sp);
const keys=Object.keys(M).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const RE=new RegExp('('+keys.join('|')+')[\\uFE0F\\u200D]*','g');window.__icRE=RE;
const mk=(n,solo)=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','ic ic-'+n);s.innerHTML=`<use href="#i-${n}"/>`;if(solo&&NM[n]){s.setAttribute('role','img');s.setAttribute('aria-label',NM[n][EN?1:0])}else s.setAttribute('aria-hidden','true');return s};
const fix=t=>{const v=t.nodeValue;RE.lastIndex=0;if(!RE.test(v))return;const p=t.parentNode;if(!p||p.closest&&p.closest('svg,script,style,title'))return;
 if(p.tagName=='OPTION'){t.nodeValue=v.replace(RE,'').trim();return}
 const solo=!v.replace(RE,'').trim();const f=document.createDocumentFragment();let i=0;v.replace(RE,(m,k,o)=>{if(o>i)f.appendChild(document.createTextNode(v.slice(i,o).replace(/ $/,'')));f.appendChild(mk(M[k],solo));i=o+m.length});
 if(i<v.length)f.appendChild(document.createTextNode(v.slice(i).replace(/^ /,'')));p.replaceChild(f,t)};
const walk=r=>{if(r.nodeType==3)return fix(r);if(r.nodeType!=1||/^(SCRIPT|STYLE|svg)$/i.test(r.tagName))return;const w=document.createTreeWalker(r,4),a=[];let n;while(n=w.nextNode())a.push(n);a.forEach(fix)};
setTimeout(()=>{walk(document.body);const SK={contains:n=>{const e=n.nodeType==1?n:n.parentElement;return !!(e&&e.closest('#hH,#hY,#hR,#hN,#hS,#hCurve'))}};new MutationObserver(ms=>{for(const m of ms){if(SK&&SK.contains(m.target))continue;if(m.type=='characterData')fix(m.target);else m.addedNodes.forEach(walk)}}).observe(document.body,{childList:true,subtree:true,characterData:true});});
})();

/* intro network animation */
(()=>{const cv=document.getElementById('netC');if(!cv)return;const cx=cv.getContext('2d');const RM=matchMedia('(prefers-reduced-motion: reduce)');let W=0,H=0,dpr=1,N=[],B=[],P=null,S=[],run=false,raf=0,lastT=0,hop=0;
const col=()=>{const g=getComputedStyle(document.documentElement);const v=n=>g.getPropertyValue(n).trim();return{ln:v('--line2')||v('--line')||'#ddd',nd:v('--mut')||'#888',o:v('--o')||'#f7931a',bg:v('--soft')||'transparent'}};let C=col();
const rnd=(a,b)=>a+Math.random()*(b-a);
const size=()=>{const r=cv.getBoundingClientRect();if(!r.width)return;dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};
const addNode=(x,y)=>{N.push({x,y,vx:rnd(-.08,.08),vy:rnd(-.08,.08),r:rnd(2.2,3.4),b:0});if(N.length>26)N.shift()};
const init=()=>{size();N=[];const n=Math.round(Math.max(10,Math.min(18,W/26)));for(let i=0;i<n;i++)addNode(rnd(16,W-16),rnd(16,H-62));B=[];for(let i=0;i<4;i++)B.push({x:0,a:1});layB()};
const BW=22,BG=12;const layB=()=>{const tot=B.length*(BW+BG)-BG;let x=(W-tot)/2;B.forEach(b=>{b.tx=x;if(!b.x)b.x=x;x+=BW+BG})};
const addBlock=()=>{B.push({x:W+BW,a:0,f:1});if(B.length>Math.floor((W-40)/(BW+BG)))B.shift();layB()};
const near=a=>N.filter(b=>b!==a&&Math.hypot(a.x-b.x,a.y-b.y)<Math.min(110,W/3));
const newPulse=from=>{const a=from||N[Math.floor(Math.random()*N.length)];P={a,b:null,t:0,seen:new Set([a]),hops:0};nextHop()};
const nextHop=()=>{const c=near(P.a).filter(n=>!P.seen.has(n));if(!c.length||P.hops>=5){P.a.b=1;addBlock();spark(P.a.x,P.a.y,6);P=null;return}P.b=c[Math.floor(Math.random()*c.length)];P.t=0};
const spark=(x,y,n)=>{if(RM.matches)return;for(let i=0;i<n;i++){const a=Math.random()*6.28,s=rnd(.6,1.8);S.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1})}};
const draw=()=>{cx.clearRect(0,0,W,H);
for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=N[i],b=N[j],d=Math.hypot(a.x-b.x,a.y-b.y),m=Math.min(110,W/3);if(d<m){cx.globalAlpha=(1-d/m)*.9;cx.strokeStyle=C.ln;cx.lineWidth=1;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
cx.globalAlpha=1;N.forEach(n=>{if(n.b>0){cx.globalAlpha=n.b*.35;cx.fillStyle=C.o;cx.beginPath();cx.arc(n.x,n.y,n.r+8*n.b,0,6.28);cx.fill();cx.globalAlpha=1}cx.fillStyle=n.b>.05?C.o:C.nd;cx.beginPath();cx.arc(n.x,n.y,n.r,0,6.28);cx.fill()});
if(P&&P.b){const x=P.a.x+(P.b.x-P.a.x)*P.t,y=P.a.y+(P.b.y-P.a.y)*P.t;cx.strokeStyle=C.o;cx.globalAlpha=.8;cx.lineWidth=1.6;cx.beginPath();cx.moveTo(P.a.x,P.a.y);cx.lineTo(x,y);cx.stroke();cx.globalAlpha=.25;cx.fillStyle=C.o;cx.beginPath();cx.arc(x,y,9,0,6.28);cx.fill();cx.globalAlpha=1;cx.beginPath();cx.arc(x,y,4,0,6.28);cx.fill()}
const by=H-30;cx.lineWidth=1.5;B.forEach((b,i)=>{if(i){const p=B[i-1];cx.globalAlpha=Math.min(b.a,p.a)*.8;cx.strokeStyle=C.nd;cx.beginPath();cx.moveTo(p.x+BW,by);cx.lineTo(b.x,by);cx.stroke()}cx.globalAlpha=b.a;cx.strokeStyle=b.f>0?C.o:C.nd;cx.fillStyle=C.o;cx.beginPath();cx.roundRect?cx.roundRect(b.x,by-BW/2,BW,BW,5):cx.rect(b.x,by-BW/2,BW,BW);if(b.f>0){cx.globalAlpha=b.a*b.f*.5;cx.fill();cx.globalAlpha=b.a}cx.stroke()});cx.globalAlpha=1;
S.forEach(s=>{cx.globalAlpha=s.l;cx.fillStyle=C.o;cx.beginPath();cx.arc(s.x,s.y,1.6,0,6.28);cx.fill()});cx.globalAlpha=1};
const step=dt=>{const k=dt/16.7;N.forEach(n=>{n.x+=n.vx*k;n.y+=n.vy*k;if(n.x<10||n.x>W-10)n.vx*=-1;if(n.y<10||n.y>H-60)n.vy*=-1;n.b=Math.max(0,n.b-.012*k)});
if(P&&P.b){P.t+=.022*k;if(P.t>=1){P.a=P.b;P.a.b=.8;P.seen.add(P.a);P.hops++;nextHop()}}else if(!P){hop+=dt;if(hop>900){hop=0;newPulse()}}
B.forEach(b=>{b.x+=(b.tx-b.x)*Math.min(1,.08*k);b.a=Math.min(1,b.a+.04*k);if(b.f>0)b.f=Math.max(0,b.f-.006*k)});
S.forEach(s=>{s.x+=s.vx*k;s.y+=s.vy*k;s.l-=.03*k});S=S.filter(s=>s.l>0)};
const loop=t=>{const dt=Math.min(50,t-(lastT||t));lastT=t;step(dt);draw();if(run)raf=requestAnimationFrame(loop)};
const start=()=>{if(run||RM.matches)return;run=true;lastT=0;raf=requestAnimationFrame(loop)},stop=()=>{run=false;cancelAnimationFrame(raf)};
const still=()=>{for(let i=0;i<3;i++)N[i*3%N.length].b=.6;B.forEach(b=>{b.x=b.tx;b.a=1});draw()};
new IntersectionObserver(e=>{if(e[0].isIntersecting){if(!W)init();RM.matches?still():start()}else stop()}).observe(cv);
document.addEventListener('visibilitychange',()=>document.hidden?stop():(cv.getClientRects().length&&!RM.matches&&start()));
addEventListener('resize',()=>{if(!W)return;const ow=W;size();if(Math.abs(W-ow)>1){N.forEach(n=>{n.x=Math.min(n.x*W/ow,W-10)});layB()}draw()});
new MutationObserver(()=>{C=col();draw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
cv.addEventListener('pointerdown',e=>{if(!W)init();const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=Math.min(e.clientY-r.top,H-62);addNode(x,y);const n=N[N.length-1];n.b=1;spark(x,y,10);try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}if(RM.matches){addBlock();B.forEach(b=>{b.x=b.tx;b.a=1});draw()}else if(!P||!P.b)newPulse(n)});
})();
