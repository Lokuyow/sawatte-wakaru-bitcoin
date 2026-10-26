const $=id=>document.getElementById(id),enc=new TextEncoder();
async function sha(s){const b=await crypto.subtle.digest('SHA-256',enc.encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
// nav
const chs=[...document.querySelectorAll('.ch')];let cur=0;const seen=new Set();
chs.forEach((c,i)=>{const s=document.createElement('span');s.title=(i+1)+' '+c.dataset.t;s.onclick=()=>go(i);$('prog').append(s)});
function go(i){cur=Math.max(0,Math.min(chs.length-1,i));seen.add(cur);chs.forEach((c,j)=>c.classList.toggle('on',j==cur));[...$('prog').children].forEach((s,j)=>{s.className=j==cur?'on':seen.has(j)?'seen':''});$('prev').disabled=cur==0;$('next').style.visibility=cur==chs.length-1?'hidden':'visible';$('pos').textContent=(cur+1)+' / '+chs.length;scrollTo(0,0)}
$('prev').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);$('again').onclick=()=>go(0);go(0);
$('start').onclick=()=>{$('hero').hidden=true;$('app').hidden=false;go(0)};
const U='https://lokuyow.github.io/sawatte-wakaru-bitcoin/';
$('share').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('「さわってわかるビットコイン」7章ぜんぶクリアした!ハッシュもマイニングも署名も、さわったら意外とわかる ₿')+'&url='+encodeURIComponent(U);
// quizzes
const Q=[['ちょっと試してみよ: 「。」を1個足したら、ハッシュはどうなる?',['ちょっとだけ変わる','まるっきり別モンになる','変わらへん'],1,'1文字でも変わると、指紋はほぼ全部入れかわる。だから改ざんがすぐバレるんや。'],
['ブロック#1のデータを書きかえたら、こわれるのはどこ?',['ブロック#1だけ','#1より前ぜんぶ','#1の次から後ろぜんぶ'],2,'#1のハッシュが変わるから、それを「前のハッシュ」として持ってる#2以降がつながらんくなる。'],
['むずかしさを3→4にしたら、だいたい何倍たいへん?',['2倍','16倍','4倍'],1,'ハッシュは16進数。先頭の1文字が0になる確率は1/16やから、0を1個増やすと約16倍。'],
['署名を確かめるのに必要なのはどれ?',['公開鍵','秘密鍵','パスワード'],0,'確認は公開鍵だけでできる。秘密鍵は署名する本人だけが持っとくもんや。'],
['アリスが5コインを、ボブとキャロルに同時に5コインずつ送ろうとしたら?',['両方とおる','先に記録された方だけとおる','両方はじかれる'],1,'みんなの台帳で先に記録された方が有効。2つ目は「もう持ってへん」ではじかれる。'],
['発行されるビットコインの合計は?',['無限に増える','ぴったり2100万BTCを超える','2100万BTCちょっと手前で止まる'],2,'報酬が半分ずつになっていくから、合計は2100万BTCにじわじわ近づいて止まるんや。']];
Q.forEach(([q,o,k,e],i)=>{const d=document.createElement('div');d.className='quiz';d.innerHTML=`<h3>💡 1問クイズ</h3><p>${q}</p><div class="opts">${o.map((x,j)=>`<button data-j="${j}">${x}</button>`).join('')}</div><div class="ans" hidden></div>`;chs[i].append(d);
d.querySelectorAll('button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.j==k;b.classList.add(ok?'right':'wrong');if(!ok)b.classList.add('shake');else{d.querySelectorAll('button').forEach(x=>x.disabled=x!=b);const a=d.querySelector('.ans');a.hidden=false;a.textContent='⭕ せいかい! '+e}})});
// hash flip render
function flipTo(el,h,old){el.innerHTML=[...h].map((c,i)=>`<span${old&&old[i]!=c?' class="flip"':''}>${c}</span>`).join('')}
// 1 hash
let lastH='';async function h1(){const t=$('hIn').value;const a=await sha(t);flipTo($('hOut'),a,lastH);lastH=a;const t2=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');const b=await sha(t2);$('hOut2').innerHTML=[...b].map((c,i)=>c==a[i]?c:'<i>'+c+'</i>').join('');let d=0;for(let i=0;i<64;i++)if(a[i]!=b[i])d++;$('hDiff').textContent=`↑「${t2}」のハッシュ(緑が変わった文字): 64文字中 ${d}文字ちがう!`}
$('hIn').oninput=h1;$('hTweak').onclick=()=>{const t=$('hIn').value;$('hIn').value=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');h1()};h1();
// 2 chain: each block stores the ORIGINAL prev hash; editing changes its own hash
const init=['アリス→ボブ 2コイン','ボブ→キャロル 1コイン','キャロル→デイブ 1コイン','デイブ→アリス 3コイン'];let data=[...init],good=[];
const Z='0'.repeat(64);
async function chain(build){const el=$('chain');const hs=[];for(let i=0;i<data.length;i++)hs.push(await sha(i+(i?good[i-1]||hs[i-1]:Z)+data[i]));if(!good.length)good=[...hs];
if(build){el.innerHTML='';data.forEach((d,i)=>el.insertAdjacentHTML('beforeend',`<div class="blk" id="b${i}"><b>ブロック #${i}</b><br>データ:<input data-i="${i}">前のハッシュ:<div class="hash pv"></div>このハッシュ:<div class="hash hh"></div><div class="st"></div></div>`));el.querySelectorAll('input').forEach(n=>{n.value=data[n.dataset.i];n.oninput=()=>{data[n.dataset.i]=n.value;chain()}})}
let broken=false;hs.forEach((h,i)=>{const b=$('b'+i),was=b.className;const edited=h!==good[i]&&!broken;const bad=broken;
b.className='blk'+(edited?' edit':bad?' bad':'');if(b.className!=was&&b.className!='blk')b.classList.add('shake');
b.querySelector('.pv').textContent=(i?good[i-1]:Z).slice(0,16)+'…';b.querySelector('.hh').textContent=h.slice(0,16)+'…';
b.querySelector('.st').textContent=edited?'✏️ 書きかえた → ハッシュが変わった':bad?'❌ 前のハッシュと合わへん!':'✅ つながってる';if(h!==good[i])broken=true});}
$('cReset').onclick=()=>{data=[...init];chain(true)};chain(true);
// 3 mining (small async batches so the UI stays responsive)
$('diff').oninput=()=>$('dV').textContent=$('diff').value;let mining=false;
$('mGo').onclick=async()=>{if(mining)return;mining=true;$('mGo').disabled=true;$('mHash').className='hash';const n=+$('diff').value,z='0'.repeat(n);let nonce=0,h;const t0=performance.now();
outer:while(true){const tb=performance.now();while(performance.now()-tb<12){h=await sha('ブロック#5 アリス→ボブ'+nonce);if(h.startsWith(z))break outer;nonce++}
$('mNonce').textContent=nonce.toLocaleString();$('mTry').textContent=(nonce+1).toLocaleString();$('mHash').textContent=h;await new Promise(r=>setTimeout(r))}
$('mNonce').textContent=nonce.toLocaleString();$('mTry').textContent=(nonce+1).toLocaleString();$('mHash').innerHTML='<i>'+z+'</i>'+h.slice(n)+`<br>見つけた!(${((performance.now()-t0)/1000).toFixed(1)}秒)`;$('mHash').className='hash found burst';mining=false;$('mGo').disabled=false};
// 4 sig
let kp,sig,signed;const alg={name:'ECDSA',namedCurve:'P-256'},sa={name:'ECDSA',hash:'SHA-256'};
$('sKey').onclick=async()=>{kp=await crypto.subtle.generateKey(alg,true,['sign','verify']);$('sPub').textContent='公開鍵(みんなに見せてOK): '+hex(await crypto.subtle.exportKey('raw',kp.publicKey)).slice(0,48)+'…  秘密鍵: 🔒アリスだけが持ってる(表示せえへん)';sig=null;$('sSig').textContent='';$('sRes').textContent=''};
$('sSign').onclick=async()=>{if(!kp)await $('sKey').onclick();signed=$('sMsg').value;sig=await crypto.subtle.sign(sa,kp.privateKey,enc.encode(signed));$('sSig').textContent='署名: '+hex(sig).slice(0,48)+'…';$('sCheck').value=signed;$('sRes').textContent=''};
$('sVer').onclick=async()=>{if(!sig){$('sRes').textContent='先に署名してな';return}const ok=await crypto.subtle.verify(sa,kp.publicKey,sig,enc.encode($('sCheck').value));$('sRes').innerHTML=ok?'<span style="color:var(--ok)">✅ 本物!アリスの署名や</span>':'<span style="color:var(--ng)">❌ 確認失敗!中身がいじられとる</span>'};
// 5 ledger
const ppl=[['アリス','👩'],['ボブ','👨'],['キャロル','👧'],['デイブ','🧔']];let bal={アリス:5,ボブ:2,キャロル:0,デイブ:1};
function rp(){$('people').innerHTML=ppl.map(([n,e])=>`<div class="p">${e}<div>${n}<br><b>${bal[n]}</b> コイン</div></div>`).join('')}
['tFrom','tTo'].forEach((s,k)=>$(s).innerHTML=ppl.map(([n],i)=>`<option ${i==k?'selected':''}>${n}</option>`).join(''));
function tx(f,t,a){const li=document.createElement('li');if(f==t||!(a>0)){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}: おかしな取引や`}else if(bal[f]<a){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}コイン: 台帳を見たら${f}は${bal[f]}コインしか持ってへん。却下!`}else{bal[f]-=a;bal[t]+=a;li.className='ok';li.textContent=`✅ ${f}→${t} ${a}コイン: みんなで確認してOK、台帳に記録`}$('log').prepend(li);rp();if(li.className=='ng')document.querySelectorAll('.p')[ppl.findIndex(p=>p[0]==f)]?.classList.add('bump')}
$('tSend').onclick=()=>tx($('tFrom').value,$('tTo').value,+$('tAmt').value);
$('tDouble').onclick=()=>{const a=bal['アリス'];if(!a){tx('アリス','ボブ',1);return}tx('アリス','ボブ',a);tx('アリス','キャロル',a)};rp();
// 6 halving
function hv(){const h=+$('hgt').value,n=Math.floor(h/210000);let r=n<64?Math.floor(5e9/2**n):0,s=0;for(let i=0;i<=n&&i<64;i++){const sat=Math.floor(5e9/2**i),blocks=i<n?210000:h-i*210000+1;s+=sat*blocks}
$('hH').textContent=h.toLocaleString();$('hN').textContent=n;$('hR').textContent=(r/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hS').textContent=(s/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hBar').style.width=(s/2.1e15*100)+'%'}
$('hgt').oninput=hv;hv();
