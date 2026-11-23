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

# ---------------------------------------------------------------------------
# Prometheus + Grafana (kube-prometheus-stack)
# ---------------------------------------------------------------------------
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      app = "monitoring"
      env = var.environment
    }
  }
}

resource "helm_release" "prometheus_stack" {
  name             = "prometheus"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = "72.6.2"
  wait             = true
  timeout          = 600
  create_namespace = false

  # Slim down for local/dev — disable components not needed
  set {
    name  = "alertmanager.enabled"
    value = var.prometheus_alertmanager_enabled
  }

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "grafana.service.type"
    value = "NodePort"
  }

  set {
    name  = "grafana.service.nodePort"
    value = "30300"
  }

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }

  set {
    name  = "prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues"
    value = "false"
  }

  depends_on = [kubernetes_namespace.monitoring]
}

# ServiceMonitor to scrape the Cocos API /metrics endpoint
resource "kubernetes_manifest" "api_service_monitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "cocos-api"
      namespace = kubernetes_namespace.cocos.metadata[0].name
      labels = {
        app = "cocos-api"
      }
    }
    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name" = "cocos-api"
        }
      }
      endpoints = [
        {
          port     = "http"
          path     = "/metrics"
          interval = "15s"
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus_stack, helm_release.cocos_api]
}
