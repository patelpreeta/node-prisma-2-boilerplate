import { gql } from "apollo-server-express";

module.exports = gql`
  extend type Query {
    getAllUsers: [User!] @isAdmin
    dashboard: User!
  }

  type User {
    role: String!
    id: ID!
    name: String
    email: String!
    password: String!
    createdEvents: [Event]
    invitedEvents: [Guest]
  }

  extend type Mutation {
    register(input: RegisterInput!): RegisterResponse
    login(input: LoginInput): LoginResponse
    changePassword(newPassword: String!): RegisterResponse
    deleteUser(id: ID!): Boolean @isAdmin
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: String!
  }

  type RegisterResponse {
    id: ID!
    name: String!
    email: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type LoginResponse {
    id: ID!
    name: String!
    email: String!
    token: String!
  }
`;
