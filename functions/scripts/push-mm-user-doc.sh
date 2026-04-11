#!/usr/bin/env bash
# Merge personalstockmonitor/data JSON and POST to mmImport (no gcloud).
# Usage: MM_UID=yourFirebaseAuthUid bash scripts/push-mm-user-doc.sh
# Optional: MM_DATA_DIR=/path/to/data (folder with tickers.json, holdings.json, watchlist.json, discovery_results.json)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${MM_DATA_DIR:-$ROOT/../../../personalstockmonitor/data}"
MM_UID="${MM_UID:?Set MM_UID to your Firebase Auth UID}"
PROJECT="${GCLOUD_PROJECT:-daddoodev}"
URL="https://us-central1-${PROJECT}.cloudfunctions.net/mmImport"

for f in tickers.json holdings.json watchlist.json; do
  test -f "$DATA_DIR/$f" || { echo "Missing $DATA_DIR/$f" >&2; exit 1; }
done

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

if test -f "$DATA_DIR/discovery_results.json"; then
  jq -n \
    --slurpfile t "$DATA_DIR/tickers.json" \
    --slurpfile h "$DATA_DIR/holdings.json" \
    --slurpfile w "$DATA_DIR/watchlist.json" \
    --slurpfile d "$DATA_DIR/discovery_results.json" \
    '{tickers:$t[0],holdings:$h[0],watchlist:$w[0],discovery:$d[0]}' >"$TMP"
else
  jq -n \
    --slurpfile t "$DATA_DIR/tickers.json" \
    --slurpfile h "$DATA_DIR/holdings.json" \
    --slurpfile w "$DATA_DIR/watchlist.json" \
    '{tickers:$t[0],holdings:$h[0],watchlist:$w[0],discovery:null}' >"$TMP"
fi

SECRET="$(firebase functions:secrets:access MM_IMPORT_SECRET --project "$PROJECT" | tr -d '\n\r')"

curl -sS -X POST "${URL}?uid=${MM_UID}" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json" \
  --data-binary @"$TMP"

echo
