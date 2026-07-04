# GHX 🐙: CLI with a user-friendly interface to clone GitHub repositories ⚡️

## Overview

GHX is a CLI that helps you clone repositories from your personal account, organizations, or starred repositories with a simple interactive experience. The latest flow also supports optional flags for debugging, version checking, and update checks.

## Features

- Choose between `SSH` and `HTTPS` cloning methods.
- Choose where to clone repositories from: personal account, organizations, or starred repositories.
- Select multiple GitHub organizations.
- Select multiple repositories from each organization to clone.
- Apply fuzzy search to your selections.
- Use optional CLI flags: `--debug`, `--dev`, and `--version`.
- Support an SSH host alias for GitHub when cloning over SSH.

## Prerequisites

- Node.js 18.18.2 or higher installed on your system.
- A GitHub personal access token configured as the `GHX_GITHUB_PAT` environment variable or stored in the CLI config.
- SSH configured for GitHub if you plan to use `SSH` cloning.

> Grant read permissions to repositories and organizations in your token.

## Installation

Install the package globally:

```bash
npm i -g @rodbe/ghx
```

> If you hit a permission error, try running the installation with administrator privileges.

## Configuration

GHX resolves the GitHub token in this order:

1. The `GHX_GITHUB_PAT` environment variable.
2. The CLI configuration entry for `ghx.githubPat`.

If no token is found, the CLI will prompt you to enter it interactively.

If you use `SSH` cloning and a host alias is available in the config, GHX will use it to rewrite GitHub URLs. If no alias is configured, the CLI will ask you for one during the flow. You can leave it empty to keep using the default `github.com` host or switch to `HTTPS`.

### Token setup options

You can provide the token in any of these ways:

- Export it as an environment variable:

  ```bash
  export GHX_GITHUB_PAT=your_personal_access_token
  ```

- Store it in the CLI config under `ghx.githubPat`.

- Enter it manually when the CLI prompts for it.

## Usage

1. Set up your GitHub personal access token:

   ```bash
   export GHX_GITHUB_PAT=your_personal_access_token
   ```

2. Run the tool:

   ```bash
   ghx
   ```

3. Follow the prompts:

   - Choose your preferred cloning method (`SSH` or `HTTPS`).
   - Choose the source of repositories: personal, organizations, or starred.
   - If you select organizations, pick the organizations you want to browse.
   - Choose the repositories to clone.

4. Cloning:

   The selected repositories will be cloned into your current directory.

### CLI options

- `ghx --version`: prints the installed GHX version.
- `ghx --debug`: enables debug logging for configuration resolution.
- `ghx --dev`: runs the update check flow before starting.

If you are not part of any organization, GHX will fall back to cloning your personal repositories.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository or contact the development team.