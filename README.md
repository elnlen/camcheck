# CamCheck

ブラウザだけで完結する、無料のWebカメラ診断・撮影・スキャンツール集です。
ビルドツール不要の素のHTML/CSS/JSで、GitHub Pagesにそのまま置けます。

## ページ一覧

| ページ | 内容 |
|---|---|
| `index.html` | Webカメラテスト（解像度・FPS・明るさをライブ測定） |
| `show-camera.html` | 接続カメラの一覧とスペック表示 |
| `photo-capture.html` | 静止画をその場で撮影・保存 |
| `resolution-test.html` | 480p〜4Kの実対応解像度を測定 |
| `call-readiness.html` | カメラ・マイク・スピーカー・回線速度の通話前チェック |
| `qr-scanner.html` | カメラでQRコードを読み取り（jsQR同梱） |
| `green-screen.html` | クロマキー方式のリアルタイム背景合成テスト |
| `troubleshooting.html` | 「映らない」系トラブルのFAQ・手順 |
| `about.html` | サイト概要・プライバシー方針 |
| `contact.html` | お問い合わせ（Googleフォーム埋め込み＋メール） |
| `sitemap.html` | 人間向けの全ページ一覧 |

すべてのカメラ処理はブラウザ内（`getUserMedia` / `Canvas`）で完結し、外部送信はありません。

## ナビゲーションについて

普通に横一列で表示されるシンプルなナビです（`.nav` / `css/style.css`）。
小さめのmonoフォント＋タイトな余白で、通常のデスクトップ幅なら10項目が
1行に収まります。画面が狭くなると、スクロールではなく折り返しで
2行目に流れます。ページを追加する場合は、各ページのヘッダー内
`<nav class="nav">` に `<a href="new-page.html">ラベル</a>` を追加してください
（全ページ分の手動更新が必要です — 現状はテンプレート化していません）。

## お問い合わせページについて

`contact.html` はGoogleフォームの埋め込みが主、メールが予備という構成にしています。
静的サイト（バックエンドなし）でも動くこと、スパム防止（mailtoはメールアドレスが
HTMLソースにそのまま出るため収集されやすい）、回答が自動でスプレッドシートに
たまり集計しやすいことが理由です。

**セットアップ手順：**
1. Google Formsで新しいフォームを作成する（項目例：種別［バグ／要望／広告について／その他］、
   ページ、ブラウザ・端末、内容）。
2. フォーム編集画面右上の「送信」→「埋め込み `<>`」タブでURLを取得する。
3. `contact.html` 内の以下の行を、実際の埋め込みURLに差し替える：
   ```html
   <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf_YOUR_FORM_ID/viewform?embedded=true" ...>
   ```
4. `iframe` の `height` はフォームの項目数に応じて調整してください（目安：項目1つにつき約80px）。

メールアドレス（`mailto:hello@example.com`）も実際のアドレスに差し替えてください。

## SEO関連ファイルについて

今回、以下を新たに追加しました。以前は無かったものです。

- **`assets/favicon.svg` / `favicon-32.png` / `favicon-16.png` / `apple-touch-icon.png`**
  — ブランドカラーに合わせて生成したファビコン一式。
- **`assets/og-image.png`**（1200×630）— X（Twitter）やLINE、Slackなどでリンクを
  共有したときに表示されるカード画像。サイトのデザイントークンから直接生成しています。
- **OGP / Twitter Card メタタグ** — 各ページの `<title>` / `meta description` /
  `canonical` から自動生成し、全ページの `<head>` に追加済みです。
- **`robots.txt`** / **`sitemap.xml`** — 検索エンジン向け。XMLサイトマップは
  `sitemap.html`（人間向け）とは別物です。
- **FAQPage構造化データ（JSON-LD）** — FAQセクションのあるページ（index、
  show-camera、photo-capture、resolution-test、call-readiness、qr-scanner、
  green-screen）に、既存のFAQ文面から自動生成して追加しました。Google検索結果で
  リッチリザルト（質問と回答の折りたたみ表示）として表示される可能性があります。

いずれもドメインを `https://elnlen.github.io/camcheck/` 前提で生成しているので、
独自ドメインに変更した場合は `sitemap.xml` と各ページの `og:url` /
`twitter:image` 等を再生成し直す必要があります。

## ローカルで確認する

```bash
python3 -m http.server 8000
# http://localhost:8000 を開く
```

`file://` で直接開くとカメラ許可が正しく動かないブラウザがあるため、
必ずローカルサーバー経由で確認してください。

## GitHub Pagesへのデプロイ

1. リポジトリの **Settings → Pages** で、公開ブランチを `main`（フォルダは `/root`）に設定する。
2. 数分後、`https://<username>.github.io/<repo>/` で公開される。

## 気になった点（要対応）

リポジトリ直下に `a3c19empRs` という拡張子なしのファイルがありました。
中身を確認したところ、CamCheckとは無関係な別サービス（ToffeeShareという
ファイル共有サイト）のHTMLがそのまま入っていました。おそらく `wget` や
「名前を付けて保存」などで誤ってコミットされたものです。CamCheckの動作には
一切使われていないので、削除して問題ありません。
