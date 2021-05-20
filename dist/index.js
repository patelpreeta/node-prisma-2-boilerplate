"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _apolloServerExpress = require("apollo-server-express");

var _schemas = _interopRequireDefault(require("./api/schemas"));

var _resolvers = _interopRequireDefault(require("./api/resolvers"));

var _http = _interopRequireDefault(require("http"));

var _context = _interopRequireDefault(require("./api/context"));

var _isAdmin = _interopRequireDefault(require("./api/directives/isAdmin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
const port = process.env.PORT;
app.use((0, _cors.default)());
app.get("/", (req, res) => res.send("Welcome to the Babel World!"));
const server = new _apolloServerExpress.ApolloServer({
  typeDefs: _schemas.default,
  resolvers: _resolvers.default,
  context: ({
    req,
    res
  }) => ({
    req
  }),
  subscriptions: {
    onConnect: async (connectionParams, ws) => {
      const user = await (0, _context.default)(connectionParams.Authorization);

      if (!user && user.role !== "admin") {
        throw new _apolloServerExpress.AuthenticationError("Unauthorized Access!");
      }

      console.log("Web Socket Connected!");
    },
    onDisconnect: () => console.log("Web Socker Disconnected!")
  },
  schemaDirectives: {
    isAdmin: _isAdmin.default
  }
});
server.applyMiddleware({
  app
});

const httpServer = _http.default.createServer(app);

server.installSubscriptionHandlers(httpServer);
httpServer.listen({
  port
}, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});