import base64url from 'base64-url';

export const validateCursor = (value) => {
  return new Promise((resolve, reject) => {
    try {
      const cursor = base64url.decode(value);
      resolve(cursor);
    } catch (error) {
      reject(new TypeError('Invalid cursor'));
    }
  });
};

export const generateCursor = (node) => {
  return base64url.encode(String(node._id));
};
