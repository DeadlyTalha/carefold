# carefold Helm chart

Installs the Carefold runtime on a cluster you already operate.

```bash
helm install carefold ./helm/carefold \
  --set model.baseUrl=http://ollama.ollama.svc:11434/v1
```

Ingress is off. Do not put this on the public internet with health data
unless you are prepared to be the operator of record.

Pin production images with `image.digest` once releases exist.
