# Hover Copy Tool

正規表現を使用してリンクにホバーした際にURLパターンを抽出・コピーするブラウザ拡張機能です。

## ビルド手順

1. 依存関係をインストール:

    ```bash
    npm install
    ```

2. 拡張機能をビルド:

    ```bash
    npm run build
    ```

    ビルドされた拡張機能は `dist/` フォルダに出力されます。

## インストール

### Chrome

1. Chromeを開いて `chrome://extensions/` にアクセス
2. "デベロッパーモード"を有効化
3. "パッケージ化されていない拡張機能を読み込む"をクリックして `dist/` フォルダを選択

### Firefox

1. Firefoxを開いて `about:debugging` にアクセス
2. "この Firefox"をクリック
3. "一時的なアドオンを読み込む"をクリック
4. `dist/` フォルダ内の任意のファイルを選択

## 使用方法

1. 拡張機能のアイコンをクリックして正規表現パターンを設定
2. パターン名と正規表現を追加
3. パターンを有効化して使用
4. Webページ上のリンクにホバーして抽出された結果を確認
5. "コピー"をクリックして抽出されたテキストをクリップボードにコピー

## 開発

### 開発モード

自動リビルド付きの開発モードで実行:

```bash
npm run dev
```

### Storybook

Reactコンポーネントの開発・テスト用にStorybookを使用できます:

#### ローカル開発

```bash
npm run storybook
```

ブラウザで `http://localhost:6006` を開くとStorybookのUIが表示されます。

#### オンライン版

StorybookはGitHub Pagesでホスティングされており、以下のURLからアクセスできます：

**🔗 [Storybook - Hover Copy Tool](https://chouxcreams.github.io/hover-copy-tool)**

mainブランチにプッシュすると自動的にデプロイされます。

#### 手動デプロイ

```bash
# Storybookをビルドしてデプロイ
npm run deploy-storybook
```

詳細な使用方法は [STORYBOOK.md](./docs/STORYBOOK.md) を参照してください。

## アーキテクチャ

- **React 18**: UIコンポーネントの開発
- **TypeScript**: 型安全性の確保
- **Webpack 4**: バンドリングとビルド
- **Storybook**: コンポーネント開発・テスト
- **Chrome Extensions API**: ブラウザ拡張機能の機能
