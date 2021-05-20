"use strict";

var _apolloServerExpress = require("apollo-server-express");

var _user = _interopRequireDefault(require("./user"));

var _event = _interopRequireDefault(require("./event"));

var _guest = _interopRequireDefault(require("./guest"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rootType = (0, _apolloServerExpress.gql)`
  directive @isAdmin on FIELD_DEFINITION
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }

  type Subscription {
    root: String
  }
`;
module.exports = [rootType, _user.default, _event.default, _guest.default];