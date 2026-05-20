#!/usr/bin/env sh
set -eu

REPO_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$REPO_DIR"

chmod +x scripts/deploy-after-pull.sh scripts/git-hooks/post-merge
git config core.hooksPath scripts/git-hooks

echo "Installed wcWIKI post-merge auto rebuild hook."
echo "Future git pull commands in $REPO_DIR will rebuild wcwiki-app automatically."