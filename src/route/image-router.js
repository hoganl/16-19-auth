'use strict';

import multer from 'multer';
import { Router } from 'express';
import HttpError from 'http-errors';
import bearerAuthMiddleWare from '../lib/bearer-auth-middleware';
import Image from '../model/image';
import { s3Upload, s3Remove } from '../lib/s3';

const multerUpload = multer({ dest: `${__dirname}/../temp` });

const imageRouter = new Router();

imageRouter.post('/images', bearerAuthMiddleWare, multerUpload.any(), (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(404, 'IMAGE ROUTER POST _ERROR_, not found'));
  }

  if (!request.body.title || request.files.length > 1 || request.files[0].fieldname !== 'image') {
    return next(new HttpError(400, 'IMAGE ROUTER POST _ERROR_, invalid request'));
  }

  const file = request.files[0];
  const key = `${file.filename}.${file.originalname}`;

  return s3Upload(file.path, key)
    .then((awsURL) => {
      return new Image({
        title: request.body.title,
        account: request.account._id,
        url: awsURL,
      }).save();
    })
    .then(image => response.json(image))
    .catch(next);
});

imageRouter.get('/images/:id', bearerAuthMiddleWare, (request, response, next) => {
  if (!request.params.id) {
    return next(new HttpError(400, 'IMAGE ROUTER GET _ERROR_, bad id'));
  }
  return Image.findById(request.params.id)
    .then((image) => {
      if (!image) {
        return next(new HttpError(404, 'IMAGE ROUTER GET _ERROR_, invalid request'));
      }
      return response.json(image);
    })
    .catch(next);
});

imageRouter.delete('/images/:id', bearerAuthMiddleWare, (request, response, next) => {
  return Image.findByIdAndRemove(request.params.id)
    .then((image) => {
      return s3Remove(image.url);
    })
    .then(() => {
      return response.sendStatus(204);
    })
    .catch(next);
});

export default imageRouter;
