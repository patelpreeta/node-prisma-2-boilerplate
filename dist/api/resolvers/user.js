"use strict";

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _apolloServerExpress = require("apollo-server-express");

var _context = _interopRequireDefault(require("../context"));

var _prismaClient = require("../../prismaClient");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("dotenv").config();

module.exports = {
  Query: {
    async getAllUsers(root, args, context) {
      return _prismaClient.prisma.users.findMany();
    },

    async dashboard(root, args, {
      req
    }) {
      const user = await (0, _context.default)(req.headers.authorization);

      if (!user) {
        throw new _apolloServerExpress.AuthenticationError("You need to be logged in!");
      }

      return _prismaClient.prisma.users.findUnique({
        where: {
          id: user.id
        }
      });
    }

  },
  Mutation: {
    async register(root, args, context) {
      const {
        name,
        email,
        password,
        role
      } = args.input;
      console.log({
        name,
        email,
        password
      });
      return _bcryptjs.default.hash(password, 10).then(hash => {
        return _prismaClient.prisma.users.create({
          data: {
            name,
            email,
            password: hash,
            role
          }
        }).catch(err => {
          throw new _apolloServerExpress.ApolloError(err);
        });
      });
    },

    async login(root, {
      input
    }, context) {
      const {
        email,
        password
      } = input;
      const user = await _prismaClient.prisma.users.findFirst({
        where: {
          email: email
        }
      });

      if (!user) {
        throw new _apolloServerExpress.ApolloError("No such User");
      }

      const isValidPassword = await _bcryptjs.default.compare(password, user.password);

      if (!isValidPassword) {
        throw new _apolloServerExpress.ApolloError("email or password is incorrect!");
      }

      if (user && isValidPassword) {
        const token = _jsonwebtoken.default.sign({
          id: user.id,
          role: user.role
        }, process.env.SECRET_KEY);

        return { ...user,
          token
        };
      }
    },

    async deleteUser(root, {
      id
    }, {
      req
    }) {
      const user = await (0, _context.default)(req.headers.authorization);
      const deletedUser = await _prismaClient.prisma.users.delete({
        where: {
          id: user.id
        }
      });

      if (deletedUser) {
        return true;
      }

      return false;
    },

    async changePassword(root, {
      newPassword
    }, {
      req
    }) {
      const user = await (0, _context.default)(req.headers.authorization);

      if (!user) {
        throw new _apolloServerExpress.AuthenticationError("You need to be logged in to be able to change password!");
      }

      return _bcryptjs.default.hash(newPassword, 10).then(async hash => {
        user.password = hash;
        const updatedUser = await _prismaClient.prisma.users.update({
          data: user,
          where: {
            id: user.id
          }
        });
        return updatedUser;
      });
    }

  },
  User: {
    async createdEvents(user) {
      return await _prismaClient.prisma.events.findMany({
        where: {
          userId: user.id
        }
      });
    },

    async invitedEvents(user) {
      const invitees = await _prismaClient.prisma.guests.findMany({
        where: {
          email: user.email
        }
      });
      return invitees;
    }

  }
};