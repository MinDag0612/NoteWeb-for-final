resource "aws_route53_record" "app" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.manager_eip.public_ip]
}

resource "aws_route53_record" "www" {
  zone_id = var.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.manager_eip.public_ip]
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"
}