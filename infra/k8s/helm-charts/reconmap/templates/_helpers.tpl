{{- define "reconmap.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "reconmap.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "reconmap.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Name of a component's resources. Args: dict "root" $ "component" "api" */}}
{{- define "reconmap.componentName" -}}
{{- printf "%s-%s" (include "reconmap.fullname" .root) .component | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Selector labels. Args: dict "root" $ "component" "api" */}}
{{- define "reconmap.selectorLabels" -}}
app.kubernetes.io/name: {{ include "reconmap.name" .root }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/* Recommended labels. Args: dict "root" $ "component" "api" */}}
{{- define "reconmap.labels" -}}
{{ include "reconmap.selectorLabels" . }}
app.kubernetes.io/part-of: reconmap
app.kubernetes.io/version: {{ .root.Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .root.Release.Service }}
helm.sh/chart: {{ include "reconmap.chart" .root }}
{{- end }}

{{/* Image reference. Args: dict "root" $ "image" .Values.x.image */}}
{{- define "reconmap.image" -}}
{{- if .image.digest -}}
{{ .image.repository }}@{{ .image.digest }}
{{- else -}}
{{ .image.repository }}:{{ default .root.Chart.AppVersion .image.tag }}
{{- end -}}
{{- end }}

{{- define "reconmap.secretName" -}}
{{- default (printf "%s-secrets" (include "reconmap.fullname" .)) .Values.secrets.existingSecret }}
{{- end }}

{{/* Env var sourced from the credentials Secret. Args: dict "root" $ "name" ENV "key" secret-key */}}
{{- define "reconmap.secretEnv" -}}
- name: {{ .name }}
  valueFrom:
    secretKeyRef:
      name: {{ include "reconmap.secretName" .root }}
      key: {{ .key }}
{{- end }}

{{/* Pod securityContext meeting the "restricted" Pod Security Standard. Args: dict "uid" 1000 "gid" 1000 (gid optional) */}}
{{- define "reconmap.podSecurityContext" -}}
runAsNonRoot: true
runAsUser: {{ .uid }}
runAsGroup: {{ default .uid .gid }}
fsGroup: {{ default .uid .gid }}
fsGroupChangePolicy: OnRootMismatch
seccompProfile:
  type: RuntimeDefault
{{- end }}

{{/* Container securityContext. Args: dict "readOnly" true */}}
{{- define "reconmap.containerSecurityContext" -}}
allowPrivilegeEscalation: false
readOnlyRootFilesystem: {{ .readOnly }}
capabilities:
  drop:
    - ALL
{{- end }}

{{/* Hosts of the backing services (bundled or external). */}}
{{- define "reconmap.postgresHost" -}}
{{- if .Values.postgres.enabled }}{{ include "reconmap.componentName" (dict "root" . "component" "postgres") }}{{ else }}{{ required "postgres.externalHost is required when postgres.enabled=false" .Values.postgres.externalHost }}{{ end }}
{{- end }}
{{- define "reconmap.redisHost" -}}
{{- if .Values.redis.enabled }}{{ include "reconmap.componentName" (dict "root" . "component" "redis") }}{{ else }}{{ required "redis.externalHost is required when redis.enabled=false" .Values.redis.externalHost }}{{ end }}
{{- end }}
{{- define "reconmap.rabbitmqHost" -}}
{{- if .Values.rabbitmq.enabled }}{{ include "reconmap.componentName" (dict "root" . "component" "rabbitmq") }}{{ else }}{{ required "rabbitmq.externalHost is required when rabbitmq.enabled=false" .Values.rabbitmq.externalHost }}{{ end }}
{{- end }}
{{- define "reconmap.s3Endpoint" -}}
{{- if .Values.s3.endpoint }}{{ .Values.s3.endpoint }}{{ else }}http://{{ include "reconmap.componentName" (dict "root" . "component" "s3") }}:9000{{ end }}
{{- end }}

{{/* Public URLs derived from `hosts` and `tls`. */}}
{{- define "reconmap.scheme" -}}{{ ternary "https" "http" .Values.tls }}{{- end }}
{{- define "reconmap.dashboardUrl" -}}{{ include "reconmap.scheme" . }}://{{ .Values.hosts.dashboard }}{{- end }}
{{- define "reconmap.apiUrl" -}}{{ include "reconmap.scheme" . }}://{{ .Values.hosts.api }}{{- end }}
{{- define "reconmap.keycloakUrl" -}}{{ include "reconmap.scheme" . }}://{{ .Values.hosts.keycloak }}{{- end }}

{{/* In-cluster Keycloak base URL. */}}
{{- define "reconmap.keycloakInternalUrl" -}}http://{{ include "reconmap.componentName" (dict "root" . "component" "keycloak") }}:8080{{- end }}

{{/* Standard ClusterIP Service. Args: dict "root" $ "component" "api" "port" 5510 */}}
{{- define "reconmap.service" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "reconmap.componentName" . }}
  labels:
    {{- include "reconmap.labels" . | nindent 4 }}
spec:
  type: ClusterIP
  ports:
    - name: http
      port: {{ .port }}
      targetPort: {{ .port }}
  selector:
    {{- include "reconmap.selectorLabels" . | nindent 4 }}
{{- end }}

{{/* PodDisruptionBudget for replicated components. Args: dict "root" $ "component" "api" */}}
{{- define "reconmap.pdb" -}}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "reconmap.componentName" . }}
  labels:
    {{- include "reconmap.labels" . | nindent 4 }}
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      {{- include "reconmap.selectorLabels" . | nindent 6 }}
{{- end }}
