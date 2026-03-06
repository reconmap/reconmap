package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/mail"
	"os"

	"github.com/reconmap/shared-lib/pkg/logging"

	"github.com/fatih/color"
	"github.com/reconmap/cli/internal/build"
	"github.com/reconmap/cli/internal/commands"
	"github.com/urfave/cli/v3"
)

const bannerBase64 = `
ICBfX19fICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICANCiB8ICBfIFwgX19fICBfX18gX19fICBfIF9fICBfIF9fIF9fXyAgIF9fIF8gXyBfXyAgDQogfCB8XykgLyBfIFwvIF9fLyBfIFx8ICdfIFx8ICdfIGAgXyBcIC8gX2AgfCAnXyBcIA0KIHwgIF8gPCAgX18vIChffCAoXykgfCB8IHwgfCB8IHwgfCB8IHwgKF98IHwgfF8pIHwNCiB8X3wgXF9cX19ffFxfX19cX19fL3xffCB8X3xffCB8X3wgfF98XF9fLF98IC5fXy8gDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfF98ICAgIA0KDQo=
`

func main() {
	logger := logging.GetLoggerInstance()
	defer func() {
		_ = logger.Sync()
	}()

	cli.VersionPrinter = printVersion

	rootCmd := newRootCommand()

	if err := rootCmd.Run(context.Background(), os.Args); err != nil {
		logger.Error(err)
		os.Exit(1)
	}
}

func newRootCommand() *cli.Command {
	return &cli.Command{
		Name:        "reconmap",
		Usage:       "Reconmap's CLI",
		Description: "Reconmap's command line interface",
		Version:     build.BuildVersion,
		Copyright:   "Apache License v2.0",
		Authors: []any{
			mail.Address{
				Name:    "Reconmap",
				Address: "info@reconmap.com",
			},
		},
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:    "hide-banner",
				Aliases: []string{"b"},
				Usage:   "hide Reconmap's banner",
			},
		},
		Before: func(ctx context.Context, c *cli.Command) (context.Context, error) {
			if !c.Bool("hide-banner") {
				if err := printBanner(); err != nil {
					return ctx, err
				}
			}
			return ctx, nil
		},
		Commands: commands.CommandList,
	}
}

func printVersion(c *cli.Command) {
	fmt.Printf(
		"Version=%s\nBuildDate=%s\nGitCommit=%s\n",
		c.Version,
		build.BuildTime,
		build.BuildCommit,
	)
}

func printBanner() error {
	decoded, err := base64.StdEncoding.DecodeString(bannerBase64)
	if err != nil {
		return fmt.Errorf("failed to decode banner: %w", err)
	}

	color.New(color.FgHiRed).Print(string(decoded))
	return nil
}
