---
mode: "agent"
tools: ["git", "git_diff", "git_status", "github", "create_pull_request"]
description: "GitHubに Pull Request を作成する"
---

# GitHub に Pull Request を作成する

## 指示内容

現在のブランチの変更内容を main ブランチに向けた Pull Request として作成してください。
このリポジトリは `chouxcream/hover-copy-tool` です。

### 作業手順

1. `git_diff` で最新の main ブランチとの差分を確認してください
2. `git_status` で現在のブランチ名を確認してください。
   - ブランチ名に `#{issue番号}` のフォーマットで、関連する issue 番号が含まれていることが期待されます
   - 例: `feature/#1234-add-hover-effect`
   - 関連 issue がない場合は、ブランチ名に番号が含まれません。
3. `create_pull_request` で Pull Request を作成してください
   - Pull Request は必ず Draft で作成してください
   - `.github/pull_request_template.md` を Pull Request のテンプレートとして使用し、内容を可能な範囲で埋めてください
