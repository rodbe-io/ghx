#!/usr/bin/env node
import { env } from 'node:process';
import { execSync } from 'node:child_process';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import select from '@inquirer/select';
import input from '@inquirer/input';
import { getOrgs } from '@rodbe/github-api';
import { checkUpdates } from '@rodbe/check-updates';
import { tryCatch } from '@rodbe/fn-utils';
import { getConfig } from '@rodbe/get-config';

import { initEvents } from '@/events';
import { DAY_IN_MS, WEEK_IN_MS } from '@/constants';
import { getGhxPkgJson, getPkgJsonPath } from '@/helpers/ghx';
import { getOrgsRepos } from '@/tasks/getOrgRepos';
import { getUserRepos } from '@/tasks/getUserRepos';
import { getStarredRepos } from '@/tasks/getStarredRepos';
import type { CLONE_FROM, WAY_TO_CLONE } from '@/types';

initEvents();

interface Config {
  githubPat: string;
  hostAlias?: string;
}

const getRepoUrl = ({
  repoUrl,
  hostAlias,
  wayToClone,
}: {
  hostAlias: string;
  repoUrl: string;
  wayToClone: WAY_TO_CLONE;
}) => {
  if (!hostAlias) {
    return repoUrl;
  }

  if (wayToClone === 'HTTPS') {
    return repoUrl;
  }

  return repoUrl.replace('github.com', hostAlias);
};

export const init = async () => {
  const argv = await yargs(hideBin(process.argv))
    .version(false)
    .options({
      debug: { alias: 'd', default: false, type: 'boolean' },
      dev: { default: false, type: 'boolean' },
      version: { alias: 'v', default: false, type: 'boolean' },
    }).argv;

  if (argv.version) {
    console.log(getGhxPkgJson().version);
    process.exit(0);
  }

  const config = await getConfig<Config>('ghx', { debug: argv.debug });

  let githubToken = env['GHX_GITHUB_PAT'] ?? config?.githubPat;
  let hostAlias = config?.hostAlias ?? '';

  const { checkNewVersion } = checkUpdates({
    askToUpdate: true,
    dontAskCheckInterval: DAY_IN_MS,
    packageJsonPath: getPkgJsonPath(),
    updateCheckInterval: WEEK_IN_MS,
  });

  if (argv.dev) {
    await checkNewVersion?.();
  }

  if (!githubToken) {
    console.error(
      '❌ The GHX_GITHUB_PAT env needs to be set in order to start.\nFollow the instructions to get your TOKEN:\n\n'
    );
    console.log(
      `https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic`
    );

    githubToken = await input({
      message: 'Enter your GitHub Personal Access Token:',
    });

    if (!githubToken) {
      console.error('❌ A GitHub Personal Access Token is required to proceed.');

      process.exit(1);
    }
  }

  const wayToClone = await select<WAY_TO_CLONE>({
    choices: [
      { name: 'SSH', value: 'SSH' },
      { name: 'HTTPS', value: 'HTTPS' },
    ],
    default: 'SSH',
    message: 'How do you want to clone the repos?',
  });

  if (wayToClone === 'SSH' && !hostAlias) {
    hostAlias = await input({
      default: '',
      message:
        'Enter the host alias you have set for GitHub in your SSH config (leave empty if you use HTTPS or the default "github.com" for SSH):',
    });
  }

  const { errors, organizations } = await getOrgs({
    mapper: (org) => ({ name: org.login, value: org.login }),
    token: githubToken,
  });

  if (errors.length) {
    console.error('❌ Error occurred while fetching organizations:', errors);
    process.exit(1);
  }

  if (!organizations.length) {
    const { allReposToClone } = await getUserRepos({ token: githubToken, wayToClone });

    for (const repo of allReposToClone) {
      tryCatch(() =>
        execSync(`git clone ${getRepoUrl({ hostAlias, repoUrl: repo, wayToClone })}`, {
          stdio: 'inherit',
        })
      );
    }

    return;
  }

  const cloneFrom = await select<CLONE_FROM>({
    choices: [
      { name: 'My Personal repos', value: 'PERSONAL' },
      { name: 'My Orgs', value: 'ORG' },
      { name: 'My Starred repos', value: 'STARRED' },
    ],
    default: 'PERSONAL',
    message: 'Clone from?',
  });

  if (cloneFrom === 'PERSONAL') {
    const { allReposToClone } = await getUserRepos({ token: githubToken, wayToClone });

    for (const repo of allReposToClone) {
      tryCatch(() =>
        execSync(`git clone ${getRepoUrl({ hostAlias, repoUrl: repo, wayToClone })}`, {
          stdio: 'inherit',
        })
      );
    }

    return;
  }

  if (cloneFrom === 'STARRED') {
    const { allReposToClone } = await getStarredRepos({ token: githubToken, wayToClone });

    for (const repo of allReposToClone) {
      tryCatch(() =>
        execSync(`git clone ${getRepoUrl({ hostAlias, repoUrl: repo, wayToClone })}`, {
          stdio: 'inherit',
        })
      );
    }

    return;
  }

  const { allReposToClone } = await getOrgsRepos({
    orgs: organizations,
    token: githubToken,
    wayToClone,
  });

  for (const repo of allReposToClone) {
    tryCatch(() =>
      execSync(`git clone ${getRepoUrl({ hostAlias, repoUrl: repo, wayToClone })}`, {
        stdio: 'inherit',
      })
    );
  }
};

await init();
