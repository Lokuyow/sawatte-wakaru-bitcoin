const $=id=>document.getElementById(id),enc=new TextEncoder();
async function sha(s){const b=await crypto.subtle.digest('SHA-256',enc.encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
// nav
const chs=[...document.querySelectorAll('.ch')];let cur=0;const seen=new Set();
chs.forEach((c,i)=>{const s=document.createElement('span');s.textContent=(i+1)+' '+c.dataset.t;s.onclick=()=>go(i);$('prog').append(s)});
function go(i){cur=Math.max(0,Math.min(chs.length-1,i));seen.add(cur);chs.forEach((c,j)=>c.classList.toggle('on',j==cur));[...$('prog').children].forEach((s,j)=>{s.className=j==cur?'on':seen.has(j)?'seen':''});$('prev').disabled=cur==0;$('next').style.visibility=cur==chs.length-1?'hidden':'visible';scrollTo(0,0)}
$('prev').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);$('again').onclick=()=>go(0);go(0);
// 1 hash
async function h1(){const t=$('hIn').value;$('hOut').textContent=await sha(t);const t2=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');const a=$('hOut').textContent,b=await sha(t2);$('hOut2').innerHTML=[...b].map((c,i)=>c==a[i]?c:'<i>'+c+'</i>').join('');let d=0;for(let i=0;i<64;i++)if(a[i]!=b[i])d++;$('hDiff').textContent=`「${t2}」のハッシュ(緑が変わった文字): 64文字中 ${d}文字ちがう!`}
$('hIn').oninput=h1;$('hTweak').onclick=()=>{const t=$('hIn').value;$('hIn').value=t.slice(0,-1)+(t.slice(-1)=='ン'?'ソ':'ン');h1()};h1();
// 2 chain
const init=['アリス→ボブ 2コイン','ボブ→キャロル 1コイン','キャロル→デイブ 1コイン','デイブ→アリス 3コイン'];let data=[...init],good=[];
async function chain(build){const el=$('chain');let prev='0'.repeat(64),hs=[];for(let i=0;i<data.length;i++){const h=await sha(i+prev+data[i]);hs.push({prev,h});prev=h}
if(!good.length)good=hs.map(x=>x.h);
if(build){el.innerHTML='';hs.forEach((x,i)=>{el.insertAdjacentHTML('beforeend',`<div class="blk" id="b${i}"><b>ブロック #${i}</b><br>データ:<input data-i="${i}" value="${data[i]}">前のハッシュ:<div class="hash pv"></div>このハッシュ:<div class="hash hh"></div><div class="st"></div></div>`)});el.querySelectorAll('input').forEach(n=>n.oninput=()=>{data[n.dataset.i]=n.value;chain()})}
let broken=false;hs.forEach((x,i)=>{const b=$('b'+i);// stored prev = good chain's prev
const storedPrev=i?good[i-1]:'0'.repeat(64);const myH=x.h;if(i&&myHash[i-1]!==storedPrev)broken=true;b.classList.toggle('bad',broken);b.querySelector('.pv').textContent=storedPrev.slice(0,20)+'…';b.querySelector('.hh').textContent=myH.slice(0,20)+'…';b.querySelector('.st').textContent=broken?'❌ 前のハッシュと合わへん!':'✅ つながってる'});}
let myHash=[];const _c=chain;chain=async b=>{let prev='0'.repeat(64);myHash=[];for(let i=0;i<data.length;i++){// each block's own hash uses its stored prev
const p=i?good[i-1]:prev;myHash.push(await sha(i+p+data[i]))}return _c(b)};
$('cReset').onclick=()=>{data=[...init];chain(true)};chain(true);
// 3 mining
$('diff').oninput=()=>$('dV').textContent=$('diff').value;let mining=false;
$('mGo').onclick=async()=>{if(mining)return;mining=true;$('mGo').disabled=true;const n=+$('diff').value,z='0'.repeat(n);let nonce=0,h;const t0=performance.now();
while(true){h=await sha('ブロック#5 アリス→ボブ'+nonce);if(h.startsWith(z))break;nonce++;if(nonce%200==0){$('mNonce').textContent=nonce;$('mTry').textContent=nonce+1;$('mHash').textContent=h;await new Promise(r=>setTimeout(r))}}
$('mNonce').textContent=nonce;$('mTry').textContent=nonce+1;$('mHash').innerHTML='<i>'+z+'</i>'+h.slice(n)+` <br>🎉 見つけた!(${((performance.now()-t0)/1000).toFixed(1)}秒)`;mining=false;$('mGo').disabled=false};
// 4 sig
let kp,sig,signed;const alg={name:'ECDSA',namedCurve:'P-256'},sa={name:'ECDSA',hash:'SHA-256'};
$('sKey').onclick=async()=>{kp=await crypto.subtle.generateKey(alg,true,['sign','verify']);$('sPub').textContent='公開鍵(みんなに見せてOK): '+hex(await crypto.subtle.exportKey('raw',kp.publicKey)).slice(0,48)+'…  秘密鍵: 🔒アリスだけが持ってる(表示せえへん)';sig=null;$('sSig').textContent='';$('sRes').textContent=''};
$('sSign').onclick=async()=>{if(!kp)await $('sKey').onclick();signed=$('sMsg').value;sig=await crypto.subtle.sign(sa,kp.privateKey,enc.encode(signed));$('sSig').textContent='署名: '+hex(sig).slice(0,48)+'…';$('sCheck').value=signed;$('sRes').textContent=''};
$('sVer').onclick=async()=>{if(!sig){$('sRes').textContent='先に署名してな';return}const ok=await crypto.subtle.verify(sa,kp.publicKey,sig,enc.encode($('sCheck').value));$('sRes').innerHTML=ok?'<span style="color:var(--ok)">✅ 本物!アリスの署名や</span>':'<span style="color:var(--ng)">❌ 確認失敗!中身がいじられとる</span>'};
// 5 ledger
const ppl=[['アリス','👩'],['ボブ','👨'],['キャロル','👧'],['デイブ','🧔']];let bal={アリス:5,ボブ:2,キャロル:0,デイブ:1};
function rp(){$('people').innerHTML=ppl.map(([n,e])=>`<div class="p">${e}<div>${n}<br><b>${bal[n]}</b> コイン</div></div>`).join('')}
['tFrom','tTo'].forEach((s,k)=>$(s).innerHTML=ppl.map(([n],i)=>`<option ${i==k?'selected':''}>${n}</option>`).join(''));
function tx(f,t,a){const li=document.createElement('li');if(f==t||!(a>0)){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}: おかしな取引や`}else if(bal[f]<a){li.className='ng';li.textContent=`❌ ${f}→${t} ${a}コイン: 台帳を見たら${f}は${bal[f]}コインしか持ってへん。却下!`}else{bal[f]-=a;bal[t]+=a;li.className='ok';li.textContent=`✅ ${f}→${t} ${a}コイン: みんなで確認してOK、台帳に記録`}$('log').prepend(li);rp()}
$('tSend').onclick=()=>tx($('tFrom').value,$('tTo').value,+$('tAmt').value);
$('tDouble').onclick=()=>{const a=bal['アリス'];if(!a){tx('アリス','ボブ',1);return}tx('アリス','ボブ',a);tx('アリス','キャロル',a)};rp();
// 6 halving
function hv(){const h=+$('hgt').value,n=Math.floor(h/210000);let r=n<64?Math.floor(5e9/2**n):0,s=0;for(let i=0;i<=n&&i<64;i++){const sat=Math.floor(5e9/2**i),blocks=i<n?210000:h-i*210000+1;s+=sat*blocks}
$('hH').textContent=h.toLocaleString();$('hN').textContent=n;$('hR').textContent=(r/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hS').textContent=(s/1e8).toLocaleString('ja',{maximumFractionDigits:8});$('hBar').style.width=(s/2.1e15*100)+'%'}
$('hgt').oninput=hv;hv();
