package cmd

import (
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/khulnasoft/cli/internal/secrets/list"
	"github.com/khulnasoft/cli/internal/secrets/set"
	"github.com/khulnasoft/cli/internal/secrets/unset"
	"github.com/khulnasoft/cli/internal/utils/flags"
)

var (
	secretsCmd = &cobra.Command{
		GroupID: groupManagementAPI,
		Use:     "secrets",
		Short:   "Manage Khulnasoft secrets",
	}

	secretsListCmd = &cobra.Command{
		Use:   "list",
		Short: "List all secrets on Khulnasoft",
		Long:  "List all secrets in the linked project.",
		RunE: func(cmd *cobra.Command, args []string) error {
			return list.Run(cmd.Context(), flags.ProjectRef, afero.NewOsFs())
		},
	}

	secretsSetCmd = &cobra.Command{
		Use:   "set [flags] <NAME=VALUE> ...",
		Short: "Set a secret(s) on Khulnasoft",
		Long:  "Set a secret(s) to the linked Khulnasoft project.",
		RunE: func(cmd *cobra.Command, args []string) error {
			envFilePath, err := cmd.Flags().GetString("env-file")
			if err != nil {
				return err
			}
			return set.Run(cmd.Context(), flags.ProjectRef, envFilePath, args, afero.NewOsFs())
		},
	}

	secretsUnsetCmd = &cobra.Command{
		Use:   "unset <NAME> ...",
		Short: "Unset a secret(s) on Khulnasoft",
		Long:  "Unset a secret(s) from the linked Khulnasoft project.",
		RunE: func(cmd *cobra.Command, args []string) error {
			return unset.Run(cmd.Context(), flags.ProjectRef, args, afero.NewOsFs())
		},
	}
)

func init() {
	secretsCmd.PersistentFlags().StringVar(&flags.ProjectRef, "project-ref", "", "Project ref of the Khulnasoft project.")
	secretsSetCmd.Flags().String("env-file", "", "Read secrets from a .env file.")
	secretsCmd.AddCommand(secretsListCmd)
	secretsCmd.AddCommand(secretsSetCmd)
	secretsCmd.AddCommand(secretsUnsetCmd)
	rootCmd.AddCommand(secretsCmd)
}
