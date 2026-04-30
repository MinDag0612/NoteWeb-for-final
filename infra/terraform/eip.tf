resource "aws_eip" "manager_eip" {
  domain = "vpc"

  tags = {
    Name = "swarm-manager-eip"
  }
}

resource "aws_eip_association" "manager_eip_assoc" {
  instance_id   = aws_instance.manager.id
  allocation_id = aws_eip.manager_eip.id
}