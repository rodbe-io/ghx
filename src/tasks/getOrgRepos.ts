import { fuzzySearch } from '@rodbe/fn-utils';
import { getReposByOrg } from '@rodbe/github-api';
import { select as select2 } from 'inquirer-select-pro';
import chalk from 'chalk';

interface GetOrgsReposProps {
  orgs: Array<{ name: string; value: string }>;
  token: string;
  wayToClone: string;
}

export const getOrgsRepos = async ({ orgs, token, wayToClone }: GetOrgsReposProps) => {
  const allReposToClone: Array<string> = [];

  const selectedOrgs = await select2({
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      message: `Select the REPOS to clone from "${String(chalk.black.bold.bgGreenBright(org))}":\n`,
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
