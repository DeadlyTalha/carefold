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

resource "kubernetes_namespace_v1" "this" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/name" = "carefold"
    }
  }
}

resource "helm_release" "carefold" {
  name       = var.release_name
  namespace  = kubernetes_namespace_v1.this.metadata[0].name
  chart      = var.chart_path
  version    = var.chart_version

  values = [
    yamlencode({
      image = {
        repository = var.image_repository
        tag        = var.image_tag
        digest     = var.image_digest
      }
      replicaCount = var.replica_count
      persistence = {
        enabled = true
        size    = var.pvc_size
      }
      model = {
        baseUrl = var.model_base_url
        name    = var.model_name
      }
      ingress = {
        enabled = var.ingress_enabled
        host    = var.ingress_host
      }
      config = {
        allowClinical     = false
        auditStoreBodies  = false
        telemetry         = false
      }
    })
  ]
}
