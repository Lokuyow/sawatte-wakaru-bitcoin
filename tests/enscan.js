const {chromium}=require('playwright');const U=process.argv[2]||'http://localhost:8765/';
(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h,tag] of [[375,800,'mobile'],[1280,900,'desktop']]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[],dlg=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dlg.push(d.message());d.dismiss()});
await p.addInitScript(()=>{try{localStorage.setItem('sw-lang','en')}catch(e){}});
await p.goto(U);await p.waitForTimeout(500);await p.click('#start');
const n=await p.$$eval('#app section',s=>s.length);const found=new Set();
const scan=async where=>{for(const f of await p.evaluate(()=>{const J=/[\u3000-\u30ff\u4e00-\u9fff\uff01-\uff60]/,o=[];const w=document.createTreeWalker(document.body,4);let t;while(t=w.nextNode()){if(t.parentNode.closest('script,style'))continue;if(J.test(t.nodeValue))o.push('text:'+t.nodeValue.trim())}
for(const e of document.querySelectorAll('*')){for(const a of ['placeholder','title','aria-label','alt'])if(J.test(e.getAttribute(a)||''))o.push(a+':'+e.getAttribute(a));if('value' in e&&typeof e.value=='string'&&J.test(e.value))o.push('value:'+e.value);if(e.href&&/intent\/tweet/.test(e.href)&&J.test(decodeURIComponent(e.href)))o.push('share:'+decodeURIComponent(e.href))}
if(J.test(document.title))o.push('title:'+document.title);return o}))found.add(where+' | '+f)};
await scan('hero');
for(let i=0;i<n;i++){await p.evaluate(i=>go(i),i);await p.waitForTimeout(300);
for(let r=0;r<2;r++){const btns=await p.$$('#app section:not([hidden]) button, #app section:not([hidden]) input[type=range]');for(const e of btns){if(!await e.isVisible())continue;try{if(await e.getAttribute('type')=='range')await e.fill('4');else await e.click({timeout:500})}catch(x){}await p.waitForTimeout(150)}}
await p.waitForTimeout(1500);await scan('ch'+i);}
// play fake-tx game to end
const gi=await p.evaluate(()=>[...document.querySelectorAll('#app section')].findIndex(s=>s.dataset.t=='ニセ取引'));await p.evaluate(i=>go(i),gi);
for(let k=0;k<40;k++){const y=await p.$('#gYes:not([disabled])');if(y)await y.click().catch(()=>{});await p.waitForTimeout(400);if(await p.$('#gEnd:not([hidden])'))break}await scan('game-end');
console.log(tag,'errs',errs,'dialogs',dlg);for(const f of found){console.log('  JA>',f.slice(0,160));bad++}}
await b.close();console.log(bad?'FAIL '+bad:'PASS: no Japanese in EN mode');process.exit(bad?1:0)})();
