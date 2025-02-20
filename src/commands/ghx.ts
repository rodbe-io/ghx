#!/usr/bin/env node
import { env } from 'node:process';
import { execSync } from 'node:child_process';

import select from '@inquirer/select';
import { getOrgs } from '@rodbe/github-api';
import { checkUpdates } from '@rodbe/check-updates';
import { tryCatch } from '@rodbe/fn-utils';

import { initEvents } from '@/events';
import { DAY_IN_MS, WEEK_IN_MS } from '@/constants';
import { getPkgJsonPath } from '@/helpers/ghx';
import { getOrgsRepos } from '@/tasks/getOrgRepos';
import { getUserRepos } from '@/tasks/getUserRepos';
import { getStarredRepos } from '@/tasks/getStarredRepos';
import type { CLONE_FROM, WAY_TO_CLONE } from '@/types';

initEvents();

export const init = async () => {
  const githubToken = env.GHX_GITHUB_PAT;

  const { checkNewVersion } = checkUpdates({
    askToUpdate: true,
    dontAskCheckInterval: DAY_IN_MS,
    packageJsonPath: getPkgJsonPath(),
    updateCheckInterval: WEEK_IN_MS,
  });

  await checkNewVersion?.();

  if (!githubToken) {
    console.error(
      'The GHX_GITHUB_PAT env needs to be set in order to start.\nFollow the instructions to get your TOKEN:\n\n'
    );
    console.log(
      `https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic`
    );
    process.exit(1);
  }

  const wayToClone = await select<WAY_TO_CLONE>({
    choices: [
      { name: 'SSH', value: 'SSH' },
      { name: 'HTTPS', value: 'HTTPS' },
    ],
    default: 'SSH',
    message: 'How do you want to clone the repos?',
  });

  const orgs = await getOrgs({ mapper: org => ({ name: org.login, value: org.login }), token: githubToken });

  if (!orgs.length) {
    const { allReposToClone } = await getUserRepos({ token: githubToken, wayToClone });

    for (const repo of allReposToClone) {
      tryCatch(() => execSync(`git clone ${repo}`, { stdio: 'inherit' }));
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
      tryCatch(() => execSync(`git clone ${repo}`, { stdio: 'inherit' }));
    }

    return;
  }

  if (cloneFrom === 'STARRED') {
    const { allReposToClone } = await getStarredRepos({ token: githubToken, wayToClone });

    for (const repo of allReposToClone) {
      tryCatch(() => execSync(`git clone ${repo}`, { stdio: 'inherit' }));
    }

    return;
  }

  const { allReposToClone } = await getOrgsRepos({ orgs, token: githubToken, wayToClone });

  for (const repo of allReposToClone) {
    tryCatch(() => execSync(`git clone ${repo}`, { stdio: 'inherit' }));
  }
};

await init();
