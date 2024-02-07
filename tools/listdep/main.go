package main

import (
	"encoding/json"
	"log"
	"os"
	"strings"

	"github.com/khulnasoft/cli/internal/utils"
)

func main() {
	external := make([]string, 0)
	for _, img := range utils.ServiceImages {
		if !strings.HasPrefix(img, "khulnasoft/") ||
			strings.HasPrefix(img, "khulnasoft/logflare") {
			external = append(external, img)
		}
	}

	enc := json.NewEncoder(os.Stdout)
	if err := enc.Encode(external); err != nil {
		log.Fatal(err)
	}
}
