#!/usr/bin/env bash
set -euo pipefail

: "${BIDIREKT_BIN:?set BIDIREKT_BIN to a bidirekt binary}"
for tool in docker asciinema expect git vim; do
  command -v "$tool" >/dev/null || {
    echo "$tool is required" >&2
    exit 1
  }
done

casts_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
site_dir="$(cd "$casts_dir/../.." && pwd)"
bidirekt_bin="$(cd "$(dirname "$BIDIREKT_BIN")" && pwd)/$(basename "$BIDIREKT_BIN")"
compose=(docker compose --file "$casts_dir/compose.yaml")
session_dir="$(cd "$(mktemp -d)" && pwd -P)"
repo="$session_dir/home/petstore_web"

clean_up() {
  rm -rf "$session_dir"
  "${compose[@]}" stop
}
trap clean_up EXIT

"${compose[@]}" stop
"${compose[@]}" up --detach --wait

# The session's own HOME and PATH and nothing else from this shell, so the
# user's git, bidirekt and asciinema settings stay out and untouched.
in_session() { env -i HOME="$session_dir/home" PATH="$session_dir/bin:$PATH" "$@"; }

mkdir -p "$session_dir/bin" "$repo/contracts" "$site_dir/public/casts"
ln -s "$bidirekt_bin" "$session_dir/bin/bidirekt"
cp "$casts_dir/petstore_web.yaml" "$repo/contracts/"
in_session git -C "$repo" init --quiet --initial-branch=main
in_session git -C "$repo" config user.name petstore
in_session git -C "$repo" config user.email petstore@example.com
in_session git -C "$repo" add contracts
in_session git -C "$repo" commit --quiet --message "Read pets from petstore_api"

in_session bidirekt configure --broker-url http://localhost:18090
in_session bidirekt create-environment production
in_session bidirekt create-participant petstore_api
in_session bidirekt create-participant petstore_web
in_session bidirekt publish "$casts_dir/petstore_api.yaml" --participant petstore_api --version 1.4.0
in_session bidirekt can-i-deploy petstore_api --version 1.4.0 --environment production
in_session bidirekt record-deployment petstore_api --version 1.4.0 --environment production
in_session bidirekt publish "$repo"/contracts/*.yaml --participant petstore_web --version 2.3.0

cd "$casts_dir"
in_session TERM=xterm-256color LC_ALL=en_US.UTF-8 BASH_SILENCE_DEPRECATION_WARNING=1 \
  asciinema rec --headless --window-size 120x31 --output-format asciicast-v2 --overwrite \
  --command "expect -f session.exp" "$site_dir/public/casts/landing.cast"
