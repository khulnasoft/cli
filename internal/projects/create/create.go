package create

import (
	"context"
	"fmt"

	"github.com/go-errors/errors"
	"github.com/spf13/afero"
	"github.com/khulnasoft/cli/internal/utils"
	"github.com/khulnasoft/cli/pkg/api"
)

func Run(ctx context.Context, params api.CreateProjectBody, fsys afero.Fs) error {
	resp, err := utils.GetKhulnasoft().CreateProjectWithResponse(ctx, params)
	if err != nil {
		return errors.Errorf("failed to create project: %w", err)
	}

	if resp.JSON201 == nil {
		return errors.New("Unexpected error creating project: " + string(resp.Body))
	}

	projectUrl := fmt.Sprintf("%s/project/%s", utils.GetKhulnasoftDashboardURL(), resp.JSON201.Id)
	fmt.Printf("Created a new project %s at %s\n", utils.Aqua(resp.JSON201.Name), projectUrl)
	return nil
}
