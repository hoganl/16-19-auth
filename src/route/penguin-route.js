'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import HttpErrors from 'http-errors';
import Penguin from '../model/penguin';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import logger from '../lib/logger';

const jsonParser = json();
const penguinRouter = new Router();

penguinRouter.post('/penguins', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.account) {
    return next(new HttpErrors(400, 'AUTH - invalid request'));
  }
  return new Penguin({
    ...request.body,
    account: request.account._id,
  })
    .save()
    .then((penguin) => {
      logger.log(logger.INFO, 'Returning 200 and a new Penguin');
      return response.json(penguin);
    })
    .catch(next);
});

penguinRouter.get('/penguins/:id', (request, response, next) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'GET - responding with 400 status code - no id provided');
    return next(new HttpErrors(400, 'GET - invalid request'));
  }
  return Penguin.findById(request.params.id)
    .then((penguin) => {
      if (!penguin) {
        logger.log(logger.INFO, 'GET - responding with a 404 status code - (!penguin');
        return next(new HttpErrors(404, 'AUTH - bad id'));
      }
      logger.log(logger.INFO, 'Returning 200 and a new Penguin');
      return response.json(penguin);
    })
    .catch(next);
});

export default penguinRouter;
