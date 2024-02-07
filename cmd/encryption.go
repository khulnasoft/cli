package cmd

import (
	"os"

	"github.com/spf13/cobra"
	"github.com/khulnasoft/cli/internal/encryption/get"
	"github.com/khulnasoft/cli/internal/encryption/update"
	"github.com/khulnasoft/cli/internal/utils/flags"
)

var (
	encryptionCmd = &cobra.Command{
		GroupID: groupManagementAPI,
		Use:     "encryption",
		Short:   "Manage encryption keys of Khulnasoft projects",
	}

	rootKeyGetCmd = &cobra.Command{
		Use:   "get-root-key",
		Short: "Get the root encryption key of a Khulnasoft project",
		RunE: func(cmd *cobra.Command, args []string) error {
			return get.Run(cmd.Context(), flags.ProjectRef)
		},
	}

	rootKeyUpdateCmd = &cobra.Command{
		Use:   "update-root-key",
		Short: "Update root encryption key of a Khulnasoft project",
		RunE: func(cmd *cobra.Command, args []string) error {
			return update.Run(cmd.Context(), flags.ProjectRef, os.Stdin)
		},
	}
)

func init() {
	encryptionCmd.PersistentFlags().StringVar(&flags.ProjectRef, "project-ref", "", "Project ref of the Khulnasoft project.")
	encryptionCmd.AddCommand(rootKeyUpdateCmd)
	encryptionCmd.AddCommand(rootKeyGetCmd)
	rootCmd.AddCommand(encryptionCmd)
}
