package update

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/go-errors/errors"
	"github.com/khulnasoft/cli/internal/utils"
	"github.com/khulnasoft/cli/internal/utils/credentials"
	"github.com/khulnasoft/cli/pkg/api"
)

func Run(ctx context.Context, projectRef string, stdin *os.File) error {
	fmt.Fprintf(os.Stderr, "Enter a new root key: ")
	input := credentials.PromptMasked(stdin)
	resp, err := utils.GetKhulnasoft().UpdatePgsodiumConfigWithResponse(ctx, projectRef, api.UpdatePgsodiumConfigBody{
		RootKey: strings.TrimSpace(input),
	})
	if err != nil {
		return errors.Errorf("failed to update pgsodium config: %w", err)
	}

	if resp.JSON200 == nil {
		return errors.New("Unexpected error updating project root key: " + string(resp.Body))
	}

	fmt.Println("Finished " + utils.Aqua("khulnasoft root-key update") + ".")
	return nil
}
