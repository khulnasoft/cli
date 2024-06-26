package command

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/khulnasoft/cli/cli/version"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// BaseMetricAttributes returns an attribute.Set containing attributes to attach to metrics/traces
func BaseMetricAttributes(cmd *cobra.Command) attribute.Set {
	attrList := []attribute.KeyValue{
		attribute.String("command.name", getCommandName(cmd)),
	}
	return attribute.NewSet(attrList...)
}

// InstrumentCobraCommands wraps all cobra commands' RunE funcs to set a command duration metric using otel.
//
// Note: this should be the last func to wrap/modify the PersistentRunE/RunE funcs before command execution.
//
// can also be used for spans!
func InstrumentCobraCommands(cmd *cobra.Command, mp metric.MeterProvider) {
	meter := getDefaultMeter(mp)
	// If PersistentPreRunE is nil, make it execute PersistentPreRun and return nil by default
	ogPersistentPreRunE := cmd.PersistentPreRunE
	if ogPersistentPreRunE == nil {
		ogPersistentPreRun := cmd.PersistentPreRun
		//nolint:unparam // necessary because error will always be nil here
		ogPersistentPreRunE = func(cmd *cobra.Command, args []string) error {
			ogPersistentPreRun(cmd, args)
			return nil
		}
		cmd.PersistentPreRun = nil
	}

	// wrap RunE in PersistentPreRunE so that this operation gets executed on all children commands
	cmd.PersistentPreRunE = func(cmd *cobra.Command, args []string) error {
		// If RunE is nil, make it execute Run and return nil by default
		ogRunE := cmd.RunE
		if ogRunE == nil {
			ogRun := cmd.Run
			//nolint:unparam // necessary because error will always be nil here
			ogRunE = func(cmd *cobra.Command, args []string) error {
				ogRun(cmd, args)
				return nil
			}
			cmd.Run = nil
		}
		cmd.RunE = func(cmd *cobra.Command, args []string) error {
			// start the timer as the first step of every cobra command
			stopCobraCmdTimer := startCobraCommandTimer(cmd, meter)
			cmdErr := ogRunE(cmd, args)
			stopCobraCmdTimer(cmdErr)
			return cmdErr
		}

		return ogPersistentPreRunE(cmd, args)
	}
}

func startCobraCommandTimer(cmd *cobra.Command, meter metric.Meter) func(err error) {
	ctx := cmd.Context()
	baseAttrs := BaseMetricAttributes(cmd)
	durationCounter, _ := meter.Float64Counter(
		"command.time",
		metric.WithDescription("Measures the duration of the cobra command"),
		metric.WithUnit("ms"),
	)
	start := time.Now()

	return func(err error) {
		duration := float64(time.Since(start)) / float64(time.Millisecond)
		cmdStatusAttrs := attributesFromError(err)
		durationCounter.Add(ctx, duration,
			metric.WithAttributeSet(baseAttrs),
			metric.WithAttributeSet(attribute.NewSet(cmdStatusAttrs...)),
		)
	}
}

func attributesFromError(err error) []attribute.KeyValue {
	attrs := []attribute.KeyValue{}
	exitCode := 0
	if err != nil {
		exitCode = 1
		if stderr, ok := err.(statusError); ok {
			// StatusError should only be used for errors, and all errors should
			// have a non-zero exit status, so only set this here if this value isn't 0
			if stderr.StatusCode != 0 {
				exitCode = stderr.StatusCode
			}
		}
		attrs = append(attrs, attribute.String("command.error.type", otelErrorType(err)))
	}
	attrs = append(attrs, attribute.String("command.status.code", strconv.Itoa(exitCode)))

	return attrs
}

// otelErrorType returns an attribute for the error type based on the error category.
func otelErrorType(err error) string {
	name := "generic"
	if errors.Is(err, context.Canceled) {
		name = "canceled"
	}
	return name
}

// statusError reports an unsuccessful exit by a command.
type statusError struct {
	Status     string
	StatusCode int
}

func (e statusError) Error() string {
	return fmt.Sprintf("Status: %s, Code: %d", e.Status, e.StatusCode)
}

// getCommandName gets the cobra command name in the format
// `... parentCommandName commandName` by traversing it's parent commands recursively.
// until the root command is reached.
//
// Note: The root command's name is excluded. If cmd is the root cmd, return ""
func getCommandName(cmd *cobra.Command) string {
	fullCmdName := getFullCommandName(cmd)
	i := strings.Index(fullCmdName, " ")
	if i == -1 {
		return ""
	}
	return fullCmdName[i+1:]
}

// getFullCommandName gets the full cobra command name in the format
// `... parentCommandName commandName` by traversing it's parent commands recursively
// until the root command is reached.
func getFullCommandName(cmd *cobra.Command) string {
	if cmd.HasParent() {
		return fmt.Sprintf("%s %s", getFullCommandName(cmd.Parent()), cmd.Name())
	}
	return cmd.Name()
}

// getDefaultMeter gets the default metric.Meter for the application
// using the given metric.MeterProvider
func getDefaultMeter(mp metric.MeterProvider) metric.Meter {
	return mp.Meter(
		"github.com/khulnasoft/cli",
		metric.WithInstrumentationVersion(version.Version),
	)
}
