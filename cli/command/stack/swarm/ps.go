package swarm

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/khulnasoft/cli/cli/command"
	"github.com/khulnasoft/cli/cli/command/idresolver"
	"github.com/khulnasoft/cli/cli/command/stack/options"
	"github.com/khulnasoft/cli/cli/command/task"
)

// RunPS is the swarm implementation of docker stack ps
func RunPS(ctx context.Context, dockerCli command.Cli, opts options.PS) error {
	filter := getStackFilterFromOpt(opts.Namespace, opts.Filter)

	client := dockerCli.Client()
	tasks, err := client.TaskList(ctx, types.TaskListOptions{Filters: filter})
	if err != nil {
		return err
	}

	if len(tasks) == 0 {
		return fmt.Errorf("nothing found in stack: %s", opts.Namespace)
	}

	format := opts.Format
	if len(format) == 0 {
		format = task.DefaultFormat(dockerCli.ConfigFile(), opts.Quiet)
	}

	return task.Print(ctx, dockerCli, tasks, idresolver.New(client, opts.NoResolve), !opts.NoTrunc, opts.Quiet, format)
}
