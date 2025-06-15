---
mode: "agent"
tools: ["git_status", "git_diff", "git_diff_unstaged", "git_add", "git_commit"]
description: "git commitを実行する"
---

# git commit を実行する

## 指示内容

ここまでの変更をすべてステージングしてコミットしてください

### 作業手順

1. `git_status` , `git_diff` , `git_diff_unstaged` で変更の内容を確認してください。
2. `git_add` で変更をステージングしてください
3. `git_commit` で変更をコミットしてください

### コミットメッセージ

- コミットメッセージは日本語で記述してください
- コミットメッセージは conventional commit のフォーマットに従ってください
