"use strict";

var _pubsub = require("../context/pubsub");

var _apolloServerExpress = require("apollo-server-express");

var _sequelize = require("sequelize");

var _context = _interopRequireDefault(require("../context"));

var _prismaClient = require("../../prismaClient");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  Query: {
    async getEventById(root, {
      id
    }, context) {
      const event = _prismaClient.prisma.events.findUnique({
        where: {
          id: id
        }
      });

      return event;
    },

    async getAllEvents(root, {
      page,
      pageSize
    }, context) {
      return _prismaClient.prisma.events.count({
        take: pageSize || null,
        skip: (page - 1) * pageSize || 0
      });
    },

    async sortByDate(root, args, context) {
      return _prismaClient.prisma.events.count({
        orderBy: {
          createdAt: 'asc'
        }
      });
    },

    async getEventsByDate(root, {
      eventDate
    }, context) {
      return _prismaClient.prisma.events.findMany({
        where: {
          eventDate
        }
      });
    },

    async searchEvents(root, {
      eventName
    }, context) {
      return _prismaClient.prisma.events.findMany({
        where: {
          eventName: {
            contains: eventName
          }
        }
      });
    }

  },
  Mutation: {
    async createEvent(_, {
      eventName,
      eventDate
    }, {
      req
    }) {
      const user = await (0, _context.default)(req.headers.authorization);

      if (!user) {
        throw new _apolloServerExpress.AuthenticationError("You need to be logged in to create an event!");
      }

      const event = await _prismaClient.prisma.events.create({
        data: {
          userId: user.id,
          eventName: eventName,
          eventDate: eventDate
        }
      });

      _pubsub.pubsub.publish("EVENT", {
        event: {
          mutation: "CREATED",
          data: event
        }
      });

      return event;
    },

    async updateEvent(root, {
      input
    }, {
      req
    }) {
      const {
        eventName,
        id,
        eventDate
      } = input;
      const user = await (0, _context.default)(req.headers.authorization);

      if (!user) {
        throw new _apolloServerExpress.AuthenticationError("You are not logged in!");
      }

      const event = await _prismaClient.prisma.events.findUnique({
        where: {
          id: id
        }
      });

      if (event) {
        if (event.userId === user.id) {
          if (event) {
            if (eventName) {
              event.eventName = eventName;
            }

            if (eventDate) {
              event.eventDate = eventDate;
            }

            _pubsub.pubsub.publish("EVENT", {
              event: {
                mutation: "UPDATED",
                data: event
              }
            });

            const updatedEvent = await _prismaClient.prisma.events.update({
              data: event,
              where: {
                id: event.id
              }
            });
            return updatedEvent;
          } else {
            throw new _apolloServerExpress.ApolloError("ERROR");
          }
        } else {
          throw new _apolloServerExpress.AuthenticationError("Authorization error!");
        }
      } else {
        throw new _apolloServerExpress.ApolloError("No such events!");
      }
    },

    async deleteEvent(root, {
      id
    }, {
      req
    }) {
      console.log(id);
      const user = await (0, _context.default)(req.headers.authorization);

      if (!user) {
        throw new _apolloServerExpress.AuthenticationError("You are not logged in!");
      }

      const event = await _prismaClient.prisma.events.findUnique({
        where: {
          id
        }
      });

      if (!event) {
        return false;
      }

      _pubsub.pubsub.publish("EVENT", {
        event: {
          mutation: "DELETED",
          data: event
        }
      });

      return _prismaClient.prisma.events.delete({
        where: {
          id: event.id
        }
      });
    }

  },
  Subscription: {
    event: {
      subscribe: (0, _apolloServerExpress.withFilter)(() => _pubsub.pubsub.asyncIterator("EVENT"), (payload, args) => {
        //console.log(payload.event.data.dataValues.id);
        if (!args.id || payload.event.data.dataValues.id == args.id) {
          return true;
        }

        return false;
      })
    }
  },
  Event: {
    createdBy(event) {
      return event.getCreatedBy();
    }

  }
};