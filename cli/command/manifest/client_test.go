package manifest

import (
	"context"

	"github.com/distribution/reference"
	"github.com/khulnasoft-lab/distribution"
	manifesttypes "github.com/khulnasoft/cli/cli/manifest/types"
	"github.com/khulnasoft/cli/cli/registry/client"
	"github.com/opencontainers/go-digest"
)

type fakeRegistryClient struct {
	getManifestFunc     func(ctx context.Context, ref reference.Named) (manifesttypes.ImageManifest, error)
	getManifestListFunc func(ctx context.Context, ref reference.Named) ([]manifesttypes.ImageManifest, error)
	mountBlobFunc       func(ctx context.Context, source reference.Canonical, target reference.Named) error
	putManifestFunc     func(ctx context.Context, source reference.Named, mf distribution.Manifest) (digest.Digest, error)
}

func (c *fakeRegistryClient) GetManifest(ctx context.Context, ref reference.Named) (manifesttypes.ImageManifest, error) {
	if c.getManifestFunc != nil {
		return c.getManifestFunc(ctx, ref)
	}
	return manifesttypes.ImageManifest{}, nil
}

func (c *fakeRegistryClient) GetManifestList(ctx context.Context, ref reference.Named) ([]manifesttypes.ImageManifest, error) {
	if c.getManifestListFunc != nil {
		return c.getManifestListFunc(ctx, ref)
	}
	return nil, nil
}

func (c *fakeRegistryClient) MountBlob(ctx context.Context, source reference.Canonical, target reference.Named) error {
	if c.mountBlobFunc != nil {
		return c.mountBlobFunc(ctx, source, target)
	}
	return nil
}

func (c *fakeRegistryClient) PutManifest(ctx context.Context, ref reference.Named, mf distribution.Manifest) (digest.Digest, error) {
	if c.putManifestFunc != nil {
		return c.putManifestFunc(ctx, ref, mf)
	}
	return digest.Digest(""), nil
}

var _ client.RegistryClient = &fakeRegistryClient{}
