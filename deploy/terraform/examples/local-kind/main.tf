# Example: install Carefold onto a cluster you already have (kind / k3d / k3s).
#
#   kind create cluster --name carefold
#   terraform -chdir=terraform/examples/local-kind init
#   terraform -chdir=terraform/examples/local-kind apply
#
# Point model_base_url at an Ollama you run on the host or in-cluster.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.29.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.13.0"
    }
  }
}

provider "kubernetes" {
  config_path = pathexpand(var.kubeconfig)
}

provider "helm" {
  kubernetes {
    config_path = pathexpand(var.kubeconfig)
  }
}

module "carefold" {
  source = "../../modules/carefold"

  namespace        = "carefold"
  chart_path       = "${path.module}/../../../helm/carefold"
  image_repository = "carefold"
  image_tag        = "dev"
  model_base_url   = var.model_base_url
  pvc_size         = "5Gi"
}

variable "kubeconfig" {
  type    = string
  default = "~/.kube/config"
}

variable "model_base_url" {
  type    = string
  default = "http://host.docker.internal:11434/v1"
}

output "namespace" {
  value = module.carefold.namespace
}
