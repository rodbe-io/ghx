# GHX Command Line Tool

## Overview

The GHX command line tool **allows** users to **easily clone repositories from multiple GitHub organizations**. It's designed with a **user-friendly interface**, prompting users to select their desired organizations and repositories for cloning.

## Features

- Choose between `SSH` and `HTTPS` cloning methods.
- Select multiple GitHub organizations.
- Select multiple repositories from each organization to clone.

## Prerequisites

- `Node.js 18.18.2 or higher` installed on your system.
- Set up a GitHub personal access token as an environment variable `GHX_GITHUB_PAT`.

## Installation

Clone the repository and navigate to the directory:

```bash
npm i -g @rodbe/ghx
```

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
  - Select the organizations you wish to clone repositories from.
  - Choose the specific repositories within each organization to clone.

4. **Cloning:**

  The selected repositories will be cloned to your current directory.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository or contact the development team.