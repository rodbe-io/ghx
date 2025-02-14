#!/usr/bin/env node
import { env } from 'node:process';
import { execSync } from 'node:child_process';

import select from '@inquirer/select';
import { select as multiSelect2 } from 'inquirer-select-pro';
import { getAllReposByOrg, getOrgs } from '@rodbe/github-api';
import { checkUpdates } from '@rodbe/check-updates';
import { fuzzySearch } from '@rodbe/fn-utils';

import { initEvents } from '@/events';
import { DAY_IN_MS, WEEK_IN_MS } from '@/constants';
import { getPkgJsonPath } from '@/helpers/ghx';

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

  const wayToClone = await select({
    choices: [
      { name: 'SSH', value: 'SSH' },
      { name: 'HTTPS', value: 'HTTPS' },
    ],
    default: 'SSH',
    message: 'How do you want to clone the repos?\n',
  });

  const orgs = await getOrgs({ mapper: org => ({ name: org.login, value: org.login }), token: githubToken });

  const selectedOrgs = await multiSelect2({
    canToggleAll: true,
    loop: true,
    message: 'Select the ORGS to clone:\n',
    options: (input = '') => {
      if (!input) {
        return orgs;
      }

      return fuzzySearch({
        items: orgs,
        key: 'name',
        searchText: input,
      });
    },
    pageSize: 15,
    selectFocusedOnSubmit: true,
  });

  if (!selectedOrgs.length) {
    return;
  }

  const allRepoToClone: Array<string> = [];

  for (const org of selectedOrgs) {
    const repos = await getAllReposByOrg({
      mapper: repo => ({
        name: repo.name,
        value: wayToClone === 'SSH' ? repo.ssh_url : repo.clone_url,
      }),
      org,
      token: githubToken,
    });

    const selectedRepos = await multiSelect2({
      canToggleAll: true,
      loop: true,
      message: `Select the REPOS to clone from "${org}":\n`,
      options: (input = '') => {
        if (!input) {
          return repos;
        }

        return fuzzySearch({
          items: repos,
          key: 'name',
          searchText: input,
        });
      },
      pageSize: 15,
      selectFocusedOnSubmit: true,
    });

    allRepoToClone.push(...selectedRepos);
  }

  for (const repo of allRepoToClone) {
    execSync(`git clone ${repo}`, { stdio: 'inherit' });
  }
};

await init();
