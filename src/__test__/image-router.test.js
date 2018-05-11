'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateImageMock, pRemoveImageMock } from './lib/image-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('TESTING ROUTES AT /images', () => {
  beforeAll(startServer);
  afterEach(pRemoveImageMock);
  afterAll(stopServer);

  describe('POST', () => {
    test('POST /images should return 200 for successful image post', () => {
      // comment in the below if you have a slow computer AND need to make a real API call to S3
      jest.setTimeout(100000);
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.post(`${apiURL}/images`)
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'royal penguin')
            .attach('image', `${__dirname}/assets/royal_penguin.jpg`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.title).toEqual('royal penguin');
              expect(response.body._id).toBeTruthy();
              expect(response.body.url).toBeTruthy();
            });
        })
        .catch((response) => {
          expect(response.status).toEqual(200);
        });
    });

    test('POST /images should return a 400 status code for bad request', () => {
      return pCreateImageMock()
        .then(() => {
          return superagent.post(`${apiURL}/images`)
            .send({});
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(400);
        });
    });

    test('POST /images should return a 401 status for bad token', () => {
      return pCreateImageMock()
        .then(() => {
          return superagent.post(`${apiURL}/images`)
            .set('Authorization', 'Bearer ')
            .send({});
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(401);
        });
    });
  });

  describe('GET', () => {
    test('GET /images/:id should respond with 200 if there are no errors', () => {
      let imageToTest = null;
      return pCreateImageMock()
        .then((image) => {
          imageToTest = image;
          return superagent.get(`${apiURL}/images/${image.image._id}`)
            .set('Authorization', `Bearer ${image.accountMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual(imageToTest.image.title);
          expect(response.body.url).toEqual(imageToTest.image.url);
          expect(response.body._id).toBeTruthy();
        });
    });

    test('GET /images/:id should respond with 404 if there is no image found', () => {
      return superagent.get(`${apiURL}/image/BadId`)
        .then(Promise.reject)
        .catch((err) => {
          // console.log(err, 'get 404 error');
          expect(err.status).toEqual(404);
        });
    });

    test('GET /images/:id should respond with 401 status for bad token', () => {
      return pCreateImageMock()
        .then((image) => {
          return superagent.get(`${apiURL}/images/${image.image._id}`)
            .set('Authorization', 'Bearer ');
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(401);
        });
    });
  });

  describe('DELETE', () => {
    test('DELETE /images/:id should respond with 204 for successful deletion', () => {
      return pCreateImageMock()
        .then((mockImage) => {
          return superagent.delete(`${apiURL}/images/${mockImage.image._id}`)
            .set('Authorization', `Bearer ${mockImage.accountMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });

    test('DELETE /images/:id should respond with 404 due to no image found', () => {
      return superagent.delete(`${apiURL}/image/BadId`)
        .then(Promise.reject)
        .catch((err) => {
          // console.log(err, 'delete 404 error');
          expect(err.status).toEqual(404);
        });
    });

    test('DELETE /images/:id should return with 401 status for bad token', () => {
      return pCreateImageMock()
        .then((image) => {
          return superagent.delete(`${apiURL}/images/${image.image._id}`)
            .set('Authorization', 'Bearer ');
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(401);
        });
    });
  });
});
