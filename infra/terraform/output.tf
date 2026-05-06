output "manager_ip" {
  value = aws_eip.manager_eip.public_ip
}

output "worker_ips" {
  value = aws_instance.worker[*].public_ip
}