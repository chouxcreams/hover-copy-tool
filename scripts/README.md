# Scripts

このディレクトリには、Hover Copy Toolプロジェクト用のユーティリティスクリプトが含まれています。

## generate-icons.sh

1024x1024のソース画像からブラウザ拡張機能用のアイコンを生成します。

### 前提条件

- ImageMagickがインストールされている必要があります：
  - **macOS**: `brew install imagemagick`
  - **Ubuntu/Debian**: `sudo apt-get install imagemagick`
  - **Windows**: [imagemagick.org](https://imagemagick.org)からダウンロード

### 使用方法

1. 1024x1024のPNG画像を`src/icons/icon1024.png`に配置
2. スクリプトを実行：

   ```bash
   ./scripts/generate-icons.sh
   ```

### 機能

このスクリプトは、ブラウザ拡張機能に必要な以下のアイコンサイズを自動生成します：

- `icon16.png` (16x16) - ツールバー表示用
- `icon48.png` (48x48) - 拡張機能管理ページ用
- `icon128.png` (128x128) - Chrome Web Store用

### 特徴

- ✅ ImageMagickのインストール状況を検証
- ✅ ソース画像の存在とサイズを確認
- ✅ 見やすいカラー出力
- ✅ エラーハンドリングと分かりやすいメッセージ
- ✅ 生成されたアイコンのファイルサイズを表示

### 実行例

```text
🎨 Browser Extension Icon Generator
==================================
Source: /path/to/src/icons/icon1024.png
Target directory: /path/to/src/icons

Generating 16x16 icon...
  ✅ Created: icon16.png (1.4K)
Generating 48x48 icon...
  ✅ Created: icon48.png (3.7K)
Generating 128x128 icon...
  ✅ Created: icon128.png (13.8K)

✅ All icons generated successfully!
```

### 生成後の手順

1. `npm run build`を実行して新しいアイコンをビルドに含める
2. ブラウザで拡張機能をリロード
3. 以下の場所でアイコンが正しく表示されることを確認：
   - ブラウザのツールバー (16x16)
   - 拡張機能管理ページ (48x48)
   - Chrome Web Storeのリスティング (128x128)
