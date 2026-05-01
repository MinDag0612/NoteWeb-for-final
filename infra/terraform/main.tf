resource "aws_instance" "manager" {
  ami                    = "ami-01811d4912b4ccb26"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.swarm_sg.id]
  key_name = "key-terra"

  tags = {
    Name = "swarm-manager"
  }
}

resource "aws_instance" "worker" {
  count                  = 3
  ami                    = "ami-01811d4912b4ccb26"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.swarm_sg.id]
  key_name = "key-terra"

  tags = {
    Name = "swarm-worker-${count.index + 1}"
  }
}

output "manager_ip" {
  value = aws_eip.manager_eip.public_ip
}

output "worker_ips" {
  value = aws_instance.worker[*].public_ip
}