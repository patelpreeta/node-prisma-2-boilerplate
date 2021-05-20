"use strict";

var _graphqlTools = require("graphql-tools");

var _graphql = require("graphql");

var _context = _interopRequireDefault(require("../context"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IsAdminDirective extends _graphqlTools.SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const {
      resolve = _graphql.defaultFieldResolver
    } = field;

    field.resolve = async (...args) => {
      let [_, {}, {
        req
      }] = args;
      console.log(req.headers.authorization);
      const user = await (0, _context.default)(req.headers.authorization);

      if (user && user.role !== "admin") {
        throw new _graphqlTools.AuthenticationError("This is way above your pay grade!");
      }

      return resolve.apply(this, args);
    };
  }

}

module.exports = IsAdminDirective;