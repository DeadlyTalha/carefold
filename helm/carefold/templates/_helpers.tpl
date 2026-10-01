{{- define "carefold.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "carefold.fullname" -}}
{{- printf "%s" (include "carefold.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "carefold.labels" -}}
app.kubernetes.io/name: {{ include "carefold.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end }}
