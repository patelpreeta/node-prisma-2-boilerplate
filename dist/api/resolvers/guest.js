"use strict";

var _apolloServerExpress = require("apollo-server-express");

var _context = _interopRequireDefault(require("../context"));

var _prismaClient = require("../../prismaClient");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  Mutation: {
    async createGuest(root, {
      input
    }, {
      req
    }) {
      const user = (0, _context.default)(req.headers.authorization);
      const {
        email,
        eventId
      } = input;
      console.log({
        email,
        eventId
      });
      const event = await _prismaClient.prisma.events.findUnique({
        where: {
          id: eventId
        }
      });

      if (!user && event.userId === user.id) {
        throw new _apolloServerExpress.AuthenticationError("You are not authorized to create guest for this event!");
      }

      return await _prismaClient.prisma.guests.create({
        data: {
          eventId,
          userId: user.id,
          email
        }
      });
    }

  },
  Query: {
    async getAllGuests(root, args, context) {
      return _prismaClient.prisma.guests.findMany();
    }

  }
};