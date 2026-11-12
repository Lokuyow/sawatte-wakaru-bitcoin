// tests/util.js — smoke / visual / enscan 共通ヘルパー (E-06)
// サーバー URL は環境変数 BASE 1か所のみ（既定 http://127.0.0.1:8765/）。
// 待機系の明示 timeout の既定値 (E-04)。
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const TIMEOUT = 5000; // 条件待ち・クリック等の標準 timeout (ms)

const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));

function launchBrowser() {
  return chromium.launch({ headless: true, executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
}

// boot: 新規 context + page を作り、初期 localStorage を先置きして BASE を開き #start を押す。
// opts: { w, h, lang, theme, reducedMotion, deviceScaleFactor, seed, noStart }
//   seed: {key: value} を localStorage.clear() の後に追加で set する（resume/移行テスト用）。
// 戻り値の errs は pageerror + console error + requestfailed を合算した配列 (E-12)。
// requests はリクエスト URL の記録（en.js 非読込 assert 等に使う）。
async function boot(browser, opts = {}) {
  const { w = 375, h = 812, lang = 'ja', theme = null, reducedMotion, deviceScaleFactor, seed = null, noStart = false } = opts;
  const ctxOpts = { viewport: { width: w, height: h } };
  if (theme) ctxOpts.colorScheme = theme === 'dark' ? 'dark' : 'light';
  if (reducedMotion) ctxOpts.reducedMotion = reducedMotion;
  if (deviceScaleFactor) ctxOpts.deviceScaleFactor = deviceScaleFactor;
  const c = await browser.newContext(ctxOpts);
  const p = await c.newPage();
  const errs = [], pageErrs = [], consoleErrs = [], reqFails = [], requests = [];
  p.on('pageerror', e => { pageErrs.push(e.message); errs.push(e.message); });
  p.on('console', m => { if (m.type() === 'error') { consoleErrs.push(m.text()); errs.push('console: ' + m.text()); } });
  p.on('requestfailed', r => { const msg = r.url() + ' ' + (r.failure() ? r.failure().errorText : ''); reqFails.push(msg); errs.push('requestfailed: ' + msg); });
  p.on('request', r => requests.push(r.url()));
  await p.addInitScript(({ lang, theme, seed }) => {
    try {
      // 初回ロード時のみ初期化する。reload を伴うシナリオ（テーマ/言語切替・resume）で
      // アプリ自身が保存した状態を init script が消さないため (E-10)。
      if (sessionStorage.getItem('__swboot')) return;
      sessionStorage.setItem('__swboot', '1');
      localStorage.clear();
      if (lang === 'en') localStorage.setItem('sw-lang', 'en');
      if (theme) localStorage.setItem('sw-theme', theme);
      if (seed) for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
    } catch (e) {}
  }, { lang, theme, seed });
  await p.goto(BASE, { waitUntil: 'load' });
  if (!noStart) await p.click('#start', { timeout: TIMEOUT });
  p.setDefaultTimeout(TIMEOUT); // 待機系に一律の明示 timeout (E-04)
  return { p, c, errs, pageErrs, consoleErrs, reqFails, requests };
}

// go: data-t 名で章へ移動（#prog span の JS クリック。折りたたみステージ配下は実クリック不可のため J3 として維持）。
// 章が見つからない場合は章名入りの明示エラーを投げる (E-15)。移動後は .ch.on の data-t 一致を条件待ちする (S1/V1)。
async function go(p, t) {
  const idx = await p.evaluate(t => [...document.querySelectorAll('.ch')].findIndex(c => c.dataset.t === t), t);
  if (idx < 0) throw new Error('chapter not found: ' + t);
  await p.evaluate(i => { document.querySelectorAll('#prog span')[i].click(); }, idx);
  await p.waitForFunction(t => { const el = document.querySelector('.ch.on'); return el && el.dataset.t === t; }, t, { timeout: TIMEOUT });
}

// waitAnimsDone: 対象要素（省略時は .ch.on）の入場アニメーション完了を待つ (S2 / E-05)。
async function waitAnimsDone(p, sel) {
  await p.waitForFunction(sel => {
    const el = sel ? document.querySelector(sel) : document.querySelector('.ch.on');
    if (!el) return false;
    // 無限アニメーション (tGlow 等) は「完了」しないため対象外とし、有限アニメーションの終了だけを待つ
    return el.getAnimations({ subtree: true })
      .filter(a => { const t = a.effect && a.effect.getTiming(); return t && t.iterations !== Infinity; })
      .every(a => a.playState === 'finished' || a.playState === 'idle');
  }, sel || null, { timeout: TIMEOUT }).catch(() => {});
}

// assertActionable: JS クリック直前の補完 assert (J1/J2)。
// ボタンが enabled で、中心点の elementFromPoint がボタン自身または子要素であることを確認する。
async function assertActionable(p, sel) {
  const loc = p.locator(sel).first();
  const enabled = await loc.isEnabled().catch(() => false);
  const hitSelf = await loc.evaluate(el => {
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === el || el.contains(top));
  }).catch(() => false);
  return { enabled, hitSelf, ok: enabled && hitSelf };
}

module.exports = { BASE, TIMEOUT, launchBrowser, boot, go, waitAnimsDone, assertActionable };
