package config

import (
	"context"
	"fmt"
	"strings"

	"github.com/khulnasoft/cli/cli"
	"github.com/khulnasoft/cli/cli/command"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

// RemoveOptions contains options for the docker config rm command.
type RemoveOptions struct {
	Names []string
}

func newConfigRemoveCommand(dockerCli command.Cli) *cobra.Command {
	return &cobra.Command{
		Use:     "rm CONFIG [CONFIG...]",
		Aliases: []string{"remove"},
		Short:   "Remove one or more configs",
		Args:    cli.RequiresMinArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := RemoveOptions{
				Names: args,
			}
			return RunConfigRemove(cmd.Context(), dockerCli, opts)
		},
		ValidArgsFunction: func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			return completeNames(dockerCli)(cmd, args, toComplete)
		},
	}
}

// RunConfigRemove removes the given Swarm configs.
func RunConfigRemove(ctx context.Context, dockerCli command.Cli, opts RemoveOptions) error {
	client := dockerCli.Client()

	var errs []string

	for _, name := range opts.Names {
		if err := client.ConfigRemove(ctx, name); err != nil {
			errs = append(errs, err.Error())
			continue
		}

		fmt.Fprintln(dockerCli.Out(), name)
	}

	if len(errs) > 0 {
		return errors.Errorf("%s", strings.Join(errs, "\n"))
	}

	return nil
}
