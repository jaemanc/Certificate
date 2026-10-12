#!/usr/bin/env bash
# Run from a normal terminal after inspecting the prepared project.
set -euo pipefail
cd "$(dirname "$0")/.."
repo='jaemanc93/databricks_dea'
remote_url="https://github.com/${repo}.git"
command -v gh >/dev/null 2>&1 || { echo 'GitHub CLI(gh)를 먼저 설치하세요: https://cli.github.com/'; exit 1; }
gh auth status >/dev/null 2>&1 || { echo '먼저 gh auth login 으로 로그인하세요.'; exit 1; }
login=$(gh api user --jq '.login')
[ "$login" = 'jaemanc93' ] || { echo "현재 계정은 ${login}입니다. gh auth switch --user jaemanc93 으로 전환하세요."; exit 1; }
# Complete the API read before mutating the local Git repository.
repos=$(gh api --paginate 'user/repos?per_page=100' --jq '.[].full_name')
existing=0
while IFS= read -r name; do [ "$name" != "$repo" ] || existing=1; done <<< "$repos"
if [ ! -d .git ]; then
  git init -b main
fi
origin=$(git remote get-url origin 2>/dev/null || true)
if [ -n "$origin" ] && [ "$origin" != "$remote_url" ] && [ "$origin" != "git@github.com:${repo}.git" ]; then
  echo "origin이 다른 저장소를 가리킵니다: ${origin}. 자동으로 덮어쓰지 않습니다."; exit 1
fi
# Explicit files only; the locally supplied PDF and credentials are excluded.
git add .gitignore package.json server.mjs readme.md site/dist tests scripts
if ! git diff --cached --quiet; then
  git commit -m 'feat: add Databricks DEA mock exam and category practice'
fi
if [ "$existing" -eq 0 ]; then
  gh repo create "$repo" --private
fi
if [ -z "$origin" ]; then git remote add origin "$remote_url"; fi
gh auth setup-git
git push -u origin HEAD:main
printf '\nGitHub 연결 및 푸시 완료: https://github.com/%s\n' "$repo"
