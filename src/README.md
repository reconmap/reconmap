# Reconmap command line tools

This monorepo contains the Reconmap [runner](runner) and [CLI](cli) command line tools, as well as the [shared library](shared-lib) written in Golang.

Look at each subdirectory to learn more about each tool including building and running instructions.

From the repository root:
```shell
docker build -t ghcr.io/reconmap/runner:latest -f src/runner/Dockerfile src
```

From this (`src`) directory:
```shell
docker build -t ghcr.io/reconmap/runner:latest -f runner/Dockerfile .
```


## Build requirements

- Make
- Golang +1.27
