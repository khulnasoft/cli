# Khulnasoft CLI (v1)

[![Coverage Status](https://coveralls.io/repos/github/khulnasoft/cli/badge.svg?branch=main)](https://coveralls.io/github/khulnasoft/cli?branch=main)

[Khulnasoft](https://khulnasoft.com) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

This repository contains all the functionality for Khulnasoft CLI.

- [x] Running Khulnasoft locally
- [x] Managing database migrations
- [x] Pushing your local changes to production
- [x] Create and Deploy Khulnasoft Functions
- [ ] Manage your Khulnasoft Account
- [x] Manage your Khulnasoft Projects
- [x] Generating types directly from your database schema
- [ ] Generating API and validation schemas from your database

## Getting started

### Install the CLI

Available via [NPM](https://www.npmjs.com) as dev dependency. To install:

```bash
npm i khulnasoft --save-dev
```

To install the beta release channel:

```bash
npm i khulnasoft@beta --save-dev
```

> **Note**
For Bun versions below v1.0.17, you must add `khulnasoft` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D khulnasoft`.

<details>
  <summary><b>macOS</b></summary>

  Available via [Homebrew](https://brew.sh). To install:

  ```sh
  brew install khulnasoft/tap/khulnasoft
  ```

  To install the beta release channel:
  
  ```sh
  brew install khulnasoft/tap/khulnasoft-beta
  brew link --overwrite khulnasoft-beta
  ```
  
  To upgrade:

  ```sh
  brew upgrade khulnasoft
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add khulnasoft https://github.com/khulnasoft/scoop-bucket.git
  scoop install khulnasoft
  ```

  To upgrade:

  ```powershell
  scoop update khulnasoft
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install khulnasoft/tap/khulnasoft
  ```

  To upgrade:

  ```sh
  brew upgrade khulnasoft
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/khulnasoft/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/khulnasoft/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/cli" /usr/bin/khulnasoft
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/khulnasoft.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install khulnasoft
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/khulnasoft-cli/default.nix).
</details>

### Run the CLI

```bash
khulnasoft help
```

Or using npx:

```bash
npx khulnasoft help
```

## Docs

Command & config reference can be found [here](https://khulnasoft.com/docs/reference/cli/about).

## Breaking changes

The CLI is a WIP and we're still exploring the design, so expect a lot of breaking changes. We try to document migration steps in [Releases](https://github.com/khulnasoft/cli/releases). Please file an issue if these steps don't work!

## Developing

To run from source:

```sh
# Go >= 1.20
go run . help
```
