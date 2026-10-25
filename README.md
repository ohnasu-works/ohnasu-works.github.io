# Oh!nasu works サイト

そのまま GitHub Pages などに置ける静的サイトです（HTML + CSS のみ）。

## 構成
- index.html … スタジオのトップ（アプリ一覧・TikTok・About・お問い合わせ）
- daystitch/index.html … Daystitch の紹介ページ
- daystitch/privacy.html … プライバシーポリシー（App Store に登録する URL）
- daystitch/support.html … サポート（App Store に登録する URL）
- assets/site.css … 全ページ共通のデザイン
- assets/img/ … 写真・アイコン

## 差し替えが必要な場所（「★」で検索）
- App Store の URL と公式バッジ（公開後。index.html・daystitch/index.html）

## 新しいアプリを追加する時
1. daystitch フォルダをコピーして、アプリ名のフォルダにする（例: nextapp/）
2. 中の文章・画像・色（body の class）を書き換える
3. index.html の「No.02 開発中」の枠を、Daystitch の枠（app-feature）と同じ形に書き換える
