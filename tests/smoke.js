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
    const bad=[];
    const w=document.createTreeWalker(document.body,4);
    let n;while(n=w.nextNode()){
      const pe=n.parentElement;
      if(pe&&pe.closest('script,style'))continue;
      if((n.nodeValue||'').includes('半減期'))bad.push((n.nodeValue||'').trim().slice(0,90));
    }
    for(const e of document.querySelectorAll('*')){
      if(!e.getAttribute)continue;
      for(const a of ['aria-label','title','alt','placeholder']){
        const v=e.getAttribute(a);
        if(v&&v.includes('半減期'))bad.push('@'+a+':'+v.slice(0,90));
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
  // 1-4 idle is compact, then send 1 from the 3-coin
  await go('かたまり');
  const idle=await p.evaluate(()=>({
    msg:getComputedStyle(document.getElementById('uxMsg')).display,
    term:getComputedStyle(document.getElementById('uxTerm')).display,
    coins:[...document.querySelectorAll('#ux .lump')].map(e=>e.dataset.amt+e.dataset.who)
  }));
  if(idle.msg!=='none'||idle.term!=='none')note(lang+' 1-4 idle gap '+JSON.stringify(idle));
  if(idle.coins.join(',')!=='3アリス,2アリス'&&idle.coins.join(',')!=='3Alice,2Alice')note(lang+' start coins '+idle.coins.join(','));
  await p.locator('#uxA .lump[data-amt="3"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ok');
  const after=await p.evaluate(()=>[...document.querySelectorAll('#ux .lump')].map(e=>({a:e.dataset.amt,s:e.dataset.state,o:e.dataset.origin,w:e.dataset.who})));
  const spent=after.find(c=>c.s==='spent'&&c.a==='3');
  const change=after.find(c=>c.o==='change'&&c.a==='2');
  const keep=after.find(c=>c.o==='start'&&c.a==='2'&&c.s==='live');
  const got=after.find(c=>c.o==='new'&&c.a==='1');
  if(!spent||!change||!keep||!got)note(lang+' send result '+JSON.stringify(after));
  const term=await p.textContent('#uxTerm');
  if(!/UTXO/.test(term)||!/Unspent Transaction Output/.test(term))note(lang+' term '+term);
  await p.locator('#uxA .lump[data-state="spent"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ng');
  const rej=await p.textContent('#uxMsg');
  if(lang==='ja'&&!/二度使えません/.test(rej))note('ja reject '+rej);
  if(lang==='en'&&!/cannot be used twice/i.test(rej))note('en reject '+rej);
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
    return ['#uxGo','#uxMsg','#uxTerm'].filter(over)});
  if(uxOver.length)note(lang+' h'+h+' 1-4 footer overlap '+uxOver.join(','));
  // 1-3: Dave sends 1, then the double-spend control must clear つぎへ
  await go('台帳');
  const hidden=await p.locator('#tDouble').isHidden();
  if(!hidden)note(lang+' tDouble visible while idle');
  await p.locator('#tL button.p').nth(3).click();
  await p.locator('#tR button.p').nth(1).click();
  await p.evaluate(()=>document.getElementById('tSend').click());
  await p.waitForSelector('#tDouble:not([hidden])');
  await p.waitForTimeout(250);
  const db=await box(p,'#tDouble'),nx=await box(p,'#next'),ft=await box(p,'#app footer');
  if(hit(db,nx)||hit(db,ft))note(lang+' h'+h+' 1-3 overlap dbl '+JSON.stringify(db)+' next '+JSON.stringify(nx)+' foot '+JSON.stringify(ft));
  const clip=await p.evaluate(()=>{const e=document.getElementById('tDouble');return e.scrollWidth>e.clientWidth+2});
  if(clip)note(lang+' tDouble text clipped');
  // 2-3 adjustment + myth, 2-4 does not restate the 2016 mechanism
  await go('マイニング');
  const before=await p.evaluate(()=>getComputedStyle(document.getElementById('dNote')).display);
  if(before!=='none')note(lang+' dNote idle '+before);
  const rule=await p.textContent('#dRule');
  if(!/2,016|2016/.test(rule))note(lang+' rule '+rule);
  if(await p.locator('#dMyth').evaluate(e=>e.open))note(lang+' myth starts open');
  await p.click('#dHr button[data-h="many"]');
  const lv=await p.textContent('#dLv'),iv=await p.textContent('#dIv'),dn=await p.textContent('#dNote');
  if(lang==='ja'&&(lv!=='上げる'||!/10分/.test(iv)))note('ja adj '+lv+' '+iv);
  if(lang==='en'&&(lv!=='Higher'||!/10 min/.test(iv)))note('en adj '+lv+' '+iv);
  if(!dn||dn.length<8)note(lang+' empty adj note');
  const myth=await p.textContent('#dMyth');
  if(lang==='ja'&&(!/掘りつくさ/.test(myth)||!/止まりません/.test(myth)||!/2,016/.test(myth)))note('ja myth '+myth.slice(0,80));
  if(lang==='en'&&(!/mined out/i.test(myth)||!/does not halt/i.test(myth)||!/2,016/.test(myth)))note('en myth '+myth.slice(0,80));
  await p.click('#dMyth summary');
  const ovM=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(ovM>1)note(lang+' myth open overflow');
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
    return {quiz:ids.indexOf('quiz'),m:ids.indexOf('mMyth'),d:ids.indexOf('dMyth'),last:s.lastElementChild.id,q:ids.filter(x=>x==='quiz').length};
  });
  if(order.q!==1||order.last!=='dMyth'||!(order.quiz<order.m&&order.m<order.d))note(lang+' 2-3 order '+JSON.stringify(order));
  await go('ブロックが届く');
  const sp=await p.locator('.ch[data-t="ブロックが届く"]').innerText();
  const bq=p.locator('.ch[data-t="ブロックが届く"] .quiz');
  if(await bq.count()!==1)note(lang+' 2-4 quiz count '+await bq.count());
  const bt=await bq.innerText();
  if(lang==='ja'&&(!/1問クイズ/.test(bt)||!/枝分かれ/.test(bt)||/ノードはどうする/.test(bt)))note('ja 2-4 quiz '+bt.slice(0,100));
  if(lang==='en'&&(!/fork/i.test(bt)||/what does a node do/i.test(bt)))note('en 2-4 quiz '+bt.slice(0,120));
  if(lang==='ja'&&(!/フォーク/.test(sp)||!/マイニング/.test(sp)))note('ja 2-4 '+sp.slice(0,120));
  if(lang==='en'&&(!/fork/i.test(sp)||!/Mining/.test(sp)))note('en 2-4 missing fork/mining');
  if(/2,016|2016/.test(sp))note(lang+' 2-4 repeats 2016 mechanism');
  if(lang==='ja'){
    await go('報酬半減');
    const intro=await p.locator('.ch[data-t="報酬半減"]').innerText();
    if(!intro.includes('報酬半減')||!intro.includes('ハービング（halving）')||intro.includes('半減期'))note('3-2 wording');
    await p.click('#hPlay');
    await p.waitForFunction(()=>[...document.querySelectorAll('#hCurve text')].some(t=>/報酬半減/.test(t.textContent)),{timeout:15000});
    const left=await halvingWords(p);
    if(left.length)note('after chart 半減期 '+JSON.stringify(left.slice(0,6)));
  }else{
    await go('報酬半減');
    const intro=await p.locator('.ch[data-t="報酬半減"]').innerText();
    if(!/halving/i.test(intro)||intro.includes('半減期'))note('en 3-2 '+intro.slice(0,100));
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
