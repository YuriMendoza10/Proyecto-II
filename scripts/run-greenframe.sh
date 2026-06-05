#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

mkdir -p backend/public/assets
greenframe analyze 2>&1 | tee backend/public/assets/greenframe-latest.txt
