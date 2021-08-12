import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');

export default {
  connect: () =>
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  disconnect: () => mongoose.disconnect(),
};
