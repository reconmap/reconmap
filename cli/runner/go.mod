module github.com/reconmap/cli

go 1.25.3

require (
	github.com/fatih/color v1.19.0
	github.com/rodaine/table v1.3.1
	go.uber.org/multierr v1.11.0 // indirect
	go.uber.org/zap v1.27.1 // indirect
	golang.org/x/sys v0.42.0 // indirect
)

require (
	github.com/coreos/go-oidc v2.5.0+incompatible
	github.com/reconmap/shared-lib v0.0.0-20220910165932-7d018d9111fc
	github.com/urfave/cli/v3 v3.8.0
	golang.org/x/oauth2 v0.36.0
)

require (
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/pquerna/cachecontrol v0.2.0 // indirect
	golang.org/x/crypto v0.49.0 // indirect
	gopkg.in/go-jose/go-jose.v2 v2.6.3 // indirect
)

replace github.com/reconmap/shared-lib => ../shared-lib
