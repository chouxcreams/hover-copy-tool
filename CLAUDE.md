# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code (claude.ai/code) に対するガイダンスを提供します。

## プロジェクト概要

「hover-copy-tool」というブラウザ拡張機能プロジェクトで、Webページ上のリンクにホバーした際に正規表現を使用してURLの特定部分を抽出できるツールです。ChromeとFirefoxに対応し、URLからIDやパラメータを頻繁に抽出する必要があるWeb開発者やQAエンジニアをターゲットとしています。

## 現在の状況

プロジェクトは実装段階にあり、基本機能が完成しています：

- `docs/PRD.md`に日本語で詳細なPRD（プロダクト要求仕様書）を作成済み
- Node.js開発環境用のMise設定を完了
- **ブラウザ拡張機能の実装が完了済み**
- Reactベースのコンポーネント実装済み
- TypeScriptでの型安全な実装
- Vitestによるユニットテスト環境構築済み
- Storybookによるコンポーネント開発・テスト環境構築済み

## 開発環境

このプロジェクトでは開発環境管理にMiseを使用しています：

- Node.js（最新版）
- Claude Code CLIツール

開発環境のセットアップ方法：

```bash
mise install
```

**Claude Code使用時の重要な注意点**：Bashツールを使用する際、mise環境は自動的にアクティベートされません。`mise.toml`で指定された正しいNode.jsバージョンを使用するには、`mise exec`でコマンドを実行するか、事前にmiseをアクティベートする必要があります：

```bash
# 方法1: miseでコマンドを実行
mise exec -- node --version

# 方法2: mise環境をアクティベート
eval "$(mise activate bash)"
```

## 実装されたアーキテクチャ

PRDに基づき、拡張機能は以下の構成要素で実装されています：

### コアコンポーネント

- **コンテンツスクリプト** (`src/content.tsx`): リンクホバー検出と正規表現抽出を処理
- **ポップアップインターフェース** (`src/popup.tsx`, `src/components/PopupApp.tsx`): 正規表現パターン管理用の設定UI
- **ホバーウィンドウ** (`src/components/HoverWindow.tsx`): 抽出結果の表示とコピー機能

### 実装済み機能

1. **URLパターン抽出**: ユーザー定義の正規表現パターンを使用してURLから部分文字列を抽出 (`src/utils/urlExtractor.ts`)
2. **マルチパターンサポート**: 複数の正規表現設定を保存・切り替え可能 (`src/utils/storage.ts`)
3. **ホバーインターフェース**: 抽出結果を表示する非侵入的なポップアップ
4. **クリップボード統合**: ユーザー確認後に抽出文字列をクリップボードにコピー
5. **クロスブラウザ対応**: Chrome Manifest V3対応、Firefox対応準備済み

## ファイル構成（実装済み）

以下のファイル構成で実装されています：

- `src/manifest.json` - ブラウザ拡張機能のマニフェスト（Chrome Manifest V3）
- `src/` - ソースコードディレクトリ
  - `content.tsx` - Webページ連携用のコンテンツスクリプト
  - `popup.tsx`, `popup.html`, `popup.css` - 拡張機能のポップアップUI
  - `components/` - Reactコンポーネント
    - `PopupApp.tsx` - ポップアップのメインコンポーネント
    - `HoverWindow.tsx` - ホバー時の抽出結果表示ウィンドウ
    - `SimpleButton.tsx` - 再利用可能なボタンコンポーネント
  - `utils/` - ユーティリティ関数
    - `urlExtractor.ts` - URL抽出ロジック
    - `storage.ts` - Chrome Storage API のラッパー
  - `types/` - TypeScript型定義
  - `icons/` - 拡張機能アイコン（16px, 48px, 128px, 1024px）
- `package.json` - Node.js依存関係とビルドスクリプト
- `build.ts` - ESBuildを使用したカスタムビルド設定
- `vitest.config.ts` - Vitestテストフレームワーク設定
- `.storybook/` - Storybookコンポーネント開発環境設定

## 開発環境とビルド

### 利用可能なコマンド

- `npm run build` - 拡張機能をビルド（dist/フォルダに出力）
- `npm run dev` - 開発モード（ファイル変更の自動監視・リビルド）
- `npm run test` - Vitestでユニットテストを実行（ウォッチモード）
- `npm run test:run` - ユニットテストを一回実行
- `npm run storybook` - Storybookの開発サーバー起動
- `npm run build-storybook` - Storybookをビルド
- `npm run deploy-storybook` - StorybookをGitHub Pagesにデプロイ

### 技術スタック

- **React 18** + **TypeScript** - UI開発
- **ESBuild** - 高速バンドリング
- **Vitest** - ユニットテスト
- **Storybook** - コンポーネント開発・ドキュメント
- **Chrome Extensions Manifest V3** - 拡張機能API

### テスト

ユニットテストは以下の範囲をカバー：
- `src/utils/urlExtractor.test.ts` - URL抽出ロジック
- `src/utils/storage.test.ts` - ストレージ操作
- `src/components/*.test.tsx` - Reactコンポーネント

## 開発に関する注意事項

- PRDは日本語で記述され、詳細な機能仕様を含んでいます
- 多数のリンクを含むページでのパフォーマンスに注意
- ユーザー定義正規表現パターンのセキュリティ考慮事項
- ホバーウィンドウと設定ポップアップの直感的なUI設計
- Chrome Extensions Manifest V3の権限とセキュリティ制約に準拠
