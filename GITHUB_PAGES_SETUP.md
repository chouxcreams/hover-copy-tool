# GitHub Pages セットアップガイド

このプロジェクトではStorybookをGitHub Pagesで自動ホスティングしています。

## 📋 セットアップ手順

### 1. リポジトリ設定

GitHubリポジトリでGitHub Pagesを有効にする必要があります：

1. GitHubのリポジトリページにアクセス
2. **Settings** タブをクリック
3. 左サイドバーで **Pages** をクリック
4. **Source** セクションで **GitHub Actions** を選択

### 2. 権限設定

GitHub Actionsがページをデプロイできるように権限を設定：

1. **Settings** > **Actions** > **General**
2. **Workflow permissions** セクションで以下を確認：
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

## 🚀 デプロイ方法

### 自動デプロイ

mainブランチにプッシュすると自動的にデプロイされます：

```bash
git push origin main
```

GitHub Actionsワークフロー（`.github/workflows/deploy-storybook.yml`）が以下を実行：

1. **ビルド**: `npm run build-storybook`
2. **デプロイ**: GitHub Pagesにアップロード

### 手動デプロイ

ローカルから手動でデプロイすることも可能：

```bash
npm run deploy-storybook
```

## 🔧 設定ファイル

### GitHub Actions ワークフロー
- **ファイル**: `.github/workflows/deploy-storybook.yml`
- **トリガー**: mainブランチへのプッシュ
- **Node.js**: v18
- **出力**: `storybook-static/` ディレクトリ

### Storybook 設定
- **ファイル**: `.storybook/main.js`
- **ベースURL**: `/hover-copy-tool/` (GitHub Pagesのサブパス)
- **公開パス**: 本番環境で自動設定

### Package.json
- **homepage**: GitHub PagesのURL
- **deploy-storybook**: 手動デプロイスクリプト

## 🌐 アクセスURL

デプロイ後、以下のURLでStorybookにアクセス可能：

**https://chouxcreams.github.io/hover-copy-tool**

## 🐛 トラブルシューティング

### デプロイが失敗する場合

1. **権限確認**: GitHub Actionsの権限設定を確認
2. **ログ確認**: Actions タブでワークフローのログを確認
3. **Node.js版**: ワークフローがNode.js 18を使用していることを確認

### ページが表示されない場合

1. **GitHub Pages設定**: Settings > Pages で GitHub Actions が選択されていることを確認
2. **ベースURL**: `.storybook/main.js` のパブリックパス設定を確認
3. **キャッシュ**: ブラウザのキャッシュをクリア

### CSS/JS が読み込まれない場合

Storybookの設定でベースURLが正しく設定されていることを確認：

```javascript
// .storybook/main.js
if (process.env.NODE_ENV === 'production') {
  config.output.publicPath = '/hover-copy-tool/';
}
```

## 📈 メリット

- **自動デプロイ**: mainブランチへのプッシュで自動更新
- **無料ホスティング**: GitHub Pagesは無料で利用可能
- **チーム共有**: URLでチームメンバーとコンポーネントを共有
- **プレビュー**: プルリクエストでビルドテストも実行