resource "local_file" "inventory" {
  content = templatefile("${path.module}/inventory.tpl", {
    manager = aws_instance.manager.public_ip
    workers = aws_instance.worker[*].public_ip
  })

  filename = "${path.module}/../ansible/inventory.ini"
}