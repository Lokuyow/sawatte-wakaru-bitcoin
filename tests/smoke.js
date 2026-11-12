const {chromium}=require('playwright');
const fs=require('fs');
const exe=['/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>fs.existsSync(p));
const launch=()=>chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage']});
const hit=(a,b)=>{const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return x>0.5&&y>0.5};
const box=async(page,sel)=>page.locator(sel).first().evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}});

(async()=>{
const b=await launch();let fail=0;const bad=[];
const note=(m)=>{bad.push(m);console.log('BAD',m)};
async function boot(w,h,lang,theme){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:theme==='dark'?'dark':'light'});
  const p=await c.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(({lang,theme})=>{try{localStorage.clear();if(lang==='en')localStorage.setItem('sw-lang','en');if(theme)localStorage.setItem('sw-theme',theme)}catch(e){}},{lang,theme});
  await p.goto('http://localhost:8765/',{waitUntil:'load'});
  await p.click('#start');
  return {p,c,errs};
}
async function halvingWords(p){
  return p.evaluate(()=>{
    const ALLOW='この、報酬が半分になることをハービング（halving）と呼びます。半減期とも呼ばれます。';
    const bad=[];
    const w=document.createTreeWalker(document.body,4);
    let n;while(n=w.nextNode()){
      const pe=n.parentElement;
      if(pe&&pe.closest('script,style'))continue;
      const t=(n.nodeValue||'');
      if(!t.includes('半減期')||t.trim()===ALLOW)continue;
      bad.push(t.trim().slice(0,90));
    }
    for(const e of document.querySelectorAll('*')){
      if(!e.getAttribute)continue;
      for(const a of ['aria-label','title','alt','placeholder']){
        const v=e.getAttribute(a);
        if(v&&v.includes('半減期')&&v.trim()!==ALLOW)bad.push('@'+a+':'+v.slice(0,90));
      }
    }
    return bad;
  });
}
async function walk(p,lang){
  const n=await p.locator('.ch').count();const ov=[];const words=[];
  for(let i=0;i<n;i++){
    await p.evaluate(i=>{document.querySelectorAll('#prog span')[i].click()},i);
    await p.waitForTimeout(40);
    const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(o>1)ov.push(i+':'+await p.evaluate(()=>document.querySelector('.ch.on').dataset.t));
    if(lang==='ja')words.push(...await halvingWords(p));
  }
  return {n,ov,words:[...new Set(words)]};
}
// layout + translation sweep
for(const [w,h,lang,theme] of [[375,812,'ja','light'],[375,812,'en','light'],[1280,900,'ja','light'],[375,812,'ja','dark'],[1280,900,'en','dark']]){
  const {p,c,errs}=await boot(w,h,lang,theme);
  const {n,ov,words}=await walk(p,lang);
  const stage1=await p.evaluate(()=>document.querySelectorAll('.ch[data-p="1"]').length);
  const title=await p.evaluate(()=>{const s=[...document.querySelectorAll('.ch')].find(c=>c.dataset.t==='かたまり');return s.querySelector('h2').textContent});
  const miss=lang==='en'?await p.evaluate(()=>[...window.__miss]):[];
  if(n<18)note(w+lang+theme+' pages '+n);
  if(stage1!==4)note(w+lang+' stage1 '+stage1);
  if(/^(\s|1-4)*UTXO/i.test(title)||title.trim().startsWith('UTXO'))note('title leads with UTXO '+title);
  if(ov.length)note(w+' '+h+' '+lang+' '+theme+' overflow '+ov.join(','));
  if(errs.length)note(w+lang+theme+' errors '+errs.join('|'));
  if(miss.length)note(w+lang+' miss '+JSON.stringify(miss.slice(0,12)));
  if(words&&words.length)note(w+lang+' visible 半減期 '+JSON.stringify(words.slice(0,8)));
  console.log('walk',w,h,lang,theme,'pages',n,'stage1',stage1,'ov',ov.length,'err',errs.length,'miss',miss.length);
  await c.close();
}
// interactions at phone width
for(const [h,lang] of [[812,'ja'],[667,'ja'],[812,'en'],[667,'en']]){
  const {p,c,errs}=await boot(375,h,lang,'light');
  const go=async t=>p.evaluate(t=>{const i=[...document.querySelectorAll('.ch')].findIndex(c=>c.dataset.t===t);document.querySelectorAll('#prog span')[i].click()},t);
  // 1-4 idle is compact, then send 1 from the 2.5-coin piece
  await go('かたまり');
  await p.waitForTimeout(450);
  const idle=await p.evaluate(()=>{
    const sec=document.querySelector('.ch[data-t="かたまり"]');
    const words=sec.querySelector('.words'),ux=sec.querySelector('#ux');
    const btns=[...document.querySelectorAll('#uxAmt button')];
    const bg=b=>getComputedStyle(b).backgroundColor;
    const on=btns.filter(b=>b.classList.contains('on'));
    const off=btns.filter(b=>!b.classList.contains('on'));
    return {
      hint:(document.getElementById('uxHint')||{}).textContent||'',
      uxAh:document.getElementById('uxA').getBoundingClientRect().height,
      amtTop:document.getElementById('uxAmt').getBoundingClientRect().top+scrollY,
      msg:getComputedStyle(document.getElementById('uxMsg')).display,
      tx:document.getElementById('uxTx').hidden,
      term:!!document.getElementById('uxTerm'),
      alice:[...document.querySelectorAll('#uxA .tama')].map(e=>e.dataset.amt+e.dataset.state),
      bob:document.querySelectorAll('#uxB .tama').length,
      letters:/コイン[A-Z]/.test(sec.innerText),
      gloss:words?words.innerText:'',
      glossBefore:!!(words&&ux&&(words.compareDocumentPosition(ux)&4)),
      amtOn:on.map(b=>b.textContent.trim()),
      amtSame:!!(on[0]&&off.some(b=>bg(b)===bg(on[0])))
    };
  });
  if(idle.msg!=='none'||idle.tx!==true||idle.term)note(lang+' 1-4 idle gap '+JSON.stringify(idle));
  if(idle.alice.join(',')!=='2.5live,1live,0.5live'||idle.bob!==0||idle.letters)note(lang+' start coins '+JSON.stringify(idle));
  if(!idle.glossBefore||!/UTXO/.test(idle.gloss)||!/Unspent Transaction Output/.test(idle.gloss))note(lang+' glossary '+idle.gloss);
  if(lang==='ja'&&(!/まだ使われていないコイン/.test(idle.gloss)||!/同じコイン玉を2回使おうとするズル/.test(idle.gloss)))note('ja glossary '+idle.gloss);
  if(lang==='en'&&!/Trying to use the same coin piece twice/.test(idle.gloss))note('en glossary '+idle.gloss);
  if(idle.amtOn.length||idle.amtSame)note(lang+' amount highlight '+JSON.stringify(idle.amtOn)+' same '+idle.amtSame);
  if(lang==='ja'&&!/コイン玉をタップ/.test(idle.hint))note('ja 1-4 hint idle '+idle.hint);
  if(lang==='en'&&!/tap a coin/i.test(idle.hint))note('en 1-4 hint idle '+idle.hint);
  await p.locator('#uxA .tama[data-amt="2.5"]').click();
  await p.locator('#uxAmt button[data-u="3"]').click();
  const picked=await p.evaluate(()=>{
    const btns=[...document.querySelectorAll('#uxAmt button')];
    const bg=b=>getComputedStyle(b).backgroundColor;
    const on=btns.filter(b=>b.classList.contains('on'));
    const off=btns.filter(b=>!b.classList.contains('on'));
    return {on:on.map(b=>b.textContent.trim()),same:!!(on[0]&&off.some(b=>bg(b)===bg(on[0]))),go:document.getElementById('uxGo').textContent,tamaBg:getComputedStyle(document.querySelector('.tama.on')).backgroundColor,hint:document.getElementById('uxHint').textContent};
  });
  if(picked.on.join(',')!=='1.5'||picked.same||!/1\.5/.test(picked.go))note(lang+' amount 1.5 '+JSON.stringify(picked));
  if(picked.tamaBg!=='rgba(0, 0, 0, 0)')note(lang+' tama selected bg '+picked.tamaBg);
  if(lang==='ja'&&!/ボタンを押して送るだけ/.test(picked.hint))note('ja 1-4 hint ready '+picked.hint);
  if(lang==='en'&&!/press the button/i.test(picked.hint))note('en 1-4 hint ready '+picked.hint);
  await p.locator('#uxAmt button[data-u="2"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ok');
  const after=await p.evaluate(()=>({
    uxAh:document.getElementById('uxA').getBoundingClientRect().height,
    amtTop:document.getElementById('uxAmt').getBoundingClientRect().top+scrollY,
    alice:[...document.querySelectorAll('#uxA .tama')].map(e=>({a:e.dataset.amt,s:e.dataset.state,id:e.dataset.id})),
    bob:[...document.querySelectorAll('#uxB .tama')].map(e=>({a:e.dataset.amt,s:e.dataset.state,id:e.dataset.id})),
    tx:document.getElementById('uxTx').innerText,
    term:!!document.getElementById('uxTerm'),
    msg:document.getElementById('uxMsg').textContent,
    gloss:document.querySelector('.ch[data-t="かたまり"] .words').innerText
  }));
  const spent=after.alice.find(c=>c.s==='spent'&&c.a==='2.5');
  const keep1=after.alice.find(c=>c.s==='live'&&c.a==='1');
  const keep05=after.alice.find(c=>c.s==='live'&&c.a==='0.5');
  const change=after.alice.find(c=>c.s==='live'&&c.a==='1.5');
  const got=after.bob.find(c=>c.s==='live'&&c.a==='1');
  if(!spent||!keep1||!keep05||!change||!got||after.bob.length!==1)note(lang+' send result '+JSON.stringify(after));
  if(Math.abs(after.uxAh-idle.uxAh)>1||Math.abs(after.amtTop-idle.amtTop)>1)note(lang+' 1-4 layout shift '+JSON.stringify({a:idle.uxAh,b:after.uxAh,c:idle.amtTop,d:after.amtTop}));
  if(lang==='ja'&&(!/2\.5コイン玉/.test(after.tx)||!/1コイン玉/.test(after.tx)||!/1\.5コイン玉/.test(after.tx)||!/おつりとしてアリスへ/.test(after.tx)))note('ja strip '+after.tx);
  if(lang==='en'&&(!/2\.5-coin piece/.test(after.tx)||!/1-coin piece/.test(after.tx)||!/1\.5-coin piece/.test(after.tx)||!/back to Alice as change/i.test(after.tx)))note('en strip '+after.tx);
  if(after.term)note(lang+' utxo box still in the result');
  if(!/UTXO/.test(after.gloss)||!/Unspent Transaction Output/.test(after.gloss))note(lang+' glossary after send '+after.gloss);
  if(lang==='ja'&&(!/まるごと使います/.test(after.msg)||!/おつりとして新しいコイン玉/.test(after.msg)||!/戻ります/.test(after.msg)))note('ja result '+after.msg);
  if(lang==='en'&&(!/whole/.test(after.msg)||!/leftover/i.test(after.msg)||!/as change/i.test(after.msg)))note('en result '+after.msg);
  if(/取引の出力|will be rejected|拒否されます/.test(after.msg))note(lang+' result previews rejection '+after.msg);
  const footOrder=await p.evaluate(()=>{const f=document.getElementById('uxFoot');return [...f.children].map(e=>e.id).filter(Boolean)});
  const mi=footOrder.indexOf('uxMsg'),xi=footOrder.indexOf('uxTx');
  if(!(xi>=0&&mi>xi)||footOrder.includes('uxTerm'))note(lang+' result order '+footOrder.join(','));
  await p.locator('#uxA .tama[data-state="spent"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ng');
  const rej=await p.textContent('#uxMsg');
  if(lang==='ja'&&(!/この2\.5コイン玉は使い済み/.test(rej)||!/二重払いなので、送れません/.test(rej)))note('ja reject '+rej);
  if(lang==='en'&&(!/2\.5-coin piece/.test(rej)||!/already spent/i.test(rej)||!/double spend/i.test(rej)||!/cannot be sent/i.test(rej)))note('en reject '+rej);
  await p.locator('#uxA .tama[data-amt="1"][data-state="live"]').click();
  await p.locator('#uxAmt button[data-u="1"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ok');
  const twins=await p.locator('#uxA .tama[data-amt="0.5"][data-state="live"]').evaluateAll(els=>els.map(e=>e.dataset.id));
  if(twins.length!==2||twins[0]===twins[1])note(lang+' two 0.5 pieces '+twins.join(','));
  if(await p.locator('.ch[data-t="かたまり"] .quiz').count()!==1)note(lang+' 1-4 quiz count');
  const q=p.locator('.ch[data-t="かたまり"] .quiz').first();
  await q.locator('button').nth(0).click();
  const qst=await q.evaluate(el=>({
    done:el.dataset.done,
    dis:[...el.querySelectorAll('.opts button')].every(b=>b.disabled),
    right:!!el.querySelector('.opts button.right'),
    wrong:!!el.querySelector('.opts button.wrong'),
    ans:el.querySelector('.ans').hidden?'':el.querySelector('.ans').textContent
  }));
  if(qst.done!=='1'||!qst.dis||!qst.right||!qst.wrong||!qst.ans)note(lang+' quiz '+JSON.stringify(qst));
  await q.locator('button').nth(1).evaluate(b=>b.click());
  const still=await q.evaluate(el=>el.dataset.done==='1'&&!!el.querySelector('.opts button.wrong')&&el.querySelectorAll('.opts button.right').length===1&&[...el.querySelectorAll('.opts button')].every(b=>b.disabled));
  if(!still)note(lang+' quiz retap');
  const uxOver=await p.evaluate(()=>{const foot=document.querySelector('#app footer').getBoundingClientRect();
    const over=sel=>{const e=document.querySelector(sel);if(!e||getComputedStyle(e).display==='none')return false;const r=e.getBoundingClientRect();const x=Math.min(r.right,foot.right)-Math.max(r.left,foot.left),y=Math.min(r.bottom,foot.bottom)-Math.max(r.top,foot.top);return x>0.5&&y>0.5};
    return ['#uxGo','#uxMsg','#uxTx'].filter(over)});
  if(uxOver.length)note(lang+' h'+h+' 1-4 footer overlap '+uxOver.join(','));
  // 1-3: Dave sends 1, then the double-spend control must clear つぎへ
  await go('台帳');
  const amt13=await p.evaluate(()=>{
    const btns=[...document.querySelectorAll('#tAmtC button')];
    const bg=b=>getComputedStyle(b).backgroundColor;
    const on=btns.filter(b=>b.classList.contains('on'));
    const off=btns.filter(b=>!b.classList.contains('on'));
    return {on:on.length,same:!!(on[0]&&off.some(b=>bg(b)===bg(on[0])))};
  });
  if(amt13.on!==1||amt13.same)note(lang+' 1-3 amount highlight '+JSON.stringify(amt13));
  const sec13=await p.locator('.ch[data-t="台帳"]').innerText();
  if(/二重払い|double spend/i.test(sec13))note(lang+' 1-3 still teaches double spend');
  if(lang==='ja'&&(!/持っていないコインを送ろうとすると、はじかれます/.test(sec13)||/使ったコイン/.test(sec13)))note('ja 1-3 intro');
  if(lang==='en'&&!/coins you don’t have is rejected/i.test(sec13))note('en 1-3 intro');
  if(await p.locator('#tDouble').count())note(lang+' tDouble still in the page');
  const mythThen=await p.evaluate(()=>{const s=document.querySelector('.ch[data-t="台帳"]'),m=s.querySelector('#lMyth'),q=s.querySelector('.quiz');return !!(m&&q&&(m.compareDocumentPosition(q)&4))});
  if(!mythThen)note(lang+' 1-3 myth not above quiz');
  const q13=p.locator('.ch[data-t="台帳"] .quiz');
  if(await q13.count()!==1)note(lang+' 1-3 quiz count');
  const q13t=await q13.innerText();
  if(lang==='ja'&&!/世界のノードの台帳はどうなる/.test(q13t))note('ja 1-3 quiz '+q13t.slice(0,80));
  if(lang==='en'&&!/ledgers on nodes around the world/i.test(q13t))note('en 1-3 quiz '+q13t.slice(0,80));
  await p.locator('#tL button.p').nth(3).click();
  await p.locator('#tR button.p').nth(1).click();
  await p.evaluate(()=>document.getElementById('tSend').click());
  await p.waitForSelector('#log li.ok');
  await p.waitForTimeout(250);
  if(/二重払い|double spend/i.test(await p.locator('.ch[data-t="台帳"]').innerText()))note(lang+' 1-3 double spend after send');
  // 2-3 prose stays, the adjustment widget is gone, myth is short
  await go('マイニング');
  if(await p.locator('#dAdj,#dHr,#dNote,#dRule').count())note(lang+' 2-3 widget still present');
  const mineBody=await p.locator('.ch[data-t="マイニング"]').innerText();
  if(/およそ10分を保つ|Keeping about 10 minutes/.test(mineBody))note(lang+' widget heading remains');
  if(lang==='ja'&&(!/およそ10分/.test(mineBody)||!/2,016/.test(mineBody)||!/およそ2週間/.test(mineBody)))note('ja 2-3 prose');
  if(lang==='en'&&(!/10 minutes/.test(mineBody)||!/2,016/.test(mineBody)||!/two weeks/.test(mineBody)))note('en 2-3 prose');
  if(await p.locator('#dMyth').evaluate(e=>e.open))note(lang+' myth starts open');
  const myth=await p.textContent('#dMyth');
  if(lang==='ja'&&(!/難易度調整/.test(myth)||!/止まりません/.test(myth)||!/報酬半減/.test(myth)||/半減期/.test(myth)||/ほんとう/.test(myth)))note('ja myth '+myth.slice(0,120));
  if(lang==='en'&&(!/10 minutes/.test(myth)||!/does not stop/i.test(myth)||!/21 million/.test(myth)||/半減期/.test(myth)))note('en myth '+myth.slice(0,140));
  await p.click('#dMyth summary');
  const ovM=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(ovM>1)note(lang+' myth open overflow');
  await p.locator('#djPow button[data-m="2"]').click();
  const adj1=await p.evaluate(()=>({i:document.getElementById('djInt').textContent,g:document.getElementById('djGo').disabled}));
  if(lang==='ja'&&(!/約5分/.test(adj1.i)||adj1.g))note('ja adj pow2 '+JSON.stringify(adj1));
  if(lang==='en'&&(!/5 min/.test(adj1.i)||adj1.g))note('en adj pow2 '+JSON.stringify(adj1));
  await p.click('#djGo');
  const adj2=await p.evaluate(()=>({i:document.getElementById('djInt').textContent,d:document.getElementById('djDiff').textContent}));
  if(lang==='ja'&&(!/約10分/.test(adj2.i)||!/×2/.test(adj2.d)))note('ja adj after '+JSON.stringify(adj2));
  if(lang==='en'&&(!/10 min/.test(adj2.i)||!/×2/.test(adj2.d)))note('en adj after '+JSON.stringify(adj2));
  const mineQs=p.locator('.ch[data-t="マイニング"] .quiz');
  if(await mineQs.count()!==1)note(lang+' 2-3 quiz count '+await mineQs.count());
  const mq=await mineQs.innerText();
  if(lang==='ja'&&(!/1問クイズ/.test(mq)||!/およそ10分/.test(mq)||/3→4/.test(mq)))note('ja 2-3 quiz '+mq.slice(0,100));
  if(lang==='en'&&(!/10 minutes/.test(mq)||/from 3 to 4/i.test(mq)))note('en 2-3 quiz '+mq.slice(0,120));
  await mineQs.locator('button').nth(1).click();
  const mqst=await mineQs.evaluate(el=>({
    done:el.dataset.done,
    dis:[...el.querySelectorAll('.opts button')].every(b=>b.disabled),
    right:[...el.querySelectorAll('.opts button')].findIndex(b=>b.classList.contains('right')),
    wrong:!!el.querySelector('.opts button.wrong'),
    ans:el.querySelector('.ans').hidden?'':el.querySelector('.ans').textContent
  }));
  if(mqst.done!=='1'||!mqst.dis||mqst.right!==0||!mqst.wrong||!mqst.ans)note(lang+' 2-3 answer '+JSON.stringify(mqst));
  await mineQs.locator('button').nth(0).evaluate(b=>b.click());
  const mstill=await mineQs.evaluate(el=>el.dataset.done==='1'&&el.querySelectorAll('.opts button.right').length===1&&[...el.querySelectorAll('.opts button')].every(b=>b.disabled));
  if(!mstill)note(lang+' 2-3 quiz retap');
  const order=await p.evaluate(()=>{
    const s=document.querySelector('.ch[data-t="マイニング"]');
    const ids=[...s.children].map(e=>e.id||(e.classList.contains('quiz')?'quiz':''));
    return {quiz:ids.indexOf('quiz'),m:ids.indexOf('mMyth'),d:ids.indexOf('dMyth'),last:s.lastElementChild.classList.contains('quiz'),q:ids.filter(x=>x==='quiz').length};
  });
  if(order.q!==1||!order.last||!(order.m<order.d&&order.d<order.quiz))note(lang+' 2-3 order '+JSON.stringify(order));
  await go('ブロックが届く');
  const sp=await p.locator('.ch[data-t="ブロックが届く"]').innerText();
  const bq=p.locator('.ch[data-t="ブロックが届く"] .quiz');
  if(await bq.count()!==1)note(lang+' 2-4 quiz count '+await bq.count());
  const bt=await bq.innerText();
  if(lang==='ja'&&(!/1問クイズ/.test(bt)||!/枝分かれ/.test(bt)||/ノードはどうする/.test(bt)))note('ja 2-4 quiz '+bt.slice(0,100));
  if(lang==='en'&&(!/fork/i.test(bt)||/what does a node do/i.test(bt)))note('en 2-4 quiz '+bt.slice(0,120));
  if(lang==='ja'&&(!/もっと短いと、届く前に次が見つかり/.test(sp)||/フォーク：チェーンが二つに分かれる/.test(sp)||/2-3「マイニング」で見ました/.test(sp)))note('ja 2-4 '+sp.slice(0,160));
  if(lang==='en'&&(!/chain splits more easily/i.test(sp)||/chain splitting in two/i.test(sp)))note('en 2-4 '+sp.slice(0,160));
  if(/2,016|2016/.test(sp))note(lang+' 2-4 repeats 2016 mechanism');
  if(lang==='ja'){
    await go('報酬半減');
    const intro=await p.locator('.ch[data-t="報酬半減"]').innerText();
    const title=await p.locator('.ch[data-t="報酬半減"] h2').innerText();
    if(!intro.includes('マイニングで、ブロックを追加した人がもらう報酬は、最初は50BTCです')||!intro.includes('ハービング（halving）')||!intro.includes('半減期とも呼ばれます')||!intro.includes('報酬半減'))note('3-2 wording');
    if(title.includes('半減期')||intro.replace('半減期とも呼ばれます','').includes('半減期'))note('3-2 extra 半減期');
    await p.click('#hPlay');
    await p.waitForFunction(()=>[...document.querySelectorAll('#hCurve text')].some(t=>/報酬半減/.test(t.textContent)),{timeout:15000});
    const left=await halvingWords(p);
    if(left.length)note('after chart 半減期 '+JSON.stringify(left.slice(0,6)));
  }else{
    await go('報酬半減');
    const intro=await p.locator('.ch[data-t="報酬半減"]').innerText();
    if(!/reward miners receive for adding a block/i.test(intro)||!/halving/i.test(intro)||intro.includes('半減期'))note('en 3-2 '+intro.slice(0,140));
  }
  const miss=lang==='en'?await p.evaluate(()=>[...window.__miss]):[];
  if(miss.length)note(lang+' h'+h+' miss '+JSON.stringify(miss.slice(0,15)));
  if(errs.length)note(lang+' h'+h+' errors '+errs.join('|'));
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(ov>1)note(lang+' h'+h+' overflow after actions');
  console.log('act',lang,h,'errs',errs.length,'miss',miss.length);
  await c.close();
}
await b.close();
if(bad.length){console.log('FAIL',bad.length);process.exit(1)}
console.log('ALL PASS');
})().catch(e=>{console.error(e);process.exit(1)});
