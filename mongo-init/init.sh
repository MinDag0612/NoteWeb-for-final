#!/bin/bash
set -e

echo "[INFO] Initializing MongoDB..."

mongorestore \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --db WebNote \
  --drop \
  /dump/WebNote

echo "[INFO] MongoDB initialization complete!"
