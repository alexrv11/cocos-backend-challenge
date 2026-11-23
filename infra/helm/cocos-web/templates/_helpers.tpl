{{- define "cocos-web.fullname" -}}
{{- .Release.Name }}-web
{{- end }}

{{- define "cocos-web.labels" -}}
app.kubernetes.io/name: cocos-web
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "cocos-web.selectorLabels" -}}
app.kubernetes.io/name: cocos-web
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
