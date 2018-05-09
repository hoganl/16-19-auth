'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}/signup`;

describe('AUTH Router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveAccountMock);

  test('POST should return a 200 status code and a TOKEN', () => {
    return superagent.post(apiURL)
      .send({
        username: 'trashpanda',
        email: 'trashpanda@hotmail.me',
        password: 'racoon',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      });
  });

  test('POST should return a 409 due to duplicate email', () => {
    return superagent.post(apiURL)
      .send({
        username: 'trashpanda',
        email: 'trashpanda@hotmail.me',
        password: 'racoon',
      })
      .then(() => {
        return superagent.post(apiURL) 
          .send({
            username: 'trashpanda',
            email: 'trashpanda@hotmail.me',
            password: 'racoon',
          });
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(409);
      });
  });

  test('POST should return a 400 due to lack of email', () => {
    return superagent.post(apiURL)
      .send({})
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });
});
