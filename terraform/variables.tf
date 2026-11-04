
variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-2"
}

variable "project_name" {
  description = "Project resource prefix"
  type        = string
  default     = "three-microservices"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "Your public IPv4 address in CIDR notation"
  type        = string
}
