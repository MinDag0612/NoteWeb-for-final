#!/bin/bash
chmod +x mongo-init/init.sh
echo "[INFO] Initializing MongoDB..."

mongorestore \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --db WebNote \
  /dump/WebNote

echo "[INFO] MongoDB initialization complete!"