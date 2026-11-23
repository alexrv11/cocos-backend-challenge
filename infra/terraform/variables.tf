variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "kind-finance-local"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "cocos"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "local"
}

variable "image_repository" {
  description = "Docker image repository"
  type        = string
  default     = "cocos-api"
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "replica_count" {
  description = "Number of API replicas"
  type        = number
  default     = 1
}

# ---------------------------------------------------------------------------
# Web
# ---------------------------------------------------------------------------
variable "web_image_repository" {
  description = "Docker image repository for the web client"
  type        = string
  default     = "cocos-web"
}

variable "web_image_tag" {
  description = "Docker image tag for the web client"
  type        = string
  default     = "latest"
}

# ---------------------------------------------------------------------------
# Prometheus + Grafana
# ---------------------------------------------------------------------------
variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  default     = "cocos-grafana"
}

variable "prometheus_alertmanager_enabled" {
  description = "Enable Alertmanager"
  type        = string
  default     = "false"
}
