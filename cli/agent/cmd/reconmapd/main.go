package main

import (
	"context"
	"fmt"
	"os"
	"reconmap/agent/internal"
	"reconmap/agent/internal/configuration"

	shareconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"github.com/urfave/cli/v3"
)

func ConfigAction(ctx context.Context, c *cli.Command) error {

	config := configuration.NewConfig()
	configurationFilePath, err := shareconfig.SaveConfig(config, configuration.ConfigFileName)
	if err != nil {
		return fmt.Errorf("error saving configuration: %w", err)
	}
	fmt.Printf("Configuration successfully saved to: %s\n", configurationFilePath)
	fmt.Println("You can now use the 'reconmapd run' command to start the server.")
	return nil
}

func RunAction(ctx context.Context, c *cli.Command) error {
	var listenAddress = c.String("listen")
	app := internal.NewApp()
	if err := app.Run(listenAddress); err != nil {
		app.Logger.Error(err)
		return err
	}
	return nil
}

func main() {
	mainCommand := cli.Command{
		Name:    "reconmapd",
		Usage:   "Reconmap's agent",
		Version: "1.0.0",
	}
	mainCommand.Copyright = "Apache License v2.0"
	mainCommand.Usage = "Reconmap's agent"
	mainCommand.Description = "Reconmap's agent for running scheduled commands"
	mainCommand.Commands = []*cli.Command{
		{
			Name:   "config",
			Usage:  "Creates a configuration file for Reconmapd",
			Flags:  []cli.Flag{},
			Action: ConfigAction,
		},
		{
			Name:  "run",
			Usage: "Starts the Reconmapd server",
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:  "listen",
					Value: ":10000",
					Usage: "address and port to listen",
				},
			},
			Action: RunAction,
		},
	}

	err := mainCommand.Run(context.Background(), os.Args)
	if err != nil {
		panic(err)
	}
}
