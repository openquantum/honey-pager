import base64url from 'base64-url';

export const validateCursor = (value) => {
  try {
    return base64url.decode(value);
  } catch (error) {
    throw new TypeError('Invalid cursor');
  }
};

export const generateCursor = (node) => {
  return base64url.encode(String(node._id));
};
