variable "instance_type" {
    description = "Type of EC2 instance"
    type        = string
    default     = "t3.micro"
}

variable "ami_id" {
    description = "AMI ID for EC2"
    type        = string
}

variable "worker_count" {
    description = "Number of worker nodes"
    type        = number
    default     = 3
}

variable "key_name" {
    description = "SSH key pair name"
    type        = string
}

variable "region" {
    description = "Region aws"
    type        = string
    default     = "ap-southeast-1"
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "email" {
    description = "Email for Certbot"
    type        = string
}

variable "zone_id" {
  description = "Route53 Hosted Zone ID"
  type        = string
}