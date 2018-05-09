'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import HttpErrors from 'http-errors';
import Account from '../model/account';
import logger from '../lib/logger';
import basicAuthMiddleware from '../lib/basic-auth-middleware';

const authRouter = new Router();
const jsonParser = json();

authRouter.post('/signup', jsonParser, (request, response, next) => {
  if (!request.body.email) {
    logger.log(logger.ERROR, 'Responding with a 400 error code');
    return next(new HttpErrors(400, 'Account email is required'));
  }
  return Account.create(request.body.username, request.body.email, request.body.password)
    .then((account) => {
      delete request.body.password;
      logger.log(logger.INFO, 'AUTH - creating TOKEN');
      return account.pCreateToken();
    })
    .then((token) => {
      logger.log(logger.INFO, 'AUTH - returning a 200 code and a token');
      return response.json({ token });
    })
    .catch(next);
});

authRouter.get('/login', basicAuthMiddleware, (request, response, next) => {
  if (!request.account) {
    return next(new HttpErrors(400, 'AUTH - invalid request'));
  }

  return request.account.pCreateToken()
    .then((token) => {
      logger.log(logger.INFO, 'LOGIN - responding with a 200 status and a Token');
      return response.json({ token });
    })
    .catch(next);
});

export default authRouter;
