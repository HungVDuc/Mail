#!/bin/bash

CHECKPASSWORD_REPLY="$1"
env > /tmp/oauth2-env.log

USERNAME="$AUTH_ORIG_USER"

response=$(curl -s -f -X POST http://backend:3000/api/v1/auth/dovecot/verify \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\"}")

{
  echo "AUTH_RESULT = $response     USERNAME = $USERNAME"
  echo "=================================="
} >> /tmp/oauth2-script.log

if [ "$response" = "OK" ]; then
  exec "$CHECKPASSWORD_REPLY"
else
  exit 111
fi
