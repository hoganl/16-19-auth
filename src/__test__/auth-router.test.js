'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveAccountMock, pCreateAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('AUTH Router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveAccountMock);

  test('POST should return a 200 status code and a TOKEN', () => {
    return superagent.post(`${apiURL}/signup`)
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
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: 'trashpanda',
        email: 'trashpanda@hotmail.me',
        password: 'racoon',
      })
      .then(() => {
        return superagent.post(`${apiURL}/signup`) 
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
    return superagent.post(`${apiURL}/signup`)
      .send({})
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  describe('GET /login', () => {
    test('GET /login should get a 200 status code and a TOKEN', () => {
      return pCreateAccountMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/login`)
            .auth(mock.request.username, mock.request.password); 
          // This line is where we are actually making a request with a username and password
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        });
    });

    test('GET should return a 400 status code', () => {
      return pCreateAccountMock()
        .then(() => {
          return superagent.get(`${apiURL}/login`);
        })      
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(400);
        });
    });

    test('GET should return a 404 status code', () => {
      return superagent.get(`${apiURL}/login/BadId`)
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });
  });
});
