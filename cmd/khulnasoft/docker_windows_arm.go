//go:build windows && arm

//go:generate goversioninfo -arm=true -o=../../cli/winresources/resource.syso -icon=winresources/docker.ico -manifest=winresources/docker.exe.manifest ../../cli/winresources/versioninfo.json

package main

import _ "github.com/khulnasoft/cli/cli/winresources"
