![Build and test workflow](https://github.com/Reconmap/cli/workflows/Build%20and%20test%20workflow/badge.svg)

# Reconmap CLI

Command line interface for the Reconmap pentest automation and reporting tool.

[![asciicast](https://asciinema.org/a/402505.svg)](https://asciinema.org/a/402505)

## Run instructions

### Configure

```shell
./rmap config set --api-url https://api.reconmap.org
./rmap config view
```

Make sure you replace `https://demo.api.reconmap.com` with your actual API URL. Users from our [SaaS](https://reconmap.com) offering should enter something like `https://ACCOUNTNAME.api.reconmap.com`.

### Logging in and out

```shell
./rmap login -u admin -p ******

./rmap logout
```

## Build instructions

### Compilation

```shell
make
```
