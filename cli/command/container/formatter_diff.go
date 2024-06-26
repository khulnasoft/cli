package container

import (
	"github.com/docker/docker/api/types/container"
	"github.com/khulnasoft/cli/cli/command/formatter"
)

const (
	defaultDiffTableFormat = "table {{.Type}}\t{{.Path}}"

	changeTypeHeader = "CHANGE TYPE"
	pathHeader       = "PATH"
)

// NewDiffFormat returns a format for use with a diff Context
func NewDiffFormat(source string) formatter.Format {
	if source == formatter.TableFormatKey {
		return defaultDiffTableFormat
	}
	return formatter.Format(source)
}

// DiffFormatWrite writes formatted diff using the Context
func DiffFormatWrite(ctx formatter.Context, changes []container.FilesystemChange) error {
	render := func(format func(subContext formatter.SubContext) error) error {
		for _, change := range changes {
			if err := format(&diffContext{c: change}); err != nil {
				return err
			}
		}
		return nil
	}
	return ctx.Write(newDiffContext(), render)
}

type diffContext struct {
	formatter.HeaderContext
	c container.FilesystemChange
}

func newDiffContext() *diffContext {
	diffCtx := diffContext{}
	diffCtx.Header = formatter.SubHeaderContext{
		"Type": changeTypeHeader,
		"Path": pathHeader,
	}
	return &diffCtx
}

func (d *diffContext) MarshalJSON() ([]byte, error) {
	return formatter.MarshalJSON(d)
}

func (d *diffContext) Type() string {
	return d.c.Kind.String()
}

func (d *diffContext) Path() string {
	return d.c.Path
}
