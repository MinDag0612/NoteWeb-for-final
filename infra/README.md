# Chay infra

## 1. Tao server bang Terraform

Vao thu muc Terraform:

```bash
cd infra/terraform
```

Khoi tao Terraform:

```bash
terraform init
```

Y nghia: tai provider AWS va chuan bi thu muc Terraform.

Can thay: dong `Terraform has been successfully initialized`.

Xem truoc se tao gi:

```bash
terraform plan
```

Y nghia: kiem tra Terraform se tao/sua/xoa tai nguyen nao.

Can thay: co plan tao EC2, security group, elastic IP.

Tao infra:

```bash
terraform apply
```

Nhap `yes` khi duoc hoi.

Y nghia: tao server tren AWS va ghi IP vao `../ansible/inventory.ini`.

Can thay: `Apply complete` va output `manager_ip`, `worker_ips`.

Check nhanh:

```bash
terraform output
```

Can thay: IP cua manager va worker.

## 2. Cai Docker va tao Docker Swarm bang Ansible

Vao thu muc Ansible:

```bash
cd ../ansible
```

Kiem tra ket noi SSH:

```bash
ansible all -i inventory.ini -m ping
```

Y nghia: kiem tra Ansible co SSH vao duoc cac server khong.

Can thay: moi server tra ve `pong`.

Chay playbook:

```bash
ansible-playbook -i inventory.ini playbook.yml
```

Y nghia: cai Docker tren cac server, init Swarm tren manager, cho worker join vao cluster.

Can thay: playbook chay xong khong co task `failed`.

## 3. Check Docker Swarm

SSH vao manager:

```bash
ssh -i ~/.ssh/key-terra.pem ubuntu@<manager_ip>
```

Xem node trong Swarm:

```bash
docker node ls
```

Can thay: 4 node, gom 1 manager va 3 worker, status la `Ready`.

## 4. Xoa infra khi khong dung nua

Vao lai thu muc Terraform:

```bash
cd infra/terraform
```

Xoa tai nguyen AWS:

```bash
terraform destroy
```

Nhap `yes` khi duoc hoi.

Can thay: `Destroy complete`.
