
output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "ec2_instance_id" {
  value = aws_instance.app_server.id
}

output "ecr_registry" {
  value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}
