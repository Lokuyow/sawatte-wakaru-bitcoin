// i18n.js — 英語訳の二重管理チェック（D-3 再発防止）
//
// 英語訳は2か所で管理されている:
//   - en.js の辞書 D（静的テキスト用。キーは日本語の原文、値は英訳）
//   - app.js の L('日本語','English')（JS が生成するテキスト用）
// 同じ日本語キーに違う英訳が付くと、画面によって用語が揺れる。
// このテストは両者を機械抽出し、許可リスト以外の食い違いがあれば FAIL（終了コード 1）にする。
// 実行: node tests/i18n.js（ブラウザ・サーバー不要、Node のみ）
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// 許可リスト: 辞書と違う英訳が意図的に許されるキー。
// app 側の値は「文の部品（断片）」や「活用形」で、単独表示用の辞書訳とは形が違う。
// 新しい食い違いをここに足すときは、必ず理由を書くこと（理由のない追加は用語揺れの温床になる）。
const ALLOW = {
  // 後ろにステージ名や番号を続けて合成するための、末尾スペース付き断片
  'ステージ': ['Stage '],
  // 「256 bits」のように数と合成する断片（辞書 "Bit" は単独表示用）
  'ビット': [' bits'],
  // 試行回数と合成する断片（辞書側は単独訳なし＝空文字）
  '回': [' tries'],
  // 数に続く複数形（辞書 "Block" は単独表示用）
  'ブロック': ['blocks'],
  // 文の途中に差し込む小文字の断片（辞書 "Checked with public key" は文頭形）
  '公開鍵でチェック': ['check with public key'],
  // 'Sign' はステップ見出しの動詞形（Write / Sign / Check の並び）、'Signed' は署名済みの状態表示。
  // 辞書 "Signature" は名詞の用語ラベル用で、意味が違う
  '署名': ['Sign', 'Signed'],
  // ニセ取引ゲームの判定スタンプ表示（「却下」='FAKE' と対）。
  // 辞書 "Confirmations"（承認の数）とは別の意味なので 'OK' のままにする
  '承認': ['OK'],
};

// --- en.js の辞書 D を抽出 ---
const enSrc = fs.readFileSync(path.join(root, 'en.js'), 'utf8');
const dStart = enSrc.indexOf('const D=') + 'const D='.length;
let depth = 0, dEnd = -1;
for (let i = dStart; i < enSrc.length; i++) {
  if (enSrc[i] === '{') depth++;
  else if (enSrc[i] === '}') { depth--; if (depth === 0) { dEnd = i + 1; break; } }
}
let D;
try { D = JSON.parse(enSrc.slice(dStart, dEnd)); }
catch (e) { console.error('FAIL: en.js の辞書 D を JSON として読めません:', e.message); process.exit(1); }

// --- app.js の L('JA','EN') を抽出 ---
const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const re = /L\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\)/g;
const unq = s => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const Lmap = new Map(); // JA -> [EN...]
let m;
while ((m = re.exec(appSrc)) !== null) {
  const ja = unq(m[1]), en = unq(m[2]);
  if (!Lmap.has(ja)) Lmap.set(ja, []);
  if (!Lmap.get(ja).includes(en)) Lmap.get(ja).push(en);
}

// --- 検査 ---
const violations = [];
let both = 0, checked = 0;
for (const [ja, ens] of Lmap) {
  const inDict = ja in D;
  if (inDict) both++;
  const allowed = ALLOW[ja] || [];
  for (const en of ens) {
    checked++;
    if (inDict) {
      if (en === D[ja]) continue;                   // 辞書と一致 → OK
      if (allowed.includes(en)) continue;           // 許可リスト → OK
      violations.push({ ja, dict: D[ja], app: en, kind: '辞書と食い違い' });
    } else if (ens.length > 1) {
      // 辞書にないキーは app 専用なので単独では問題なし。
      // ただし app の中だけで同じ日本語に複数の英訳が付いていたら揺れになる
      if (allowed.includes(en)) continue;           // 許可リスト → OK
      violations.push({ ja, dict: '(辞書になし)', app: en, kind: 'app.js 内で複数の英訳' });
    }
  }
}

console.log(`辞書キー: ${Object.keys(D).length} / L() の日本語キー: ${Lmap.size} / 両方にあるキー: ${both} / 照合した英訳: ${checked}`);
console.log(`許可リスト: ${Object.keys(ALLOW).length} キー`);
if (violations.length) {
  console.error(`FAIL: 許可リスト以外の食い違いが ${violations.length} 件あります:`);
  for (const v of violations)
    console.error(`  [${v.kind}] ${JSON.stringify(v.ja)}\n    辞書: ${JSON.stringify(v.dict)}\n    app : ${JSON.stringify(v.app)}`);
  console.error('直し方: どちらかの英訳に統一するか、意図的な断片・活用形なら理由つきで ALLOW に追加してください。');
  process.exit(1);
}
console.log('PASS: 辞書と L() の英訳は（許可リストを除き）すべて一致しています');
