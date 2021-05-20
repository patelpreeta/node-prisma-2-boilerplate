import { SchemaDirectiveVisitor, AuthenticationError } from "graphql-tools";
import { defaultFieldResolver } from "graphql";
import verifyToken from "../context";
class IsAdminDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
      let [_, {}, { req }] = args;
      console.log(req.headers.authorization);
      const user = await verifyToken(req.headers.authorization);
      if (user && user.role !== "admin") {
        throw new AuthenticationError("This is way above your pay grade!");
      }
      return resolve.apply(this, args);
    };
  }
}

module.exports = IsAdminDirective;
