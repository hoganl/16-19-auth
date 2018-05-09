'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateAccountMock } from './lib/account-mock';
import { pRemovePenguinMock, pCreatePenguinMock } from './lib/penguin-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('POST /penguins', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemovePenguinMock);

  test('POST /penguins should get a 200 and the newly created penguin', () => {
    let accountMock = null;
    return pCreateAccountMock()
      .then((accountSetMock) => {
        accountMock = accountSetMock;
        return superagent.post(`${apiURL}/penguins`)
          .set('Authorization', `Bearer ${accountSetMock.token}`)
          .send({
            name: 'Bob',
            species: 'Royal',
            colors: 'black, white, and orange',
            location: 'Antarctica',
          });
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.account).toEqual(accountMock.account._id.toString());
        expect(response.body.name).toEqual('Bob');
        expect(response.body.species).toEqual('Royal');
        expect(response.body.colors).toEqual('black, white, and orange');
        expect(response.body.location).toEqual('Antarctica');        
      });
  });

  test('POST /penguins should return a 400 status code for bad request', () => {
    return pCreateAccountMock()
      .then((accountSetMock) => {
        return superagent.post(`${apiURL}/penguins`)
          .set('Authorization', `Bearer ${accountSetMock.token}`)
          .send({});
      })
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST /penguins should return a 404 status code', () => {
    const penguinToPost = {
      name: 'Bob',
      species: 'Royal',
      colors: 'black, white, and orange',
      location: 'Antarctica',
    };
    return superagent.post(`${apiURL}/penguins/BadId`)
      .send(penguinToPost)
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });

  test('GET /penguins/:id should respond with 200 if there are no errors', () => {
    let penguinToTest = null;
    return pCreatePenguinMock()
      .then((penguin) => {
        penguinToTest = penguin;
        return superagent.get(`${apiURL}/penguins/${penguin.penguin._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.name).toEqual(penguinToTest.penguin.name);
        expect(response.body.species).toEqual(penguinToTest.penguin.species);
        expect(response.body.colors).toEqual(penguinToTest.penguin.colors);
        expect(response.body.location).toEqual(penguinToTest.penguin.location); 
        expect(response.body._id).toBeTruthy();
      });
  });

  // test('GET /penguins should return a 400 status code', () => {
  //   return pCreatePenguinMock()
  //     .then(() => {
  //       return superagent.get(`${apiURL}/penguins`);
  //     })
  //     .then(Promise.reject)
  //     .catch((err) => {
  //       expect(err.status).toEqual(400);
  //     });
  // });

  test('GET /penguins should respond with 404 is there is no penguin to be found', () => {
    return superagent.get(`${apiURL}/BadId`)
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});
