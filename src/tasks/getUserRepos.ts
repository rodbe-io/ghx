import { select as multiSelect2 } from 'inquirer-select-pro';

import { fuzzySearch } from '@rodbe/fn-utils';
import { getReposByUser } from '@rodbe/github-api';
import type { WAY_TO_CLONE } from '@/types';

interface GetUserReposProps {
  token: string;
  wayToClone: WAY_TO_CLONE;
}

export const getUserRepos = async ({ token, wayToClone }: GetUserReposProps) => {
  const userRepos = await getReposByUser({
    mapper: (repo) => ({
      name: repo.name,
      value: wayToClone === 'SSH' ? repo.ssh_url : repo.clone_url,
    }),
    token,
  });

  const allReposToClone = await multiSelect2({
    canToggleAll: true,
    loop: true,
    message: `Select the REPOS to clone:`,
    options: (input = '') => {
      if (!input) {
        return userRepos;
      }

      return fuzzySearch({
        items: userRepos,
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

  return {
    allReposToClone,
  };
};
