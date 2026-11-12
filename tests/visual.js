const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const OUT=process.env.SHOT_DIR||'/opt/cursor/artifacts';
fs.mkdirSync(OUT,{recursive:true});
const exe=['/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>fs.existsSync(p));
const hit=(a,b)=>{const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return x>0.5&&y>0.5};

(async()=>{
const b=await chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage']});
const shots=[];
async function boot(w,h,lang,theme){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:theme==='dark'?'dark':'light',deviceScaleFactor:1});
  const p=await c.newPage();
  await p.addInitScript(({lang,theme})=>{try{localStorage.clear();if(lang==='en')localStorage.setItem('sw-lang','en');if(theme)localStorage.setItem('sw-theme',theme)}catch(e){}},{lang,theme});
  await p.goto('http://localhost:8765/',{waitUntil:'load'});
  await p.click('#start');
  return {p,c};
}
async function go(p,t){await p.evaluate(t=>{const i=[...document.querySelectorAll('.ch')].findIndex(c=>c.dataset.t===t);document.querySelectorAll('#prog span')[i].click()},t);await p.waitForTimeout(80)}
async function frame(p,sel){await p.evaluate(sel=>{const el=document.querySelector(sel);const head=document.querySelector('#app header');const top=(head?head.getBoundingClientRect().height:0)+8;scrollTo(0,Math.max(0,el.getBoundingClientRect().top+scrollY-top))},sel);await p.waitForTimeout(40)}
async function shot(p,name){const file=path.join(OUT,name+'.png');await p.screenshot({path:file});shots.push(file);console.log('shot',name)}
for(const [w,h,lang,theme,tag] of [[375,812,'ja','light','375-ja-light'],[375,812,'ja','dark','375-ja-dark'],[375,812,'en','light','375-en-light'],[1280,860,'ja','light','1280-ja-light']]){
  const {p,c}=await boot(w,h,lang,theme);
  await go(p,'かたまり');
  await frame(p,'.ch[data-t="かたまり"] h2');
  await shot(p,'14-idle-'+tag);
  await p.locator('#uxA .lump[data-amt="3"]').click();
  await frame(p,'#ux');
  await shot(p,'14-select-'+tag);
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ok');
  await frame(p,'#ux');
  await shot(p,'14-sent-'+tag);
  await p.locator('#uxA .lump[data-state="spent"]').click();
  await p.click('#uxGo');
  await p.waitForSelector('#uxMsg.ng');
  await frame(p,'#ux');
  await shot(p,'14-reject-'+tag);
  const q=p.locator('.ch[data-t="かたまり"] .quiz').first();
  await q.locator('button').nth(0).click();
  await p.waitForTimeout(80);
  await frame(p,'.ch[data-t="かたまり"] .quiz .ans');
  await shot(p,'14-quiz-'+tag);
  await go(p,'台帳');
  await p.locator('#tL button.p').nth(3).click();
  await p.locator('#tR button.p').nth(1).click();
  await p.evaluate(()=>document.getElementById('tSend').click());
  await p.waitForSelector('#tDouble:not([hidden])');
  await p.waitForTimeout(200);
  await p.evaluate(()=>document.getElementById('tDouble').scrollIntoView({block:'center',inline:'nearest'}));
  await p.waitForTimeout(80);
  const over=await p.evaluate(()=>{const a=document.getElementById('tDouble').getBoundingClientRect(),n=document.getElementById('next').getBoundingClientRect(),f=document.querySelector('#app footer').getBoundingClientRect();
    const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>0.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0.5;
    return hit(a,n)||hit(a,f)});
  if(over){await shot(p,'13-OVERLAP-'+tag);throw new Error('overlap '+tag)}
  await shot(p,'13-next-'+tag);
  await c.close();
}
const {p,c}=await boot(375,812,'ja','light');
await go(p,'マイニング');
await p.click('#dHr button[data-h="many"]');
await frame(p,'#dAdj');
await shot(p,'23-adjust-375-ja-light');
await p.click('#dMyth summary');
await p.waitForTimeout(50);
await frame(p,'#dMyth');
await shot(p,'23-myth-open-375-ja-light');
await p.evaluate(()=>{const f=document.querySelector('#app footer');f.dataset.keep=f.style.display;f.style.setProperty('display','none','important')});
await p.locator('#dMyth').screenshot({path:path.join(OUT,'23-myth-open-full-375-ja-light.png')});
await p.evaluate(()=>{const f=document.querySelector('#app footer');f.style.display=f.dataset.keep||''});
shots.push(path.join(OUT,'23-myth-open-full-375-ja-light.png'));
await go(p,'ブロックが届く');
await frame(p,'.ch[data-t="ブロックが届く"] h2');
await shot(p,'24-why-375-ja-light');
await go(p,'報酬半減');
await frame(p,'.ch[data-t="報酬半減"] h2');
await shot(p,'32-halving-intro-375-ja-light');
await c.close();
{const en=await boot(375,812,'en','light');
await go(en.p,'報酬半減');
await frame(en.p,'.ch[data-t="報酬半減"] h2');
await shot(en.p,'32-halving-intro-375-en-light');
await en.c.close();}
await b.close();
console.log('VISUAL OK',shots.length);
})().catch(e=>{console.error(e);process.exit(1)});
