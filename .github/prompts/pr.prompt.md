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
2. `create_pull_request` で Pull Request を作成してください
   - Pull Request は必ず Draft で作成してください
