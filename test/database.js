import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') mongoose.set('debug', { shell: true });

export default {
  connect: () =>
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  disconnect: () => mongoose.disconnect(),
};
