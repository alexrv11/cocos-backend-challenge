terraform {
  required_version = ">= 1.0"

  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

provider "helm" {
  kubernetes {
    config_path    = var.kubeconfig_path
    config_context = var.kube_context
  }
}

resource "kubernetes_namespace" "cocos" {
  metadata {
    name = var.namespace
    labels = {
      app     = "cocos-api"
      env     = var.environment
    }
  }
}

resource "helm_release" "cocos_api" {
  name             = "cocos-api"
  namespace        = kubernetes_namespace.cocos.metadata[0].name
  chart            = "${path.module}/../helm/cocos-api"
  wait             = true
  timeout          = 300
  create_namespace = false

  values = [
    file("${path.module}/../helm/cocos-api/values.yaml")
  ]

  set {
    name  = "image.repository"
    value = var.image_repository
  }

  set {
    name  = "image.tag"
    value = var.image_tag
  }

  set {
    name  = "replicaCount"
    value = var.replica_count
  }

  depends_on = [kubernetes_namespace.cocos]
}
