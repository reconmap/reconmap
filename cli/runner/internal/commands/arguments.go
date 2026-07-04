package commands

import (
	"context"
	"errors"
	"fmt"

	"github.com/reconmap/cli/internal/configuration"
	shareconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"github.com/urfave/cli/v3"
)

func preActionChecks(ctx context.Context, c *cli.Command) (context.Context, error) {
	if !shareconfig.HasConfig(configuration.ConfigFileName) {
		return nil, errors.New("rmap has not been configured. Please call the 'rmap config' command first")
	}
	config, err := shareconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return nil, fmt.Errorf("error reading configuration: %w", err)
	}
	ctx = context.WithValue(ctx, "config", config)
	return ctx, nil
}

func LoginAction(ctx context.Context, c *cli.Command) error {
	err := Login()
	return err
}

func LogoutAction(ctx context.Context, c *cli.Command) error {
	err := Logout()
	return err
}

func ConfigAction(ctx context.Context, c *cli.Command) error {
	config := configuration.NewConfig()
	configurationFilePath, err := shareconfig.SaveConfig(config, configuration.ConfigFileName)
	if err != nil {
		return fmt.Errorf("error saving configuration: %w", err)
	}
	fmt.Printf("Configuration successfully saved to: %s\n", configurationFilePath)
	fmt.Println("You can now use the 'rmap login' command to authenticate with the server.")
	return nil
}

var CommandList []*cli.Command = []*cli.Command{
	{
		Name:   "login",
		Usage:  "Initiates session with the server",
		Flags:  []cli.Flag{},
		Before: preActionChecks,
		Action: LoginAction,
	},
	{
		Name:   "logout",
		Usage:  "Terminates session with the server",
		Flags:  []cli.Flag{},
		Before: preActionChecks,
		Action: LogoutAction,
	},
	{
		Name:   "config",
		Usage:  "Creates a configuration file for Rmap",
		Flags:  []cli.Flag{},
		Action: ConfigAction,
	},
}

