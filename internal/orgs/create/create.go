package create

import (
	"context"
	"fmt"

	"github.com/go-errors/errors"
	"github.com/khulnasoft/cli/internal/utils"
	"github.com/khulnasoft/cli/pkg/api"
)

func Run(ctx context.Context, name string) error {
	resp, err := utils.GetKhulnasoft().CreateOrganizationWithResponse(ctx, api.CreateOrganizationJSONRequestBody{Name: name})
	if err != nil {
		return errors.Errorf("failed to create organization: %w", err)
	}

	if resp.JSON201 == nil {
		return errors.New("Unexpected error creating organization: " + string(resp.Body))
	}

	fmt.Println("Created organization:", resp.JSON201.Id)
	return nil
}
