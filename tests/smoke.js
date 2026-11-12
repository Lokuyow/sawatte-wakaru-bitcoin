const {TIMEOUT,launchBrowser,boot:utilBoot,go:utilGo,waitAnimsDone,assertActionable}=require('./util');
// E-18: 章数は現行仕様として全18章で固定。増減どちらも不合格とする（定数＋厳密一致）。
const EXPECTED_CHAPTERS=18;

(async()=>{
const b=await launchBrowser();const bad=[];
const note=(m)=>{bad.push(m);console.log('BAD',m)};
async function boot(w,h,lang,theme,extra={}){
  return utilBoot(b,{w,h,lang,theme,...extra});
}
async function halvingWords(p){
  return p.evaluate(()=>{
    const ALLOW='報酬が半分になることを、ハルビング（halving）と言います。半減期とも呼ばれます。';
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
    // S1: 章切替の反映は .ch.on が対象インデックスになる条件待ちで確認する（固定 sleep 廃止）
    await p.waitForFunction(i=>{const el=document.querySelector('.ch.on');return !!el&&[...document.querySelectorAll('.ch')].indexOf(el)===i},i,{timeout:TIMEOUT});
    const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(o>1)ov.push(i+':'+await p.evaluate(()=>document.querySelector('.ch.on').dataset.t));
    if(lang==='ja')words.push(...await halvingWords(p));
  }
  return {n,ov,words:[...new Set(words)]};
}
// layout + translation sweep
for(const [w,h,lang,theme] of [[375,812,'ja','light'],[375,812,'en','light'],[1280,900,'ja','light'],[375,812,'ja','dark'],[1280,900,'en','dark']]){
  let c;try{
  const bootRes=await boot(w,h,lang,theme);const {p,errs}=bootRes;c=bootRes.c;
  const {n,ov,words}=await walk(p,lang);
  const stage1=await p.evaluate(()=>document.querySelectorAll('.ch[data-p="1"]').length);
  const title=await p.evaluate(()=>{const s=[...document.querySelectorAll('.ch')].find(c=>c.dataset.t==='かたまり');return s.querySelector('h2').textContent});
  const miss=lang==='en'?await p.evaluate(()=>[...window.__miss]):[];
  if(n!==EXPECTED_CHAPTERS)note(w+lang+theme+' pages '+n+' expected '+EXPECTED_CHAPTERS);
  if(stage1!==4)note(w+lang+' stage1 '+stage1);
  if(/^(\s|1-4)*UTXO/i.test(title)||title.trim().startsWith('UTXO'))note('title leads with UTXO '+title);
  if(ov.length)note(w+' '+h+' '+lang+' '+theme+' overflow '+ov.join(','));
  if(errs.length)note(w+lang+theme+' errors '+errs.join('|'));
  if(miss.length)note(w+lang+' miss '+JSON.stringify(miss.slice(0,12)));
  if(words&&words.length)note(w+lang+' visible 半減期 '+JSON.stringify(words.slice(0,8)));
  console.log('walk',w,h,lang,theme,'pages',n,'stage1',stage1,'ov',ov.length,'err',errs.length,'miss',miss.length);
  }catch(e){note('walk exception '+w+lang+theme+' '+(e&&e.message))}
  finally{if(c)await c.close().catch(()=>{})}
}
// interactions at phone width
for(const [h,lang] of [[812,'ja'],[667,'ja'],[812,'en'],[667,'en']]){
  let c;try{
  const bootRes=await boot(375,h,lang,'light');const {p,errs}=bootRes;c=bootRes.c;
  const go=t=>utilGo(p,t);
  // J1/J2: tGlowB 回避の JS クリック直前に actionability を補完 assert する
  const jsClick=async sel=>{const a=await assertActionable(p,sel);if(!a.ok)note(lang+' '+sel+' not actionable before JS click '+JSON.stringify(a));await p.evaluate(s=>document.querySelector(s).click(),sel)};
  // 1-4 idle is compact, then send 1 from the 2.5-coin piece
  await go('かたまり');
  // S2: 意図は「入場アニメーション後の寸法計測」。アニメーション完了を待ち、計測値が安定するまで poll する
  await waitAnimsDone(p,'.ch[data-t="かたまり"]');
  await p.waitForFunction(()=>{const el=document.getElementById('uxAmt');if(!el)return false;const v=el.getBoundingClientRect().top+scrollY;const same=window.__amtPrev===v;window.__amtPrev=v;return same},null,{timeout:TIMEOUT}).catch(()=>{});
  const idle=await p.evaluate(()=>{
    const sec=document.querySelector('.ch[data-t="かたまり"]');
    const words=sec.querySelector('.words'),ux=sec.querySelector('#ux');
    const btns=[...document.querySelectorAll('#uxAmt button')];
    const bg=b=>getComputedStyle(b).backgroundColor;
    const on=btns.filter(b=>b.classList.contains('on'));
    const off=btns.filter(b=>!b.classList.contains('on'));
    return {
      hint:(document.getElementById('uxHint')||{}).textContent||'',
      step:document.getElementById('ux').dataset.step,
      frame:(()=>{const cs=getComputedStyle(document.getElementById('uxPs'));return cs.outlineWidth+'/'+cs.borderTopLeftRadius})(),
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
  if(idle.step!=='coins')note(lang+' 1-4 step idle '+idle.step);
  if(idle.frame!=='2px/14px')note(lang+' 1-4 frame '+idle.frame);
  await p.locator('#uxA .tama[data-amt="2.5"]').click();
  await p.locator('#uxAmt button[data-u="3"]').click();
  const picked=await p.evaluate(()=>{
    const btns=[...document.querySelectorAll('#uxAmt button')];
    const bg=b=>getComputedStyle(b).backgroundColor;
    const on=btns.filter(b=>b.classList.contains('on'));
    const off=btns.filter(b=>!b.classList.contains('on'));
    return {on:on.map(b=>b.textContent.trim()),same:!!(on[0]&&off.some(b=>bg(b)===bg(on[0]))),go:document.getElementById('uxGo').textContent,tamaBg:getComputedStyle(document.querySelector('.tama.on')).backgroundColor,hint:document.getElementById('uxHint').textContent,discShadow:getComputedStyle(document.querySelector('.tama.on .disc')).boxShadow,step:document.getElementById('ux').dataset.step};
  });
  if(picked.on.join(',')!=='1.5'||picked.same||!/1\.5/.test(picked.go))note(lang+' amount 1.5 '+JSON.stringify(picked));
  if(picked.tamaBg!=='rgba(0, 0, 0, 0)')note(lang+' tama selected bg '+picked.tamaBg);
  if(picked.step!=='go')note(lang+' 1-4 step picked '+picked.step);
  if(!picked.discShadow.includes('0px 0px 0px 7px'))note(lang+' selection ring missing '+picked.discShadow);
  if(lang==='ja'&&!/ボタンを押して送るだけ/.test(picked.hint))note('ja 1-4 hint ready '+picked.hint);
  if(lang==='en'&&!/press the button/i.test(picked.hint))note('en 1-4 hint ready '+picked.hint);
  await p.locator('#uxAmt button[data-u="2"]').click();
  await jsClick('#uxGo');
  await p.waitForSelector('#uxMsg.ok',{timeout:TIMEOUT});
  const after=await p.evaluate(()=>({
    uxAh:document.getElementById('uxA').getBoundingClientRect().height,
    amtTop:document.getElementById('uxAmt').getBoundingClientRect().top+scrollY,
    alice:[...document.querySelectorAll('#uxA .tama')].map(e=>({a:e.dataset.amt,s:e.dataset.state,id:e.dataset.id})),
    bob:[...document.querySelectorAll('#uxB .tama')].map(e=>({a:e.dataset.amt,s:e.dataset.state,id:e.dataset.id})),
    tx:document.getElementById('uxTx').innerText,
    hdrFs:parseFloat(getComputedStyle(document.querySelector('.uxTxH span')).fontSize),
    chg:[...document.querySelectorAll('#uxA .tama.chg')].map(e=>e.dataset.amt),
    panel:getComputedStyle(document.getElementById('uxA').parentElement).borderTopWidth,
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
  if(after.alice.map(c=>c.a+c.s).join(',')!=='2.5spent,1.5live,1live,0.5live')note(lang+' coin order '+after.alice.map(c=>c.a+c.s).join(','));
  if(after.chg.join(',')!=='1.5')note(lang+' change badge '+JSON.stringify(after.chg));
  if(!(after.hdrFs<14))note(lang+' strip header not label-like '+after.hdrFs);
  if(after.panel!=='1px')note(lang+' pile panel '+after.panel);
  if(lang==='ja'&&(!/2\.5コイン玉/.test(after.tx)||!/1コイン玉/.test(after.tx)||!/1\.5コイン玉/.test(after.tx)||!/おつりとしてアリスへ/.test(after.tx)))note('ja strip '+after.tx);
  if(lang==='ja'&&!/2\.5コイン玉\s*（アリス）/.test(after.tx))note('ja strip input owner '+after.tx);
  if(lang==='en'&&!/2\.5-coin piece\s*\(Alice\)/.test(after.tx))note('en strip input owner '+after.tx);
  if(lang==='en'&&(!/2\.5-coin piece/.test(after.tx)||!/1-coin piece/.test(after.tx)||!/1\.5-coin piece/.test(after.tx)||!/back to Alice as change/i.test(after.tx)))note('en strip '+after.tx);
  if(after.term)note(lang+' utxo box still in the result');
  if(!/UTXO/.test(after.gloss)||!/Unspent Transaction Output/.test(after.gloss))note(lang+' glossary after send '+after.gloss);
  if(lang==='ja'&&(!/まるごと使います/.test(after.msg)||!/おつりとして新しいコイン玉/.test(after.msg)||!/戻ります/.test(after.msg)))note('ja result '+after.msg);
  if(lang==='en'&&(!/whole/.test(after.msg)||!/leftover/i.test(after.msg)||!/as change/i.test(after.msg)))note('en result '+after.msg);
  if(/取引の出力|will be rejected|拒否されます/.test(after.msg))note(lang+' result previews rejection '+after.msg);
  const footOrder=await p.evaluate(()=>{const f=document.getElementById('uxFoot');return [...f.children].map(e=>e.id).filter(Boolean)});
  const mi=footOrder.indexOf('uxMsg'),xi=footOrder.indexOf('uxTx');
  if(!(xi>=0&&mi>xi)||footOrder.includes('uxTerm'))note(lang+' result order '+footOrder.join(','));
  const noteT=await p.locator('.ch[data-t="かたまり"] .note').textContent().catch(()=>'');
  if(lang==='ja'&&!/実際のビットコイン/.test(noteT))note('ja btc bridge missing');
  if(lang==='en'&&!/Real Bitcoin/.test(noteT))note('en btc bridge missing');
  await p.locator('#uxA .tama[data-state="spent"]').click();
  await jsClick('#uxGo');
  await p.waitForSelector('#uxMsg.ng',{timeout:TIMEOUT});
  const rej=await p.textContent('#uxMsg');
  if(lang==='ja'&&(!/この2\.5コイン玉は使用済み/.test(rej)||!/二重払いなので、送れません/.test(rej)))note('ja reject '+rej);
  if(lang==='en'&&(!/2\.5-coin piece/.test(rej)||!/already spent/i.test(rej)||!/double spend/i.test(rej)||!/cannot be sent/i.test(rej)))note('en reject '+rej);
  await p.locator('#uxA .tama[data-amt="1"][data-state="live"]').click();
  await p.locator('#uxAmt button[data-u="1"]').click();
  await jsClick('#uxGo');
  await p.waitForSelector('#uxMsg.ok',{timeout:TIMEOUT});
  const twins=await p.locator('#uxA .tama[data-amt="0.5"][data-state="live"]').evaluateAll(els=>els.map(e=>e.dataset.id));
  if(twins.length!==2||twins[0]===twins[1])note(lang+' two 0.5 pieces '+twins.join(','));
  await p.locator('#uxA .tama[data-amt="1.5"][data-state="live"]').click();
  await p.locator('#uxB .tama[data-amt="1"]').click();
  const gate=await p.evaluate(()=>({a:document.querySelectorAll('#uxA .tama.on').length,b:document.querySelectorAll('#uxB .tama.on').length}));
  if(gate.a!==0||gate.b!==1)note(lang+' owner switch '+JSON.stringify(gate));
  await p.locator('#uxB .tama[data-amt="1"]').click();
  await p.locator('#uxA .tama[data-amt="1.5"][data-state="live"]').click();
  await p.locator('#uxA .tama[data-amt="0.5"][data-state="live"]').first().click();
  const amtBtns=await p.locator('#uxAmt button').evaluateAll(bs=>bs.map(b=>b.dataset.u));
  if(!amtBtns.includes('4'))note(lang+' multi total steps '+amtBtns.join(','));
  await p.locator('#uxAmt button[data-u="3"]').click();
  await jsClick('#uxGo');
  await p.waitForSelector('#uxMsg.ok',{timeout:TIMEOUT});
  const multi=await p.evaluate(()=>({alice:[...document.querySelectorAll('#uxA .tama')].map(e=>e.dataset.amt+e.dataset.state),bob:[...document.querySelectorAll('#uxB .tama')].map(e=>e.dataset.amt+e.dataset.state),tx:document.getElementById('uxTx').innerText,chg:[...document.querySelectorAll('#uxA .tama.chg')].map(e=>e.dataset.amt),msg:document.getElementById('uxMsg').textContent}));
  if(multi.alice.join(',')!=='2.5spent,1.5spent,1spent,0.5spent,0.5live,0.5live')note(lang+' multi alice '+multi.alice.join(','));
  if(multi.bob.join(',')!=='1live,0.5live,1.5live')note(lang+' multi bob '+multi.bob.join(','));
  if(multi.chg.join(',')!=='0.5')note(lang+' multi chg '+JSON.stringify(multi.chg));
  if(lang==='ja'&&(!/1\.5コイン玉\s*（アリス）/.test(multi.tx)||!/0\.5コイン玉\s*（アリス）/.test(multi.tx)||!/まるごと使います/.test(multi.msg)))note('ja multi '+multi.tx+' | '+multi.msg);
  if(lang==='en'&&(!/1\.5-coin piece\s*\(Alice\)/.test(multi.tx)||!/0\.5-coin piece\s*\(Alice\)/.test(multi.tx)||!/whole/.test(multi.msg)))note('en multi '+multi.tx+' | '+multi.msg);
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
  await jsClick('#tSend');
  await p.waitForSelector('#log li.ok',{timeout:TIMEOUT});
  // S3: 「送信完了時点で二重払い文言が無い」ことの確認。無いこと自体は条件待ちにできないため、意図を明記して短い固定待ちを維持する
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
  if(lang==='ja'&&(!/難易度調整/.test(myth)||!/採掘難易度/.test(myth)||/半減期/.test(myth)||/ほんとう/.test(myth)))note('ja myth '+myth.slice(0,120));
  if(lang==='en'&&(!/10 minutes/.test(myth)||!/difficulty/i.test(myth)||/半減期/.test(myth)))note('en myth '+myth.slice(0,140));
  await p.click('#dMyth summary');
  const ovM=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(ovM>1)note(lang+' myth open overflow');
  await p.locator('#djPow button[data-m="2"]').click();
  const adj1=await p.evaluate(()=>({i:document.getElementById('djInt').textContent,g:document.getElementById('djGo').disabled,adj:document.getElementById('djAdj').textContent}));
  if(lang==='ja'&&(!/約5分/.test(adj1.i)||adj1.g))note('ja adj pow2 '+JSON.stringify(adj1));
  if(lang==='en'&&(!/5 min/.test(adj1.i)||adj1.g))note('en adj pow2 '+JSON.stringify(adj1));
  if(!/2016/.test(adj1.adj))note(lang+' adj 2016 line '+adj1.adj);
  if(lang==='ja'&&!/あと \d+ ブロック/.test(adj1.adj))note('ja adj left '+adj1.adj);
  if(lang==='en'&&!/blocks to go/.test(adj1.adj))note('en adj left '+adj1.adj);
  await p.click('#djGo');
  await p.waitForFunction(()=>document.getElementById('djDiff').textContent==='×2',{timeout:TIMEOUT});
  const adj2=await p.evaluate(()=>({i:document.getElementById('djInt').textContent,d:document.getElementById('djDiff').textContent,cnt:document.getElementById('djCnt').textContent,adj:document.getElementById('djAdj').textContent}));
  if(lang==='ja'&&(!/約10分/.test(adj2.i)||!/×2/.test(adj2.d)))note('ja adj after '+JSON.stringify(adj2));
  if(lang==='en'&&(!/10 min/.test(adj2.i)||!/×2/.test(adj2.d)))note('en adj after '+JSON.stringify(adj2));
  if(lang==='ja'&&(!/ブロック番号: \d{3},\d{3}/.test(adj2.cnt)||!/あと 201[0-6] ブロック/.test(adj2.adj)))note('ja adj height '+JSON.stringify(adj2));
  if(lang==='en'&&(!/Block height: \d{3},\d{3}/.test(adj2.cnt)||!/201[0-6] blocks to go/.test(adj2.adj)))note('en adj height '+JSON.stringify(adj2));
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
    if(!intro.includes('マイニングで、ブロックを追加した人がもらう報酬は、最初は50BTCです')||!intro.includes('ハルビング（halving）')||!intro.includes('半減期とも呼ばれます')||!intro.includes('報酬半減'))note('3-2 wording');
    if(title.includes('半減期')||intro.replace('半減期とも呼ばれます','').includes('半減期'))note('3-2 extra 半減期');
    await p.click('#hPlay');
    // 実測 (2026-11-12, このVM): #hPlay から最初の「報酬半減」バッジ表示まで約2.3秒（全再生は約15秒だが、本 assert は最初のバッジのみ）。
    // 余裕を約3.5倍取り 8000ms とする（旧 15000ms から短縮）。
    await p.waitForFunction(()=>[...document.querySelectorAll('#hCurve text')].some(t=>/報酬半減/.test(t.textContent)),{timeout:8000});
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
  }catch(e){note('act exception '+lang+' h'+h+' '+(e&&e.message))}
  finally{if(c)await c.close().catch(()=>{})}
}
// ===== 追加シナリオ (E-10 / E-11 / E-09 / st・mig からの移植) =====
// いずれも ja・375・light の小さいシナリオ。失敗は note() に集積され終了コードへ反映される。
async function scenario(name,fn){try{await fn();console.log('scenario',name,'done')}catch(e){note(name+' exception '+(e&&e.message))}}
const jsClick2=async(p,sel,label)=>{const a=await assertActionable(p,sel);if(!a.ok)note(label+' not actionable before JS click '+JSON.stringify(a));await p.evaluate(s=>document.querySelector(s).click(),sel)};

// (a) テーマ切替 (E-10): #theme 実クリック → data-theme と localStorage が反転し reload 後も維持
await scenario('theme',async()=>{
  const {p,c,errs,requests}=await boot(375,812,'ja','light');
  try{
    if(requests.some(u=>/en\.js/.test(u)))note('theme ja boot loaded en.js (en.js must not load in ja)');
    const before=await p.evaluate(()=>document.documentElement.dataset.theme||'');
    await p.locator('#theme').click({timeout:TIMEOUT});
    const afterT=await p.evaluate(()=>({dt:document.documentElement.dataset.theme||'',ls:localStorage.getItem('sw-theme')}));
    if(!afterT.dt||afterT.dt===before||afterT.ls!==afterT.dt)note('theme toggle '+JSON.stringify({before,afterT}));
    await p.reload({waitUntil:'load'});
    const kept=await p.evaluate(()=>document.documentElement.dataset.theme||'');
    if(kept!==afterT.dt)note('theme persist after reload kept='+kept+' expected='+afterT.dt);
    if(errs.length)note('theme errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// (b) 言語切替 (E-10): 数章進んで #lang EN 実クリック → reload 後 同章復帰 (sw-go) / lang=en / __miss 空。
//     あわせて JA boot では en.js がリクエストされないことを assert する。
await scenario('lang',async()=>{
  const {p,c,errs,requests}=await boot(375,812,'ja','light');
  try{
    if(requests.some(u=>/en\.js/.test(u)))note('lang ja boot loaded en.js (en.js must not load in ja)');
    await utilGo(p,'台帳');
    const onBefore=await p.evaluate(()=>document.querySelector('.ch.on').dataset.t);
    await p.locator('#lang button[data-l="en"]').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>document.documentElement.lang==='en',null,{timeout:TIMEOUT});
    await p.waitForFunction(t=>{const el=document.querySelector('.ch.on');return !!el&&el.dataset.t===t},onBefore,{timeout:TIMEOUT});
    if(!requests.some(u=>/en\.js/.test(u)))note('lang en boot did not load en.js');
    const miss=await p.evaluate(()=>[...(window.__miss||[])]);
    if(miss.length)note('lang switch miss '+JSON.stringify(miss.slice(0,12)));
    if(errs.length)note('lang errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// (c) resume (E-10): 現行形式 sw-btc2 を仕込み reload → #resume 表示 → クリックで保存章へ復帰し seen 復元
await scenario('resume',async()=>{
  const seed={'sw-btc2':JSON.stringify({cur:'台帳',seen:['はじめに','署名','台帳'],games:{}})};
  const {p,c,errs}=await boot(375,812,'ja','light',{seed,noStart:true});
  try{
    await p.reload({waitUntil:'load'});
    const vis=await p.evaluate(()=>!document.getElementById('resume').hidden);
    if(!vis)note('resume not shown for sw-btc2 seed');
    else{
      await p.click('#resume',{timeout:TIMEOUT});
      await p.waitForFunction(()=>{const el=document.querySelector('.ch.on');return !!el&&el.dataset.t==='台帳'},null,{timeout:TIMEOUT});
      const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('sw-btc2')||'{}'));
      if(saved.cur!=='台帳'||!Array.isArray(saved.seen)||!saved.seen.includes('はじめに')||!saved.seen.includes('署名')||!saved.seen.includes('台帳'))note('resume saved state '+JSON.stringify(saved));
    }
    if(errs.length)note('resume errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// (d) 実ナビゲーション (E-10 / st.js から移植): #next / #prev 実クリックで章が前後する
await scenario('nav',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const t0=await p.evaluate(()=>document.querySelector('.ch.on').dataset.t);
    await p.locator('#next').click({timeout:TIMEOUT});
    await p.waitForFunction(t=>{const el=document.querySelector('.ch.on');return !!el&&el.dataset.t!==t},t0,{timeout:TIMEOUT});
    const t1=await p.evaluate(()=>document.querySelector('.ch.on').dataset.t);
    await p.locator('#prev').click({timeout:TIMEOUT});
    await p.waitForFunction(t=>{const el=document.querySelector('.ch.on');return !!el&&el.dataset.t===t},t0,{timeout:TIMEOUT});
    if(errs.length)note('nav errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// (e) 保存移行 (mig.js から移植): 旧形式 sw-btc → sw-btc2 へ移行し期待値と一致する。
//     期待値は現行 app.js の移行コードから導いた値（mig.js 側の期待値は旧章順前提で stale だったため、
//     2026-11-12 に実機で確認した現在値を使う）。garbage では resume が出ないこと。
const MIG_CASES=[
  {seed:{cur:4,seen:[0,1,4]},land:'ブロックが届く',seen:['はじめに','ハッシュ','ブロックが届く']},
  {seed:{cur:13,seen:[0,13]},land:'51%攻撃',seen:['はじめに','51%攻撃']},
  {seed:{cur:15,seen:[15]},land:'全体の流れ',seen:['はじめに','全体の流れ']},
];
for(const mc of MIG_CASES){
  await scenario('migration '+mc.land,async()=>{
    const {p,c,errs}=await boot(375,812,'ja','light',{seed:{'sw-btc':JSON.stringify(mc.seed)},noStart:true});
    try{
      const vis=await p.evaluate(()=>!document.getElementById('resume').hidden);
      if(!vis){note('migration resume not shown '+JSON.stringify(mc.seed));return}
      await p.click('#resume',{timeout:TIMEOUT});
      await p.waitForFunction(t=>{const el=document.querySelector('.ch.on');return !!el&&el.dataset.t===t},mc.land,{timeout:TIMEOUT});
      const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('sw-btc2')||'{}'));
      if(saved.cur!==mc.land||JSON.stringify(saved.seen)!==JSON.stringify(mc.seen))note('migration saved '+JSON.stringify(saved)+' expected cur='+mc.land+' seen='+JSON.stringify(mc.seen));
      if(errs.length)note('migration errors '+errs.join('|'));
    }finally{await c.close().catch(()=>{})}
  });
}
await scenario('migration garbage',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light',{seed:{'sw-btc':'garbage'},noStart:true});
  try{
    const vis=await p.evaluate(()=>!document.getElementById('resume').hidden);
    if(vis)note('migration garbage showed resume');
    if(errs.length)note('migration garbage errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// E-09 最小版: 主要デモの「代表操作1回＋状態変化1点」（文言の厳密照合はしない）
await scenario('demos',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const go=t=>utilGo(p,t);
    // 署名: 書く→署名→確認 で検証 OK の状態になる
    await go('署名');
    await p.locator('#sgGo').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>document.querySelector('.sgSlip').classList.contains('in'),null,{timeout:TIMEOUT});
    await p.locator('#sgGo').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>!!document.querySelector('.sgSeal.on'),null,{timeout:TIMEOUT});
    await p.locator('#sgGo').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>!document.querySelector('#sg .sgX').hidden,null,{timeout:8000});
    const sRes=await p.textContent('#sRes');
    if(!/OK/.test(sRes))note('demo sig result '+sRes);
    // チェーン: 改ざん → 不一致の状態になる（#cFix が出る）
    await go('チェーン');
    await p.waitForFunction(()=>!!document.querySelector('#chain .bed'),null,{timeout:TIMEOUT});
    await p.locator('#chain .bed').first().click({timeout:TIMEOUT});
    await p.waitForFunction(()=>!document.getElementById('cFix').hidden,null,{timeout:TIMEOUT});
    const csts=await p.evaluate(()=>[...document.querySelectorAll('#chain .blk .st')].map(e=>e.textContent).join(' '));
    if(!/合わない|書きかえた/.test(csts))note('demo chain sts '+csts);
    // マイニング本体: 難易度1で開始 → 試行回数かハッシュ表示が進む
    await go('マイニング');
    await p.evaluate(()=>{const d=document.getElementById('diff');d.value='1';d.dispatchEvent(new Event('input',{bubbles:true}))});
    await p.locator('#mGo').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>document.getElementById('mHash').classList.contains('found')||parseInt((document.getElementById('mTry').textContent||'0').replace(/[^0-9]/g,''),10)>0,null,{timeout:8000});
    // 手数料: 手数料を上げてブロック作成 → 結果表示とプールの状態変化
    await go('手数料');
    await p.evaluate(()=>{const f=document.getElementById('fee');f.value='60';f.dispatchEvent(new Event('input',{bubbles:true}))});
    await p.locator('#fGo').click({timeout:TIMEOUT});
    const fRes=await p.textContent('#fRes');
    const fCls=await p.evaluate(()=>[...document.querySelectorAll('#fPool span')].filter(x=>x.classList.contains('in')||x.classList.contains('out')).length);
    if(!fRes.trim()||fCls===0)note('demo fee res='+fRes+' cls='+fCls);
    // ライトニング: チャンネルを開いて支払い → 残高変化
    await go('ライトニング');
    const lB0=await p.textContent('#lB');
    await p.locator('#lOpen').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>!document.getElementById('lPay').disabled,null,{timeout:TIMEOUT});
    await p.locator('#lPay').click({timeout:TIMEOUT});
    const lB1=await p.textContent('#lB');const lOff=await p.textContent('#lOff');
    if(lB1===lB0||!/1/.test(lOff))note('demo ln B '+lB0+'->'+lB1+' off='+lOff);
    // 全体の流れ: #fNext を最後まで → 完了表示 (#fDone) に到達
    await go('全体の流れ');
    for(let i=0;i<10;i++){await p.locator('#fNext').click({timeout:TIMEOUT});if(await p.evaluate(()=>!!document.getElementById('fDone')))break}
    if(!(await p.evaluate(()=>!!document.getElementById('fDone'))))note('demo flow did not reach end title='+(await p.textContent('#fTitle')));
    if(errs.length)note('demos errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// E-11: reduced-motion の context で全章 walk + 1-4 送信と 2-3 難易度調整の最終状態が通常時と同じ
await scenario('reduced-motion',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light',{reducedMotion:'reduce'});
  try{
    const {n,ov}=await walk(p,'ja');
    if(n!==EXPECTED_CHAPTERS)note('rm pages '+n+' expected '+EXPECTED_CHAPTERS);
    if(ov.length)note('rm overflow '+ov.join(','));
    const go=t=>utilGo(p,t);
    await go('かたまり');
    await p.locator('#uxA .tama[data-amt="2.5"]').click({timeout:TIMEOUT});
    await p.locator('#uxAmt button[data-u="2"]').click({timeout:TIMEOUT});
    await jsClick2(p,'#uxGo','rm uxGo');
    await p.waitForSelector('#uxMsg.ok',{timeout:TIMEOUT});
    const rmAlice=await p.evaluate(()=>[...document.querySelectorAll('#uxA .tama')].map(e=>e.dataset.amt+e.dataset.state).join(','));
    if(rmAlice!=='2.5spent,1.5live,1live,0.5live')note('rm 1-4 final alice '+rmAlice);
    await go('マイニング');
    await p.click('#dMyth summary',{timeout:TIMEOUT});
    await p.locator('#djPow button[data-m="2"]').click({timeout:TIMEOUT});
    await p.click('#djGo',{timeout:TIMEOUT});
    await p.waitForFunction(()=>document.getElementById('djDiff').textContent==='×2',null,{timeout:TIMEOUT});
    const rmInt=await p.textContent('#djInt');
    if(!/約10分/.test(rmInt))note('rm 2-3 final interval '+rmInt);
    if(errs.length)note('rm errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// ===== z98 回帰 (findings-B) =====
// B-01: ニセ取引を始めたあと他章へ移動して ArrowRight/Left を送っても、ゲームが回答済みにならない
await scenario('z98-b01',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const go=t=>utilGo(p,t);
    const snap=()=>p.evaluate(()=>({fx:document.querySelector('.gfx')?.className||'',dis:document.querySelector('#gYes')?.disabled??null,hud:document.querySelector('.ghud')?.textContent||''}));
    await go('ニセ取引');
    await p.locator('#gStart').click({timeout:TIMEOUT});
    await p.waitForSelector('#gGo',{timeout:TIMEOUT});
    await p.locator('#gGo').click({timeout:TIMEOUT});
    await p.waitForSelector('#gYes',{timeout:TIMEOUT});
    const before=await snap();
    if(before.fx.includes(' on ')||before.dis)note('z98-b01 precondition answered '+JSON.stringify(before));
    await go('はじめに');
    await p.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}))});
    await p.waitForTimeout(600);
    const stealth=await snap();
    if(stealth.fx.includes(' on ')||stealth.dis)note('z98-b01 answered from another chapter (while away) '+JSON.stringify(stealth));
    await go('ニセ取引');
    const after=await snap();
    if(after.fx!==before.fx||after.dis!==before.dis||after.hud!==before.hud)note('z98-b01 game state advanced by stray keys '+JSON.stringify({before,after}));
    if(errs.length)note('z98-b01 errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// B-02: 保存済みベスト(20%)/挑戦回数(7)がある状態で1回プレイしても、ベストが巻き戻らず回数だけ増える
await scenario('z98-b02',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light',{seed:{'sw-btc2':JSON.stringify({cur:'51%攻撃',seen:[],games:{'51%攻撃':{best:20,tries:7,ok:true}}})}});
  try{
    const go=t=>utilGo(p,t);
    await go('51%攻撃');
    await p.locator('#aGo').click({timeout:TIMEOUT});
    await p.waitForFunction(()=>{const g=JSON.parse(localStorage.getItem('sw-btc2')||'{}').games?.['51%攻撃'];return g&&g.tries===8},null,{timeout:30000});
    const g=await p.evaluate(()=>JSON.parse(localStorage.getItem('sw-btc2')).games['51%攻撃']);
    if(g.best!==20)note('z98-b02 best rolled back '+JSON.stringify(g));
    if(g.ok!==true)note('z98-b02 ok flag lost '+JSON.stringify(g));
    if(errs.length)note('z98-b02 errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// B-03: 実行中はスライダーと「たくさん」ボタンが無効。途中でスライダーを動かしても結果カードは開始時の値(30%)で出る
await scenario('z98-b03',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const go=t=>utilGo(p,t);
    await go('51%攻撃');
    await p.evaluate(()=>{const s=document.querySelector('#aP');s.value='30';s.dispatchEvent(new Event('input',{bubbles:true}))});
    await p.locator('#aGo').click({timeout:TIMEOUT});
    const dis=await p.evaluate(()=>({p:document.querySelector('#aP').disabled,many:document.querySelector('#aMany').disabled,go:document.querySelector('#aGo').disabled}));
    if(!dis.p||!dis.many||!dis.go)note('z98-b03 controls not disabled during run '+JSON.stringify(dis));
    await p.evaluate(()=>{document.querySelector('#aP').value='70'});
    await p.waitForFunction(()=>!document.querySelector('#aGo').disabled,null,{timeout:30000});
    const card=await p.evaluate(()=>document.querySelector('#aCard').textContent||'');
    if(card.includes('70%'))note('z98-b03 card used moved slider 70%: '+card.slice(0,120));
    if(!card.includes('30%'))note('z98-b03 card missing start value 30%: '+card.slice(0,120));
    const re=await p.evaluate(()=>({p:document.querySelector('#aP').disabled,many:document.querySelector('#aMany').disabled}));
    if(re.p||re.many)note('z98-b03 controls not re-enabled '+JSON.stringify(re));
    if(errs.length)note('z98-b03 errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// B-04: チェーン修復の実行中は .bed と #cReset が無効化され、完了後に戻る
await scenario('z98-b04',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const go=t=>utilGo(p,t);
    await go('チェーン');
    await p.waitForFunction(()=>!!document.querySelector('#chain .bed'),null,{timeout:TIMEOUT});
    await p.locator('#chain .bed').first().click({timeout:TIMEOUT});
    await p.waitForFunction(()=>!document.getElementById('cFix').hidden,null,{timeout:TIMEOUT});
    await p.locator('#cFix').click({timeout:TIMEOUT});
    const locked=await p.evaluate(()=>({beds:[...document.querySelectorAll('#chain .bed')].map(b=>b.disabled),reset:document.querySelector('#cReset').disabled,fix:document.querySelector('#cFix').disabled}));
    if(locked.beds.some(d=>!d))note('z98-b04 beds not locked '+JSON.stringify(locked));
    if(!locked.reset)note('z98-b04 reset not locked '+JSON.stringify(locked));
    if(!locked.fix)note('z98-b04 fix not disabled '+JSON.stringify(locked));
    await p.waitForFunction(()=>document.getElementById('cFix').hidden&&[...document.querySelectorAll('#chain .bed')].every(b=>!b.disabled)&&!document.querySelector('#cReset').disabled,null,{timeout:30000});
    const after=await p.evaluate(()=>({beds:[...document.querySelectorAll('#chain .bed')].map(b=>b.disabled),reset:document.querySelector('#cReset').disabled,bad:document.querySelectorAll('#chain .blk.bad').length}));
    if(after.beds.some(d=>d))note('z98-b04 beds still locked '+JSON.stringify(after));
    if(after.reset)note('z98-b04 reset still locked');
    if(after.bad)note('z98-b04 chain still broken after fix');
    if(errs.length)note('z98-b04 errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

// ===== z100 (findings-B 見送り分) =====
// B-09: reduced-motion は共通ヘルパー rmNow() に統一。セッション途中で OS 設定を
// 切り替えたら、旧スナップショット組（難易度調整の早送り）も都度評価組（紙吹雪）も追従する
await scenario('z100-b09',async()=>{
  const {p,c,errs}=await boot(375,812,'ja','light');
  try{
    const go=t=>utilGo(p,t);
    if(await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))note('z100-b09 precondition: unexpectedly reduced');
    await go('おわりに');
    await p.waitForSelector('.confetti',{timeout:TIMEOUT}).catch(()=>{});
    if(!await p.evaluate(()=>!!document.querySelector('.confetti')))note('z100-b09 control: confetti did not fire with RM off');
    await go('マイニング');
    await p.click('#dMyth summary',{timeout:TIMEOUT});
    await p.locator('#djPow button[data-m="2"]').click({timeout:TIMEOUT});
    await p.click('#djGo',{timeout:TIMEOUT});
    await p.waitForTimeout(350);
    if(await p.evaluate(()=>document.getElementById('djDiff').textContent==='×2'))note('z100-b09 control: dj fast-forward was instant with RM off');
    await p.waitForFunction(()=>document.getElementById('djDiff').textContent==='×2',null,{timeout:TIMEOUT});
    const cdp=await p.context().newCDPSession(p);
    await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    if(!await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))note('z100-b09 toggle did not take effect');
    await p.evaluate(()=>document.querySelector('.confetti')?.remove());
    await go('はじめに');
    await go('おわりに');
    await p.waitForTimeout(400);
    if(await p.evaluate(()=>!!document.querySelector('.confetti')))note('z100-b09 confetti fired after toggle to reduce');
    await go('マイニング');
    await p.locator('#djPow button[data-m="4"]').click({timeout:TIMEOUT});
    await p.click('#djGo',{timeout:TIMEOUT});
    const instant=await p.waitForFunction(()=>document.getElementById('djDiff').textContent==='×4',null,{timeout:400}).then(()=>true).catch(()=>false);
    if(!instant)note('z100-b09 dj fast-forward not instant after toggle to reduce');
    if(errs.length)note('z100-b09 errors '+errs.join('|'));
  }finally{await c.close().catch(()=>{})}
});

await b.close();
if(bad.length){console.log('FAIL',bad.length);process.exit(1)}
console.log('ALL PASS');
})().catch(e=>{console.error(e);process.exit(1)});
