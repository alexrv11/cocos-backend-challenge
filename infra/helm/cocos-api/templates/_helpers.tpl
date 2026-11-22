{{- define "cocos-api.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "cocos-api.labels" -}}
app.kubernetes.io/name: cocos-api
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "cocos-api.selectorLabels" -}}
app.kubernetes.io/name: cocos-api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
