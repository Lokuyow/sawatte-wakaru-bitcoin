const {chromium}=require('playwright');const P=process.argv[2];(async()=>{const b=await chromium.launch();for(const [w,h,t] of [[375,812,'mobile'],[1280,900,'desktop']]){const c=await b.newContext({viewport:{width:w,height:h},colorScheme:'dark'});const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('http://localhost:8765/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();await p.screenshot({path:`/workspace/btc-learn/screens/${t}-dark-${P}-hero.png`});await p.click('#start');
const go=async i=>{await p.evaluate(i=>document.querySelectorAll('#prog span')[i].click(),i);await p.waitForTimeout(400)};
const names=await p.evaluate(()=>[...document.querySelectorAll('.ch')].map(c=>c.dataset.t));
for(const [k,i] of [['intro',0],['hash',1],['chain',2],['mining',3],['ledger',6],['game',10],['flow',13],['summary',14]]){await go(i);
if(k=='mining'){await p.click('#mGo').catch(()=>{});await p.waitForSelector('#mHash.found',{timeout:20000}).catch(()=>{})}
if(k=='chain'){await p.evaluate(()=>{const t=document.querySelector('.chain2 textarea,.chain2 input');if(t){t.value+='x';t.dispatchEvent(new Event('input',{bubbles:true}))}})}
if(k=='game'){await p.evaluate(()=>{const s=document.querySelectorAll('.ch')[10].querySelector('button');s&&s.click()});await p.waitForTimeout(300)}
await p.screenshot({path:`/workspace/btc-learn/screens/${t}-dark-${P}-${k}.png`,fullPage:k!='hero'})}
const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log(t,names.length,'ov',ov,'errs',e)}await b.close()})();
