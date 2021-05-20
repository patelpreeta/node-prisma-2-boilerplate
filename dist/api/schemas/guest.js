"use strict";

var _apolloServerExpress = require("apollo-server-express");

module.exports = (0, _apolloServerExpress.gql)`
  extend type Query {
    getAllGuests: Guest @isAdmin
  }

  extend type Mutation {
    createGuest(input: createGuestInput): createGuestResponse
  }

  type Guest {
    id: ID
    email: String!
    eventId: ID!
  }

  type GuestView {
    eventName: String!
    eventId: ID!
  }

  input createGuestInput {
    eventId: ID!
    email: String!
  }

  type createGuestResponse {
    id: ID
    email: String!
    eventId: ID!
  }
`;