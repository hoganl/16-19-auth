'use strict';

import faker from 'faker';
import Penguin from '../../model/penguin';
import { pCreateAccountMock, pRemoveAccountMock } from './account-mock';

const pCreatePenguinMock = () => {
  const resultMock = {};

  return pCreateAccountMock()
    .then((accountSetMock) => {
      resultMock.accountSetMock = accountSetMock;

      return new Penguin({
        name: faker.name.firstName(),
        species: faker.lorem.words(2),
        colors: faker.lorem.words(3),
        location: faker.lorem.words(2),
        account: accountSetMock.account._id,
      }).save();
    })
    .then((penguin) => {
      resultMock.penguin = penguin;
      return resultMock;
    });
};

const pRemovePenguinMock = () => {
  return Promise.all([
    Penguin.remove({}),
    pRemoveAccountMock(),
  ]);
};

export { pCreatePenguinMock, pRemovePenguinMock };
