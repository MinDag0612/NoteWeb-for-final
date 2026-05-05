resource "local_file" "inventory" {
  content = templatefile("${path.module}/inventory.tpl", {

    manager = aws_eip.manager_eip.public_ip

    workers = aws_instance.worker[*].public_ip
    
    ssh_key = var.ssh_private_key_path

    domain_name = var.domain_name

    email = var.email
  })

  filename = "${path.module}/../ansible/inventory.ini"

  depends_on = [
    aws_instance.manager,
    aws_instance.worker,
    aws_eip.manager_eip
  ]
}