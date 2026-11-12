# tests/ — 「さわってわかるビットコイン」テストスイート

正規スイートは `smoke.js` / `visual.js` / `enscan.js` の3本と、共通ヘルパー `util.js` です。
ほかに、ブラウザ不要の軽量チェック `i18n.js`（Node のみ）があります。
対象コード（`app.js` / `style.css` / `en.js` / `index.html`）は変更しません。

## 前提

- 静的サーバーがリポジトリ root を配信していること（既定ポート 8765）。
  起動例（リポジトリ root で）:

  ```sh
  python3 -m http.server 8765
  ```

- Playwright はリポジトリ外のモジュール置き場から解決します。実行時は `NODE_PATH` を指定してください:

  ```sh
  export NODE_PATH=~/workspace/tools/pwtest/node_modules
  ```

  ブラウザはバンドル chromium にフォールバックして動きます（無ければ `/usr/bin/google-chrome` / `/usr/bin/chromium` を使用）。

## 環境変数

| 変数 | 既定値 | 意味 |
|---|---|---|
| `BASE` | `http://127.0.0.1:8765/` | サーバー URL（指定は `util.js` の1か所のみ） |
| `VISUAL_JOBS` | `2`（上限3） | visual の boot 単位の並行度 |
| `SHOT_DIR` | `/opt/cursor/artifacts` | visual の撮影出力先 |

## 各ファイルの役割と実行コマンド

いずれもリポジトリ root で実行します。

### smoke.js — 合否ゲート（本体）

全18章の巡回（walk: 幅×言語×テーマの組合せで、はみ出し・`pageerror`・console error・`requestfailed`・英語時の未訳キー・「半減期」用語を検証）と、操作系の検証（act: 1-4 UTXO / 1-3 台帳 / 2-3 難易度調整 / 2-4 / 3-2）、追加シナリオ（テーマ切替・言語切替・resume・保存移行・実ナビゲーション・主要デモの最小アサーション・reduced-motion）を実行します。失敗は集積され、最後に `ALL PASS` または `FAIL`（終了コード 1）で終わります。

```sh
NODE_PATH=~/workspace/tools/pwtest/node_modules node tests/smoke.js
```

所要時間の目安: 約50秒（この VM 実測、z96 時点）。

### visual.js — 目視確認用スクリーンショット撮影（51枚）

状態×言語×テーマの組合せで 51 枚を撮影します。
最終行の `VISUAL OK 51` は「51枚の撮影が完了し、かつ pageerror が無かった」ことを意味します。pageerror がある場合や撮影が失敗した場合は `FAIL` となり、終了コード 1 で終わります（撮影できたことだけでは合格になりません）。

```sh
NODE_PATH=~/workspace/tools/pwtest/node_modules node tests/visual.js
```

所要時間の目安: 約20秒（`VISUAL_JOBS=2`、この VM 実測、z96 時点）。

### enscan.js — 英語モードの日本語残留走査

英語モードで全章を巡回し、各章のボタンを一通り操作した後に、テキスト・属性・input value・X シェア href・タイトルに日本語が残っていないかを走査します。日本語検出に加え、走査中の pageerror も不合格に含みます。クリックできなかった要素は件数（`clickFail`）として表示します。

```sh
NODE_PATH=~/workspace/tools/pwtest/node_modules node tests/enscan.js
```

所要時間の目安: 数分（ボタンの乱雑クリック走査を含むため最も時間がかかります）。

### i18n.js — 英語訳の二重管理チェック

`en.js` の辞書 D と `app.js` の `L('日本語','English')` を機械抽出し、同じ日本語キーに違う英訳が付いていないかを照合します（D-3 の再発防止）。文の部品（断片）や活用形として意図的に違うものは、テスト内の許可リスト `ALLOW` に理由つきで登録されています。許可リスト以外の食い違いがあると一覧を表示して終了コード 1 で終わります。サーバーも Playwright も不要です。

```sh
node tests/i18n.js
```

### util.js — 共通ヘルパー

`launchBrowser` / `boot`（新規 context、初期 localStorage、エラー収集）/ `go`（章移動）/ `waitAnimsDone` / `assertActionable` を3本で共用します。単体では実行しません。
