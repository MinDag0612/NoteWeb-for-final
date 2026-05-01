# Chay Terraform va Ansible

Thu tu chay:

1. Terraform tao EC2 tren AWS.
2. Lay IP tu Terraform output.
3. Cap nhat `infra/ansible/inventory.ini`.
4. Chay Ansible de cai Docker va tao Docker Swarm.

Luu y: cach nay phu hop cho demo/lab/manual deploy. Production nen co remote Terraform state, CI/CD pipeline, dynamic inventory va quan ly secret rieng.

## 1. Chay Terraform

Tao file bien tu file mau:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Sua `terraform.tfvars`:

```hcl
admin_cidr = "<ip_public_cua_ban>/32"

# Neu can cai Docker truc tiep qua internet khi chay Ansible demo:
package_repo_egress_cidrs = ["0.0.0.0/0"]
```

Production nen thay `package_repo_egress_cidrs` bang CIDR cua NAT/proxy, khong nen de `0.0.0.0/0`.

```bash
terraform init
terraform plan
terraform apply
```

Khi duoc hoi, nhap:

```bash
yes
```

Xem IP sau khi tao xong:

```bash
terraform output
```

Can lay:

- `manager_ip`
- `worker_ips`

## 2. Cap nhat inventory

Mo file:

```bash
infra/ansible/inventory.ini
```

Sua IP theo output Terraform:

```ini
[manager]
<manager_ip>

[workers]
<worker_1_ip>
<worker_2_ip>
<worker_3_ip>

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=/duong/dan/toi/key-terra.pem
```

Nhung cho can sua sau moi lan `terraform apply` moi:

- IP trong `[manager]` va `[workers]`.
- `ansible_ssh_private_key_file`, tuy theo may cua nguoi chay.

Vi du neu chay bang WSL:

```ini
ansible_ssh_private_key_file=/home/<user>/.ssh/key-terra.pem
```

File key nen co quyen:

```bash
chmod 400 ~/.ssh/key-terra.pem
```

## 3. Kiem tra Ansible ket noi duoc EC2

```bash
cd ../ansible
ansible all -i inventory.ini -m ping
```

Neu thanh cong, cac host se tra ve `pong`.

## 4. Cai Docker

```bash
ansible-playbook -i inventory.ini playbook.yml
```

Playbook nay cai Docker tren manager va workers.

## 5. Tao Docker Swarm

```bash
ansible-playbook -i inventory.ini swarm.yml
```

Playbook nay:

- init Swarm tren manager
- lay worker token
- cho worker join vao Swarm

Kiem tra cluster:

```bash
ssh -i ~/.ssh/key-terra.pem ubuntu@<manager_ip>
docker node ls
```

## 6. Xoa ha tang khi khong dung nua

```bash
cd infra/terraform
terraform destroy
```

Khi duoc hoi, nhap:

```bash
yes
```

## Can kiem tra neu nguoi khac chay

- AWS credential da duoc cau hinh chua.
- AWS region trong `infra/terraform/provider.tf` la `ap-southeast-1`.
- AWS key pair trong `infra/terraform/main.tf` la `key-terra`.
- File private key local phai khop voi key pair `key-terra`.
- Neu doi region, can doi AMI trong `infra/terraform/main.tf`.
- Security group da tach rieng: `swarm_sg` cho SSH/Swarm noi bo, `nginx_sg` cho HTTP/HTTPS public vao manager.
