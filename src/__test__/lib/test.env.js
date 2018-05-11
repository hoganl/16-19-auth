process.env.NODE_env = 'development';
process.env.PORT = 7000;
process.env.MONGODB_URI = 'mongodb://localhost/testing';
process.env.PENGUIN_PIC_SECRET = 'HynUc0hndJu1i0FjnUM9976KLMXHCffSXDYST9BYGhfIFjFvSJxeMXfRbyblMQpfStx5gXZew3r2YX1kmCay2NNpR2mM4ujzsZoq';

// false hits your real AWS Keys, true will use fake AWS Keys
const isAwsMock = true;

if (isAwsMock) {
  process.env.AWS_BUCKET = 'fake';
  process.env.AWS_SECRET_ACCESS_KEY = 'fakermcfakerstuff6516515166';
  process.env.AWS_ACCESS_KEY_ID = 'morefakermcfakerstuff165419498';
  require('./setup');
} else {
  require('dotenv').config();
}
