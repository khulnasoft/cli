# Khulnasoft-cli 
Build: [![Khulnasoft build status]( https://g.khulnasoft.com/api/badges/pipeline/khulnasoft-inc/khulnasoft%2Fcli%2Fbuild?type=cf-2)]( https://g.khulnasoft.com/public/accounts/khulnasoft-inc/pipelines/khulnasoft/cli/build)
Release: [![Khulnasoft build status]( https://g.khulnasoft.com/api/badges/pipeline/khulnasoft-inc/khulnasoft%2Fcli%2Frelease?type=cf-2)]( https://g.khulnasoft.com/public/accounts/khulnasoft-inc/pipelines/khulnasoft/cli/release)


Khulnasoft CLI provides a full and flexible interface to interact with Khulnasoft.

![demo](cli.gif)

## Install
In case you have node.js installed you can easily install with NPM.

`npm install -g khulnasoft`

For other installation possibilities check out the <a href="http://cli.khulnasoft.com/installation" target="_blank">installation documentation</a>.

## Authenticate
Generate a new api key from the <a href="https://g.khulnasoft.com/account-conf/tokens" target="_blank">account settings</a> page.

`khulnasoft auth create-context --api-key {{API_KEY}}`

## Usage
```$xslt
khulnasoft <command>

Commands:
  khulnasoft completion             generate bash completion script
  khulnasoft tag <id> [tags..]      Add an image tag.
  khulnasoft untag <id> [tags..]    Untag an image.
  khulnasoft annotate               Annotate a resource with labels.
  khulnasoft patch                  Patch a resource by filename or stdin.
  khulnasoft auth                   Manage authentication contexts.
  khulnasoft create                 Create a resource from a file or stdin.
  khulnasoft delete                 Delete a resource by file or resource name.
  khulnasoft generate               Generate resources as Kubernetes image pull secret and Khulnasoft Registry token.
  khulnasoft get                    Display one or many resources.
  khulnasoft replace                Replace a resource by filename.
  khulnasoft version                Print version.
  khulnasoft logs <id>              Show logs of a build.
  khulnasoft restart <id>           Restart a build by its id.
  khulnasoft terminate <id>         Terminate a build by its id.
  khulnasoft wait <id..>            Wait until a condition will be met on a build.
  khulnasoft run <name>             Run a pipeline by id or name and attach the created workflow logs.
  khulnasoft delete-release [name]  Delete a helm release from a kubernetes cluster.
  khulnasoft install-chart          Install or upgrade a Helm chart Repository flag can be either absolute url or saved repository in Khulnasoft.
  khulnasoft helm-promotion         Promote a Helm release in another environment.
  khulnasoft test-release [name]    Test a helm release.

Options:
  --cfconfig  Custom path for authentication contexts config file  [default: "/Users/itaigendler/.cfconfig"]
  --help      Show help  [boolean]
```

## Documentation
For more information please visit the official <a href="http://cli.khulnasoft.com" target="_blank">CLI documentation</a> site.
