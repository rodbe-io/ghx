import chalk from 'chalk';
import { fuzzySearch } from '@rodbe/fn-utils';
import { getReposByOrg } from '@rodbe/github-api';
import { select as select2 } from 'inquirer-select-pro';

import type { WAY_TO_CLONE } from '@/types';

interface GetOrgsReposProps {
  orgs: Array<{ name: string; value: string }>;
  token: string;
  wayToClone: WAY_TO_CLONE;
}

export const getOrgsRepos = async ({ orgs, token, wayToClone }: GetOrgsReposProps) => {
  const allReposToClone: Array<string> = [];

  const selectedOrgs = await select2({
    canToggleAll: true,
    loop: true,
    message: 'Select the ORGS to clone:',
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
    theme: {
      style: {
        renderSelectedOptions: () => '',
      },
    },
  });

  for (const org of selectedOrgs) {
    const repos = await getReposByOrg({
      mapper: repo => ({
        name: repo.name,
        value: wayToClone === 'SSH' ? repo.ssh_url : repo.clone_url,
      }),
      org,
      token,
    });

    const selectedRepos = await select2({
      canToggleAll: true,
      loop: true,

      message: `Select the REPOS to clone from "${String(chalk.black.bold.bgGreenBright(org))}":`,
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
      theme: {
        style: {
          renderSelectedOptions: () => '',
        },
      },
    });

    allReposToClone.push(...selectedRepos);
  }

  return { allReposToClone };
};
