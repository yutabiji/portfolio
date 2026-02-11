# PDF出力機能 引き継ぎ書

## 目的

俳優ポートフォリオサイト (`/portfolio/print/`) のPDF出力機能を、スマホでもPCでも同じレイアウトで出力できるようにする。

## 背景・経緯

元々は `window.print()` + `@media print` CSS でPDF出力していたが、スマホとPCでレイアウトが異なる問題があった。ブラウザのプリントエンジンに依存するため根本的な限界。

### 実施した変更

1. **`window.print()` を廃止** → html2canvas-pro + jsPDF によるクライアントサイドPDF生成に移行
2. **Tailwind CSS v4 の oklch 問題を解決** → html2canvas (旧版) は `oklch()` カラーを解析できなかったため、oklch対応フォーク `html2canvas-pro` に切り替えた
3. **`print:` プレフィックスのTailwindクラスを除去** → 画面表示=PDF出力のWYSIWYG化（この画面はPDF専用なので問題ない）

### 試して失敗したアプローチ

| 手法 | 結果 |
|---|---|
| html2pdf.js (npm) | Vite/ESMとの互換性問題（`self is not defined`） |
| html2pdf.js (CDN v0.10.2) | 内蔵html2canvasがoklch非対応 |
| oncloneで全スタイルをインライン化→スタイルシート削除 | html2canvasがクローン時点でCSS解析するため間に合わない |
| html2pdf呼び出し前にスタイルシートのoklch→rgb変換 | Vite dev modeのCSS再注入で変換が無効化される |
| html2pdf呼び出し前にDOM直接操作+スタイルシート全削除 | 「少し時間をおいて」再度oklchエラー。Vite HMRが再注入していると推定 |

**最終的に成功した構成:** html2canvas-pro (oklchネイティブ対応) + jsPDF (CDN)

## 現在の状態

**PDF生成自体は成功している。** 残っている問題は1つだけ:

### 残課題: プロフィール写真がPDF上で大きく表示されすぎる

**症状:** PDF 1ページ目で写真が大きく、プロフィール情報（名前・生年月日など）が見切れる

**該当箇所:** `src/pages/print.astro` L61-75

```html
<div class="flex gap-6 mb-4 h-[91mm]">
  <!-- Photo -->
  <div class="shrink-0 w-48 h-full">  <!-- ← ここの幅調整が必要 -->
    <div class="bg-stone-200 ... h-full overflow-hidden">
      <img src="..." class="w-full h-full object-cover" />
    </div>
  </div>
  <!-- Info table -->
  <div class="flex-1"> ... </div>
</div>
```

**写真の実寸:** 1146 x 1428px（約4:5のポートレート）

**考えられる原因と対策:**
- 現在 `w-48`（192px）。html2canvasの `windowWidth: 794` で描画されるため、PDF上で `192/794 * 210mm ≈ 50.7mm` の幅になる。これ自体は適切なはずだが、PDF上で見切れが発生している
- html2canvasのキャプチャ時に、画面上の見た目とは異なるレンダリングが発生している可能性がある
- `h-[91mm]`（CSS mm単位）がhtml2canvasの794pxビューポートで正しく計算されているか検証が必要
- `object-cover` が意図通りに機能しているか（画像が拡大されすぎていないか）確認が必要

**試すべきこと:**
1. `h-[91mm]` をpx単位に変換して試す（91mm ≈ 344px → `h-[344px]`）
2. 写真コンテナの幅をさらに小さく（`w-36` = 144px 等）
3. 実際に生成されたPDFのスクリーンショットを見て、レイアウトのどこが崩れているか特定する
4. html2canvasに渡す前にブラウザ上のレンダリングが正しいか（devtoolsで794px幅に設定して）確認

## 技術構成

### 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/pages/print.astro` | PDF出力ページ本体（レイアウト + JS） |
| `src/layouts/PrintLayout.astro` | 印刷用HTMLレイアウト（CDNスクリプト読込） |
| `src/styles/global.css` | グローバルCSS（@media print ルールは現在未使用だが残存） |
| `src/content/profile/` | プロフィールデータ（YAML/Markdown） |
| `src/content/works/` | 出演実績データ（YAML） |
| `public/images/profile.jpg` | プロフィール写真 (1146x1428px) |
| `public/images/gallery/` | ギャラリー画像 |

### PDF生成フロー

```
ユーザーが「PDF」ボタンクリック
  ↓
1. Astro devツールバーを除去（dev時のみ）
2. .no-print / .excluded / .print-hidden 要素をDOMから除去
3. #pdf-content の直接子要素を順番に html2canvas-pro でキャプチャ
   - 1つ目: プロフィール+出演実績（1ページ目）
   - 2つ目: ギャラリー（2ページ目、非表示なら省略）
4. 各canvasをjsPDFでA4ページに配置
   - はみ出す場合は複数ページに分割
5. PDFファイルを保存
6. location.reload() でページを元に戻す
```

### 外部依存 (CDN)

- **html2canvas-pro v1.6.6** — `https://unpkg.com/html2canvas-pro@1.6.6/dist/html2canvas-pro.min.js`
  - html2canvasのフォーク。oklch/lab/lch等のモダンCSS色関数に対応
- **jsPDF v2.5.1** — `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
  - PDFドキュメント生成

### チェックボックス選択機能

ユーザーは出演実績・ギャラリーの項目をチェックボックスで選択/除外できる。除外された項目は `.excluded` クラスが付与され、PDF生成時にDOMから除去される。全項目を除外したカテゴリは `.print-hidden` で非表示になる。

### 重要な制約

- **Tailwind CSS v4** が `oklch()` カラーを使用 → html2canvas (旧版) は非対応。必ず **html2canvas-pro** を使うこと
- **スクリプトは `is:inline`** — Astroのバンドラーを通さずブラウザで直接実行（CDNグローバル変数を使用するため）
- **PDF生成後に `location.reload()`** — DOM要素を直接削除するため、ページをリロードして復元

## コマンド

```bash
npm run dev      # 開発サーバー http://localhost:4321/portfolio
npm run build    # 本番ビルド
npm run preview  # ビルド結果のプレビュー
```

PDF出力ページ: `http://localhost:4321/portfolio/print/`
