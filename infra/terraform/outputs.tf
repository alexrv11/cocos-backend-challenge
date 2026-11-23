output "namespace" {
  value = kubernetes_namespace.cocos.metadata[0].name
}

output "release_name" {
  value = helm_release.cocos_api.name
}

output "release_status" {
  value = helm_release.cocos_api.status
}

output "api_url" {
  value = "http://localhost:30000"
}

output "grafana_url" {
  value = "http://localhost:30300"
}

output "prometheus_release_status" {
  value = helm_release.prometheus_stack.status
}
