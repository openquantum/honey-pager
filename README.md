Fork from https://github.com/codeinbrain/honey-pager that uses Base64 instead of JWT.

<p align="center">
  <img src="https://github.com/codeinbrain/honey-pager/blob/master/docs/honeypager.png" width="700" title="HoneyPager">
</p>

<p align="center">
  <a href="https://travis-ci.org/codeinbrain/honey-pager"><img src="https://img.shields.io/travis/codeinbrain/honey-pager.svg" title="Travis (.org)"></a>
  <img src="https://img.shields.io/badge/status-experimental-orange.svg" title="Status">
</p>

A [Relay-style](https://facebook.github.io/relay/graphql/connections.htm) cursor pagination tool for [mongoose](https://github.com/Automattic/mongoose) schema. Designed to work with GraphQL.

## Quick view

```javascript
// User.js
import mongoose, { Schema } from 'mongoose';
import { honeypager } from 'honey-pager';

const schema = Schema({
  firstName:  { type: String },
  lastName:   { type: String },
  email:      { type: String }
});

schema.plugin(honeypager);

export default schema;
```

```javascript
// server.js
import express from 'express';
import User from './User';

let app = express();
// ...
app.get('/users', (req, res) => {
  const result = User.paginateResult();
  res.status(200).json(result);
});
```
This will gives you the following response:
```
{
  "totalCount": 10,
  "edges": [
    {
      "cursor": "...",
      "node": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "jdoe@test.com"
      }
    },
    ...
  ],
  "pageInfo": {
    "startCursor": "...",
    "endCursor": "...",
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Made with :heart: by [lobodart](https://github.com/lobodart).
