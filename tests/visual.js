// visual.js — 目視確認用スクリーンショット撮影 (51枚)。
// 成功時の最終行 `VISUAL OK 51` は「撮影完了＋pageerror なし」を意味する (E-20 / tests/README.md)。
// boot 単位で try/catch し、1 boot の失敗で残り撮影が全滅しない構造 (E-13)。
// 並行度は環境変数 VISUAL_JOBS（既定2、上限3）で boot 単位に並行化する (E-07)。
const fs = require('fs');
const path = require('path');
const { TIMEOUT, launchBrowser, boot: utilBoot, go: utilGo, waitAnimsDone } = require('./util');
const OUT = process.env.SHOT_DIR || '/opt/cursor/artifacts';
fs.mkdirSync(OUT, { recursive: true });
const JOBS = Math.max(1, Math.min(3, parseInt(process.env.VISUAL_JOBS || '2', 10) || 2));

(async () => {
  const b = await launchBrowser();
  const shots = [];
  const failures = [];
  const allPageErrs = [];
  async function boot(w, h, lang, theme, tag) {
    const r = await utilBoot(b, { w, h, lang, theme, deviceScaleFactor: 1 });
    const origClose = r.c.close.bind(r.c);
    r.c.close = async () => { allPageErrs.push(...r.pageErrs.map(m => tag + ': ' + m)); await origClose().catch(() => {}); };
    return r;
  }
  const go = (p, t) => utilGo(p, t); // V1: 章切替は .ch.on の data-t 一致で条件待ち（固定 sleep 廃止）
  // V2: スクロールは scrollY が目標値と一致するまで条件待ちする
  async function frame(p, sel) {
    const target = await p.evaluate(sel => {
      const el = document.querySelector(sel);
      const head = document.querySelector('#app header');
      const top = (head ? head.getBoundingClientRect().height : 0) + 8;
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      return Math.min(max, Math.max(0, el.getBoundingClientRect().top + scrollY - top));
    }, sel);
    await p.evaluate(y => scrollTo(0, y), target);
    await p.waitForFunction(y => Math.abs(scrollY - y) < 1, target, { timeout: TIMEOUT }).catch(() => {});
  }
  // E-05: 撮影直前に、その章の入場アニメーション完了を待つ
  async function shot(p, name) {
    await waitAnimsDone(p);
    const file = path.join(OUT, name + '.png');
    await p.screenshot({ path: file });
    shots.push(file);
    console.log('shot', name);
  }

  async function comboJob(w, h, lang, theme, tag) {
    const { p, c } = await boot(w, h, lang, theme, tag);
    try {
      await go(p, 'かたまり');
      await frame(p, '.ch[data-t="かたまり"] h2');
      await shot(p, '14-idle-' + tag);
      if (lang === 'ja' && w === 375) {
        await frame(p, '#uxAmt');
        await shot(p, '14-amt-default-' + tag);
        await p.locator('#uxA .tama[data-amt="2.5"]').click();
        await p.locator('#uxAmt button[data-u="3"]').click();
        await frame(p, '#uxAmt');
        await shot(p, '14-amt-15-' + tag);
        await p.locator('#uxAmt button[data-u="2"]').click();
      } else {
        await p.locator('#uxA .tama[data-amt="2.5"]').click();
        await p.locator('#uxAmt button[data-u="2"]').click();
      }
      await frame(p, '#uxA');
      await shot(p, '14-select-' + tag);
      await p.evaluate(() => document.getElementById('uxGo').click());
      await p.waitForSelector('#uxMsg.ok', { timeout: TIMEOUT });
      await frame(p, '#uxA');
      await shot(p, '14-sent-' + tag);
      await frame(p, '#uxTx');
      await shot(p, '14-strip-' + tag);
      await p.locator('#uxA .tama[data-state="spent"]').click();
      await p.evaluate(() => document.getElementById('uxGo').click());
      await p.waitForSelector('#uxMsg.ng', { timeout: TIMEOUT });
      await frame(p, '#uxMsg');
      await shot(p, '14-reject-' + tag);
      const q = p.locator('.ch[data-t="かたまり"] .quiz').first();
      await q.locator('button').nth(0).click();
      // V3: 回答表示 (.ans) が表示状態になるのを待ってから撮る（固定 sleep 廃止）
      await p.waitForFunction(() => { const a = document.querySelector('.ch[data-t="かたまり"] .quiz .ans'); return a && !a.hidden; }, null, { timeout: TIMEOUT });
      await frame(p, '.ch[data-t="かたまり"] .quiz .ans');
      await shot(p, '14-quiz-' + tag);
      await go(p, '台帳');
      await frame(p, '.ch[data-t="台帳"] h2');
      if (lang === 'ja' && w === 375) await shot(p, '13-idle-' + tag);
      await p.locator('#tL button.p').nth(3).click();
      await p.locator('#tR button.p').nth(1).click();
      await p.evaluate(() => document.getElementById('tSend').click());
      await p.waitForSelector('#log li.ok', { timeout: TIMEOUT });
      // V4: 意図的な固定待ち — 撮りたい状態は「送信直後の伝播表示が落ち着いた見た目」のため、条件待ち化せず意図を明記して維持する
      await p.waitForTimeout(200);
      if (await p.locator('#tDouble').count()) throw new Error('tDouble still present ' + tag);
      if (lang === 'ja' && w === 375) {
        await frame(p, '#ldNet');
        await shot(p, '13-sent-' + tag);
        await frame(p, '.ch[data-t="台帳"] .quiz');
        await shot(p, '13-quiz-' + tag);
      }
      await shot(p, '13-next-' + tag);
    } finally { await c.close().catch(() => {}); }
  }

  async function tailMainJob() {
    const { p, c } = await boot(375, 812, 'ja', 'light', 'tail-main');
    try {
      await go(p, 'マイニング');
      await frame(p, '.ch[data-t="マイニング"] h2');
      await shot(p, '23-prose-375-ja-light');
      await frame(p, '#mMyth');
      await shot(p, '23-myths-then-quiz-375-ja-light');
      await frame(p, '.ch[data-t="マイニング"] .quiz');
      await shot(p, '23-quiz-375-ja-light');
      await frame(p, '#dMyth');
      await shot(p, '23-myth-closed-375-ja-light');
      await p.click('#dMyth summary');
      // V5: details の展開状態 (open) を条件待ちする（固定 sleep 廃止）
      await p.waitForFunction(() => document.getElementById('dMyth').open === true, null, { timeout: TIMEOUT });
      await frame(p, '#dMyth');
      await shot(p, '23-myth-open-375-ja-light');
      await p.evaluate(() => { const f = document.querySelector('#app footer'); f.dataset.keep = f.style.display; f.style.setProperty('display', 'none', 'important'); });
      await waitAnimsDone(p);
      await p.locator('#dMyth').screenshot({ path: path.join(OUT, '23-myth-open-full-375-ja-light.png') });
      await p.evaluate(() => { const f = document.querySelector('#app footer'); f.style.display = f.dataset.keep || ''; });
      shots.push(path.join(OUT, '23-myth-open-full-375-ja-light.png'));
      console.log('shot', '23-myth-open-full-375-ja-light');
      await go(p, 'ブロックが届く');
      await frame(p, '.ch[data-t="ブロックが届く"] h2');
      await shot(p, '24-why-375-ja-light');
      await frame(p, '.ch[data-t="ブロックが届く"] .quiz');
      await shot(p, '24-quiz-375-ja-light');
      await go(p, '報酬半減');
      await frame(p, '.ch[data-t="報酬半減"] h2');
      await shot(p, '32-halving-intro-375-ja-light');
    } finally { await c.close().catch(() => {}); }
  }

  async function tailEnJob() {
    const en = await boot(375, 812, 'en', 'light', 'tail-en');
    try {
      await go(en.p, '報酬半減');
      await frame(en.p, '.ch[data-t="報酬半減"] h2');
      await shot(en.p, '32-halving-intro-375-en-light');
    } finally { await en.c.close().catch(() => {}); }
  }

  async function tailDkJob() {
    const dk = await boot(375, 812, 'ja', 'dark', 'tail-dk');
    try {
      await go(dk.p, 'マイニング');
      await frame(dk.p, '.ch[data-t="マイニング"] .quiz');
      await shot(dk.p, '23-quiz-375-ja-dark');
      await frame(dk.p, '#dMyth');
      await shot(dk.p, '23-myth-closed-375-ja-dark');
      await go(dk.p, 'ブロックが届く');
      await frame(dk.p, '.ch[data-t="ブロックが届く"] .quiz');
      await shot(dk.p, '24-quiz-375-ja-dark');
    } finally { await dk.c.close().catch(() => {}); }
  }

  const jobs = [
    () => comboJob(375, 812, 'ja', 'light', '375-ja-light'),
    () => comboJob(375, 812, 'ja', 'dark', '375-ja-dark'),
    () => comboJob(375, 812, 'en', 'light', '375-en-light'),
    () => comboJob(1280, 860, 'ja', 'light', '1280-ja-light'),
    tailMainJob, tailEnJob, tailDkJob,
  ];
  let idx = 0;
  async function worker() {
    while (idx < jobs.length) {
      const i = idx++;
      try { await jobs[i](); } catch (e) { failures.push('job' + i + ': ' + (e && e.message)); console.log('JOB FAIL', i, e && e.message); }
    }
  }
  await Promise.all(Array.from({ length: JOBS }, worker));
  await b.close();
  if (allPageErrs.length) { console.log('PAGEERRORS', allPageErrs.length, allPageErrs.join(' | ')); failures.push('pageerror x' + allPageErrs.length); }
  if (failures.length) { console.log('FAIL', failures.length, failures.join(' | ')); process.exit(1); }
  console.log('VISUAL OK', shots.length);
})().catch(e => { console.error(e); process.exit(1); });
