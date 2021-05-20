import { gql } from "apollo-server-express";
import userSchema from "./user";
import eventSchema from "./event";
import guestScehma from "./guest";

const rootType = gql`
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

module.exports = [rootType, userSchema, eventSchema, guestScehma];
