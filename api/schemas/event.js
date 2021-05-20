import { gql } from "apollo-server-express";

module.exports = gql`
  extend type Query {
    getAllEvents(page: Int, pageSize: Int): [Event!] @isAdmin
    getEventById(id: ID!): Event! @isAdmin
    getEventsByDate(eventDate: String!): [Event!] @isAdmin
    sortByDate: [Event!]
    searchEvents(eventName: String!): [Event!]
  }

  extend type Mutation {
    createEvent(eventName: String!, eventDate: String!): createEventResponse
    updateEvent(input: updateEventInput): createEventResponse
    deleteEvent(id: ID!): Boolean
  }

  type EventView {
    eventName: String
    eventDate: String!
  }

  type Event {
    userId: ID!
    id: ID!
    eventName: String!
    eventDate: String!
    createdBy: User!
    invitedUsers: [Guest!]
    createdAt: String
  }

  type createEventResponse {
    userId: ID!
    id: ID!
    eventName: String!
    eventDate: String!
    createdAt: String!
  }

  input updateEventInput {
    eventName: String
    eventDate: String
    id: ID!
  }

  extend type Subscription {
    event(id: ID): subscriptionPayload!
  }

  type subscriptionPayload {
    mutation: String!
    data: Event!
  }
`;
