// enscan.js — 英語モードで日本語が残っていないかの走査。
// 合否: 日本語検出に加え、走査中の pageerror (errs) も不合格に含める (E-14)。
// クリックできなかった要素は件数を集計して表示する (E-14)。走査設計自体は従来どおり。
const { launchBrowser, boot: utilBoot } = require('./util');
(async () => {
  const b = await launchBrowser();
  let bad = 0;
  for (const [w, h, tag] of [[375, 800, 'mobile'], [1280, 900, 'desktop']]) {
    const { p, c, pageErrs: errs } = await utilBoot(b, { w, h, lang: 'en' });
    const dlg = [];
    let clickFail = 0;
    p.on('dialog', d => { dlg.push(d.message()); d.dismiss(); });
    const n = await p.$$eval('#app section', s => s.length);
    const found = new Set();
    const scan = async where => { for (const f of await p.evaluate(() => { const J = /[\u3000-\u30ff\u4e00-\u9fff\uff01-\uff60]/, o = []; const w = document.createTreeWalker(document.body, 4); let t; while (t = w.nextNode()) { if (t.parentNode.closest('script,style')) continue; if (J.test(t.nodeValue)) o.push('text:' + t.nodeValue.trim()); } for (const e of document.querySelectorAll('*')) { for (const a of ['placeholder', 'title', 'aria-label', 'alt']) if (J.test(e.getAttribute(a) || '')) o.push(a + ':' + e.getAttribute(a)); if ('value' in e && typeof e.value == 'string' && J.test(e.value)) o.push('value:' + e.value); if (e.href && /intent\/tweet/.test(e.href) && J.test(decodeURIComponent(e.href))) o.push('share:' + decodeURIComponent(e.href)); } if (J.test(document.title)) o.push('title:' + document.title); return o; })) found.add(where + ' | ' + f); };
    await scan('hero');
    for (let i = 0; i < n; i++) {
      await p.evaluate(i => go(i), i); await p.waitForTimeout(300);
      for (let r = 0; r < 2; r++) { const btns = await p.$$('#app section:not([hidden]) button, #app section:not([hidden]) input[type=range]'); for (const e of btns) { if (!await e.isVisible()) continue; try { if (await e.getAttribute('type') == 'range') await e.fill('4'); else await e.click({ timeout: 500 }); } catch (x) { clickFail++; } await p.waitForTimeout(150); } }
      await p.waitForTimeout(1500); await scan('ch' + i);
    }
    // play fake-tx game to end
    const gi = await p.evaluate(() => [...document.querySelectorAll('#app section')].findIndex(s => s.dataset.t == 'ニセ取引')); await p.evaluate(i => go(i), gi);
    for (let k = 0; k < 40; k++) { const y = await p.$('#gYes:not([disabled])'); if (y) await y.click().catch(() => {}); await p.waitForTimeout(400); if (await p.$('#gEnd:not([hidden])')) break; }
    await scan('game-end');
    console.log(tag, 'errs', errs, 'dialogs', dlg, 'clickFail', clickFail);
    for (const f of found) { console.log('  JA>', f.slice(0, 160)); bad++; }
    if (errs.length) { console.log('  PAGEERROR x' + errs.length); bad += errs.length; }
    await c.close();
  }
  await b.close();
  console.log(bad ? 'FAIL ' + bad : 'PASS: no Japanese in EN mode');
  process.exit(bad ? 1 : 0);
})();
