#!/bin/bash

export PATH=/usr/bin:/bin:/usr/sbin:/sbin

env > /tmp/dovecot-logs/env.log

echo "HOME=$HOME" >> /tmp/dovecot-logs/debug.log


USER="$USER"
HOME="$HOME"
SIEVE_DIR="$HOME/sieve"
SIEVE_FILE="$SIEVE_DIR/auto-copy.sieve"
SVBIN_FILE="$SIEVE_DIR/auto-copy.svbin"

echo "USER=$USER" >> /tmp/dovecot-logs/debug.log
echo "SIEVE_FILE=$SIEVE_FILE" >> /tmp/dovecot-logs/debug.log
echo "SVBIN_FILE=$SVBIN_FILE" >> /tmp/dovecot-logs/debug.log


if [ ! -f "$SVBIN_FILE" ]; then
  mkdir -p "$SIEVE_DIR"

  cat > "$SIEVE_FILE" <<EOF
require ["fileinto", "envelope", "comparator-i;ascii-casemap"];

if allof (
  address :is :comparator "i;ascii-casemap" "From" ["$USER"],
  envelope :is :comparator "i;ascii-casemap" "To" "$USER"
) {
  fileinto "Sent";
  stop;
}
EOF
  #sievec "$SIEVE_FILE" "$SVBIN_FILE"
  /usr/bin/sievec "$SIEVE_FILE" "$SVBIN_FILE"
  echo "Sieve file created for $USER"
fi

exec "$@"
