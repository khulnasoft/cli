package cmd

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"

	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/khulnasoft/cli/internal/link"
	"github.com/khulnasoft/cli/internal/utils"
	"golang.org/x/term"
)

var (
	projectRef string

	linkCmd = &cobra.Command{
		GroupID: groupLocalDev,
		Use:     "link",
		Short:   "Link to a Khulnasoft project",
		PreRunE: func(cmd *cobra.Command, args []string) error {
			if !term.IsTerminal(int(os.Stdin.Fd())) {
				return cmd.MarkFlagRequired("project-ref")
			}
			return nil
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, _ := signal.NotifyContext(cmd.Context(), os.Interrupt)
			if len(projectRef) == 0 {
				title := "Which project do you want to link?"
				cobra.CheckErr(PromptProjectRef(ctx, title))
			}
			fsys := afero.NewOsFs()
			if err := link.PreRun(projectRef, fsys); err != nil {
				return err
			}
			dbPassword = viper.GetString("DB_PASSWORD")
			if dbPassword == "" {
				dbPassword = link.PromptPasswordAllowBlank(os.Stdin)
			}
			return link.Run(ctx, projectRef, dbPassword, fsys)
		},
		PostRunE: func(cmd *cobra.Command, args []string) error {
			return link.PostRun(projectRef, os.Stdout, afero.NewOsFs())
		},
	}
)

func init() {
	flags := linkCmd.Flags()
	flags.StringVar(&projectRef, "project-ref", "", "Project ref of the Khulnasoft project.")
	flags.StringVarP(&dbPassword, "password", "p", "", "Password to your remote Postgres database.")
	cobra.CheckErr(viper.BindPFlag("DB_PASSWORD", flags.Lookup("password")))
	rootCmd.AddCommand(linkCmd)
}

func PromptProjectRef(ctx context.Context, title string) error {
	resp, err := utils.GetKhulnasoft().GetProjectsWithResponse(ctx)
	if err != nil {
		return err
	}
	if resp.JSON200 == nil {
		return errors.New("Unexpected error retrieving projects: " + string(resp.Body))
	}
	items := make([]utils.PromptItem, len(*resp.JSON200))
	for i, project := range *resp.JSON200 {
		items[i] = utils.PromptItem{
			Summary: project.Id,
			Details: fmt.Sprintf("name: %s, org: %s, region: %s", project.Name, project.OrganizationId, project.Region),
		}
	}
	choice, err := utils.PromptChoice(ctx, title, items)
	if err != nil {
		return err
	}
	projectRef = choice.Summary
	fmt.Fprintln(os.Stderr, "Selected project:", projectRef)
	return nil
}
