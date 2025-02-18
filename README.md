# GHX 🐙: CLI with a user-friendly interface to clone GitHub repositories ⚡️

## Overview

The GHX is a CLI that **allows** users to **easily clone your repositories**. It's designed with a **user-friendly interface**, prompting users to select the method (SSH/HTTPS) and the source (personal account, organizations, or starred)

## Features

- Choose between `SSH` and `HTTPS` cloning methods.
- Choose where to clone your repos: personal account, organizations, or starred.
- Select multiple GitHub organizations.
- Select multiple repositories from each organization to clone.
- Apply **fuzzy search** to your selections.

## Prerequisites

- `Node.js 18.18.2 or higher` installed on your system.
- Set up a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) as an environment variable `GHX_GITHUB_PAT`.
- Configure your [ssh](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) for [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account#adding-a-new-ssh-key-to-your-account)

> Set read permissions to repos and orgs, for you token

## Installation

Clone the repository and navigate to the directory:

```bash
npm i -g @rodbe/ghx
```

> if you have a permission error, try to install with **administrator privileges**

## Usage

1. **Set up the GitHub Personal Access Token:**

  Ensure you have a GitHub personal access token and set it as an environment variable:

  ```bash
  export GHX_GITHUB_PAT=your_personal_access_token
  ```

2. **Run the tool:**

  Execute the CLI tool:

  ```bash
  ghx
  ```

3. **Follow the prompts:**

  - Choose your preferred cloning method (SSH or HTTPS).
  - Choose where to clone your repositories from (personal account, organizations, or starred).
  - Select the organizations you wish to clone repositories from.
  - Choose the specific repositories within each organization to clone.

4. **Cloning:**

  The selected repositories will be cloned to your current directory.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository or contact the development team.