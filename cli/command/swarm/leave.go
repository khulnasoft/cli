package swarm

import (
	"context"
	"fmt"

	"github.com/khulnasoft/cli/cli"
	"github.com/khulnasoft/cli/cli/command"
	"github.com/khulnasoft/cli/cli/command/completion"
	"github.com/spf13/cobra"
)

type leaveOptions struct {
	force bool
}

func newLeaveCommand(dockerCli command.Cli) *cobra.Command {
	opts := leaveOptions{}

	cmd := &cobra.Command{
		Use:   "leave [OPTIONS]",
		Short: "Leave the swarm",
		Args:  cli.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runLeave(cmd.Context(), dockerCli, opts)
		},
		Annotations: map[string]string{
			"version": "1.24",
			"swarm":   "active",
		},
		ValidArgsFunction: completion.NoComplete,
	}

	flags := cmd.Flags()
	flags.BoolVarP(&opts.force, "force", "f", false, "Force this node to leave the swarm, ignoring warnings")
	return cmd
}

func runLeave(ctx context.Context, dockerCli command.Cli, opts leaveOptions) error {
	client := dockerCli.Client()

	if err := client.SwarmLeave(ctx, opts.force); err != nil {
		return err
	}

	fmt.Fprintln(dockerCli.Out(), "Node left the swarm.")
	return nil
}
