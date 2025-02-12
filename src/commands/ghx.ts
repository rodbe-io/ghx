#!/usr/bin/env node
import { env } from 'node:process';
import { execSync } from 'node:child_process';

import checkbox from '@inquirer/checkbox';
import input from '@inquirer/input';
import select from '@inquirer/select';
import { getAllReposByOrg, getOrgs } from '@rodbe/github-api';
import { checkUpdates } from '@rodbe/check-updates';

import { initEvents } from '@/events';
import { DAY_IN_MS, WEEK_IN_MS } from '@/constants';
import { getPkgJsonPath } from '@/helpers/ghx';

initEvents();

export const init = async () => {
  const githubToken = env.GHX_GITHUB_PAT;

  const { checkNewVersion } = checkUpdates({
    askToUpdate: true,
    debug: true,
    dontAskCheckInterval: DAY_IN_MS,
    packageJsonPath: getPkgJsonPath(),
    updateCheckInterval: WEEK_IN_MS,
  });

  await checkNewVersion?.();

  if (!githubToken) {
    console.error('The GHX_GITHUB_PAT env needs to be set in order to start');
    process.exit(1);
  }

  const wayToClone = await select({
    choices: [
      { name: 'SSH', value: 'SSH' },
      { name: 'HTTPS', value: 'HTTPS' },
    ],
    default: 'SSH',
    message: 'How do you want to clone the repos?\n',
  });

  const orgs = await getOrgs({ mapper: org => ({ name: org.login, value: org.login }), token: githubToken });

  const selectedOrgs = await checkbox({
    choices: orgs,
    message: 'Select the ORGS to clone:\n',
    pageSize: 15,
  });

  if (!selectedOrgs.length) {
    return;
  }

  const allRepoToClone: Array<string> = [];

  for (const org of selectedOrgs) {
    const repos = await getAllReposByOrg({
      mapper: repo => ({
        checked: true,
        name: repo.name,
        value: wayToClone === 'SSH' ? repo.ssh_url : repo.clone_url,
      }),
      org,
      token: githubToken,
    });
    let filteredRepos: typeof repos = [];

    const matchBy = await input({
      message: `ORG "${org}": Filter repos that contain the following text (empty means it will show all repos):\n`,
    });

    if (matchBy) {
      const regex = new RegExp(matchBy, 'i');

      filteredRepos = repos.filter(repo => regex.test(repo.name));
    }

    const selectedRepos = await checkbox({
      choices: filteredRepos.length ? filteredRepos : repos,
      message: `Select the REPOS to clone from "${org}":\n`,
      pageSize: 15,
    });

    allRepoToClone.push(...selectedRepos);
  }

  for (const repo of allRepoToClone) {
    execSync(`git clone ${repo}`, { stdio: 'inherit' });
  }
};

await init();
