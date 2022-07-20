import { Schema, model } from 'mongoose';
import { honeypager } from '../';

const schema = Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  isAdmin: {
    type: Boolean
  },
  age: {
    type: Number
  }
}, {
  versionKey: false,
  timestamps: true
});

schema.plugin(honeypager);

export default model('User', schema);
