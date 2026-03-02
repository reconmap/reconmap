# Reconmap command line tools

This monorepo contains the Reconmap [runner](runner) and [agent](agent) command line tools, as well as the [shared library](shared-lib) written in Golang.

Look at each subdirectory to learn more about each tool including building and running instructions.

```shell
docker build -t ghcr.io/reconmap/agent:latest -f agent/Dockerfile .
docker push ghcr.io/reconmap/agent:latest
```

## Build requirements

- Make
- Golang +1.25
