#!/bin/bash

set -e  # dừng nếu có lỗi

echo "[INFO] Starting Infrastructure Provisioning..."

cd terraform

echo "[INFO] Terraform init..."
terraform init

echo "[INFO] Terraform plan..."
terraform plan

echo "[INFO] Terraform apply..."
terraform apply -auto-approve

echo "[INFO] Getting outputs..."
MANAGER_IP=$(terraform output -raw manager_ip)

echo "[INFO] Manager IP: $MANAGER_IP"

echo "[INFO] Waiting for SSH to be ready..."

until ssh -o StrictHostKeyChecking=no -i ~/.ssh/key-terra.pem ubuntu@$MANAGER_IP "echo ok" 2>/dev/null; do
  echo "[INFO] Waiting for SSH..."
  sleep 5
done

echo "[INFO] Moving to Ansible..."
cd ../ansible

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_SSH_ARGS='-o StrictHostKeyChecking=no'

echo "[INFO] Testing connection with Ansible ping..."
ansible all -i inventory.ini -m ping

echo "[INFO] Running Ansible playbook..."
ansible-playbook -i inventory.ini playbook.yml

echo "[INFO] Checking Docker Swarm status on manager..."

ssh -o StrictHostKeyChecking=no -i ~/.ssh/key-terra.pem ubuntu@$MANAGER_IP << 'EOF'
  echo "[REMOTE] Docker nodes:"
  docker node ls
EOF

echo "[INFO] Done! Check aws console for resources and Ansible output."