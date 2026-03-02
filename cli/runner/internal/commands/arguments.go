package commands

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/fatih/color"
	"github.com/reconmap/cli/internal/configuration"
	"github.com/reconmap/shared-lib/pkg/api"
	shareconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"github.com/rodaine/table"
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

func SearchCommandsAction(ctx context.Context, c *cli.Command) error {
	if c.Args().Len() == 0 {
		return errors.New("no keywords were entered after the search command")
	}
	var keywords string = strings.Join(c.Args().Slice(), " ")
	config, err := shareconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return err
	}
	commands, err := api.GetCommandsByKeywords(config.ReconmapApiConfig.BaseUri, keywords)
	if err != nil {
		return err
	}

	var numCommands int = len(*commands)
	fmt.Printf("%d commands matching '%s'\n", numCommands, keywords)

	if numCommands > 0 {
		fmt.Println()

		headerFmt := color.New(color.FgGreen, color.Underline).SprintfFunc()
		columnFmt := color.New(color.FgYellow).SprintfFunc()

		tbl := table.New("ID", "Name", "Description", "Output parser", "Executable type", "Executable path", "Arguments")
		tbl.WithHeaderFormatter(headerFmt).WithFirstColumnFormatter(columnFmt)

		for _, command := range *commands {
			tbl.AddRow(command.ID, command.Name, command.Description)

		}
		tbl.Print()
	}

	return err
}

func RunCommandAction(ctx context.Context, c *cli.Command) error {
	projectId := c.Int("projectId")
	commandUsageId := c.Int("cuid")

	config, err := shareconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return err
	}

	usage, err := api.GetCommandUsageById(config.ReconmapApiConfig.BaseUri, commandUsageId)
	if err != nil {
		return fmt.Errorf("unable to retrieve command usage with id=%d (%w)", commandUsageId, err)
	}
	err = RunCommand(projectId, usage, c.StringSlice("var"))
	if err != nil {
		return err
	}

	err = UploadResults(projectId, usage)
	return err
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
	{
		Name:    "command",
		Aliases: []string{"c"},
		Usage:   "Search and run commands",
		Before:  preActionChecks,
		Commands: []*cli.Command{
			{
				Name:   "search",
				Usage:  "Search commands by keywords",
				Action: SearchCommandsAction,
			},
			{
				Name:  "run",
				Usage: "Run a command and upload its output to the server",
				Flags: []cli.Flag{
					&cli.IntFlag{Name: "projectId", Aliases: []string{"pid"}, Required: false},
					&cli.IntFlag{Name: "commandUsageId", Aliases: []string{"cuid"}, Required: true},
					&cli.StringSliceFlag{Name: "var", Required: false},
				},
				Action: RunCommandAction,
			},
		},
	},
}
