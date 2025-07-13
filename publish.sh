#!/usr/bin/env bash
# Publish helper for electron-preferences-modern
# Comments are in English per project style-guide.

set -euo pipefail

# ────────────────────────────────
# Usage examples:
#   ./publish.sh patch            # 3.0.1 → 3.0.2, publishes under "latest"
#   ./publish.sh minor next       # 3.0.2 → 3.1.0, publishes under "next"
#   ./publish.sh 3.2.0            # explicit version number
# ────────────────────────────────

if [[ $# -lt 1 ]]; then
  echo "USAGE: $0 <version|major|minor|patch> [next]"
  exit 1
fi

VERSION_SPEC=$1        # major | minor | patch | 3.x.y
DIST_TAG=${2:-}        # optional: "next"

# 1) Guard: working tree must be clean.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Uncommitted changes detected. Commit or stash them first."
  exit 1
fi

# 2) Quality gates (optional but recommended).
npm run lint
npm test

# 3) Bump version, commit & create annotated git-tag (e.g. v3.1.0).
npm version "$VERSION_SPEC" -m "chore(release): v%s"

# 4) Publish to npm (requires 2FA OTP / FIDO key if enabled).
if [[ "$DIST_TAG" == "next" ]]; then
  npm publish --tag next
else
  npm publish
fi

# 5) Push commit + tag to origin.
git push --follow-tags

echo "✅ Published $(npm pkg get version) to npm with dist-tag '${DIST_TAG:-latest}'."
