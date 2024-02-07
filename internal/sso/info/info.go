package info

import (
	"context"
	"fmt"
	"os"

	"github.com/khulnasoft/cli/internal/sso/internal/render"
	"github.com/khulnasoft/cli/internal/utils"
)

func Run(ctx context.Context, ref string, format string) error {
	switch format {
	case utils.OutputPretty:
		return render.InfoMarkdown(ref)

	default:
		return utils.EncodeOutput(format, os.Stdout, map[string]interface{}{
			"acs_url":     fmt.Sprintf("https://%s.khulnasoft.co/auth/v1/sso/saml/acs", ref),
			"entity_id":   fmt.Sprintf("https://%s.khulnasoft.co/auth/v1/sso/saml/metadata", ref),
			"relay_state": fmt.Sprintf("https://%s.khulnasoft.co", ref),
		})
	}
}
