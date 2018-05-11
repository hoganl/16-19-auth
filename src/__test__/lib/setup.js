'use strict';

import faker from 'faker';
import * as awsSDKMock from 'aws-sdk-mock';

awsSDKMock.mock('S3', 'upload', (params, callback) => {
  if (!params.Key || !params.Bucket || !params.Body || !params.ACL) {
    return callback(new Error('SETUP AWS MOCK ERROR UPLOAD: key, bucket, body, or ACL required'));
  }

  if (params.ACL !== 'public-read') {
    return callback(new Error('SETUP AWS MOCK ERROR UPLOAD: ACL should be public-read'));
  }

  if (params.Bucket !== process.env.AWS_BUCKET) {
    return callback(new Error('SETUP AWS MOCK ERROR UPLOAD: wrong bucket'));
  }

  return callback(null, { Location: faker.internet.url() });
});

awsSDKMock.mock('S3', 'deleteObject', (params, callback) => {
  if (!params.Key || !params.Bucket) {
    return callback(new Error('SETUP AWS MOCK ERROR DELETE: key and bucket required'));
  }

  if (params.Bucket !== process.env.AWS_BUCKET) {
    return callback(new Error('SETUP AWS MOCK ERROR DELETE: wrong bucket'));
  }

  return callback(null, {});
});
