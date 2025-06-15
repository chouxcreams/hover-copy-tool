# Storybook ガイド

このプロジェクトではStorybookを使用してReactコンポーネントの開発とテストを行います。

## セットアップ

Storybookは既に設定済みです。必要な依存関係がインストールされており、設定ファイルが`.storybook/`フォルダに配置されています。

## Storybookの実行

### 開発サーバーの起動

```bash
npm run storybook
```

ブラウザで `http://localhost:6006` を開くとStorybookのUIが表示されます。

### オンライン版（GitHub Pages）

StorybookはGitHub Pagesでホスティングされています：

**🔗 https://chouxcreams.github.io/hover-copy-tool**

### ビルド

```bash
npm run build-storybook
```

### デプロイ

#### 自動デプロイ
mainブランチにプッシュすると、GitHub Actionsによって自動的にStorybookがビルドされ、GitHub Pagesにデプロイされます。

#### 手動デプロイ
```bash
npm run deploy-storybook
```

## 利用可能なStory

### 1. SimpleButton
基本的なボタンコンポーネントのバリエーション：
- Primary ボタン
- Secondary ボタン
- Small ボタン

### 2. HoverWindow
ホバー時に表示されるツールチップコンポーネント：
- 単一のマッチ
- 複数のマッチ
- 長い値の表示
- 空のマッチ

### 3. PopupApp
拡張機能のポップアップメインコンポーネント：
- デフォルト状態
- パターンなしの状態
- モックデータありの状態

## Chrome APIモック

Storybookでは実際のChrome拡張機能APIの代わりにモックを使用します。モックは `src/mocks/chrome.ts` で定義されており、以下の機能を提供します：

- `chrome.storage.sync.get()` - テストデータを返却
- `chrome.storage.sync.set()` - コンソールにログ出力
- `chrome.storage.onChanged.addListener()` - リスナー登録のログ

## Storyの作成方法

新しいコンポーネントのStoryを作成する場合：

1. コンポーネントと同じディレクトリに `ComponentName.stories.tsx` ファイルを作成
2. 以下のテンプレートを使用：

```typescript
import React from 'react';
import ComponentName from './ComponentName';

export default {
  title: 'Components/ComponentName',
  component: ComponentName,
};

export const Default = () => (
  <ComponentName />
);
```

## トラブルシューティング

### CSS読み込みエラー
CSSファイルの読み込みでエラーが発生する場合は、`.storybook/main.js`のwebpack設定を確認してください。

### Chrome API エラー
Chrome APIが利用できない場合は、`src/mocks/chrome.ts`が正しく読み込まれているか確認してください。

### TypeScript エラー
TypeScriptコンパイルエラーが発生する場合は、`tsconfig.json`とStorybook設定の互換性を確認してください。