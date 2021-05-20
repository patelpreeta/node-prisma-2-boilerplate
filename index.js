import express from "express";
import cors from "cors";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import typeDefs from "./api/schemas";
import resolvers from "./api/resolvers";
import http from "http";
import verifyToken from "./api/context";
import IsAdminDirective from "./api/directives/isAdmin";
const app = express();
const port = process.env.PORT;

app.use(cors());
app.get("/", (req, res) => res.send("Welcome to the Babel World!"));
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req }),
  subscriptions: {
    onConnect: async (connectionParams, ws) => {
      const user = await verifyToken(connectionParams.Authorization);
      if (!user && user.role !== "admin") {
        throw new AuthenticationError("Unauthorized Access!");
      }
      console.log("Web Socket Connected!");
    },
    onDisconnect: () => console.log("Web Socker Disconnected!"),
  },
  schemaDirectives: {
    isAdmin: IsAdminDirective,
  },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port }, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});
