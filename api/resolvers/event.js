import { pubsub } from "../context/pubsub";
import {
  AuthenticationError,
  ApolloError,
  withFilter,
} from "apollo-server-express";
import { Op } from "sequelize";
import verifyToken from "../context";
import { prisma } from '../../prismaClient'

module.exports = {
  Query: {
    async getEventById(root, { id }, context) {
      const event = prisma.events.findUnique({ where: { id: id } });
      return event;
    },

    async getAllEvents(root, { page, pageSize }, context) {
      return prisma.events.count({
        take: pageSize || null,
        skip: (page - 1) * pageSize || 0,
      })
    },

    async sortByDate(root, args, context) {
      return prisma.events.count({
        orderBy: {
          createdAt: 'asc'
        }
      })
    },

    async getEventsByDate(root, { eventDate }, context) {
      return prisma.events.findMany({ where: { eventDate } });
    },

    async searchEvents(root, { eventName }, context) {
      return prisma.events.findMany({
        where: {
          eventName: {
            contains: eventName,
          },
        },
      });
    },
  },

  Mutation: {
    async createEvent(_, { eventName, eventDate }, { req }) {
      const user = await verifyToken(req.headers.authorization);
      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to create an event!"
        );
      }
      const event = await prisma.events.create({
        data: {
          userId: user.id,
          eventName: eventName,
          eventDate: eventDate
        }
      })

      pubsub.publish("EVENT", {
        event: {
          mutation: "CREATED",
          data: event,
        },
      });

      return event;
    },

    async updateEvent(root, { input }, { req }) {
      const { eventName, id, eventDate } = input;
      const user = await verifyToken(req.headers.authorization);
      if (!user) {
        throw new AuthenticationError("You are not logged in!");
      }

      const event = await prisma.events.findUnique({ where: { id: id } })
      if (event) {
        if (event.userId === user.id) {
          if (event) {
            if (eventName) {
              event.eventName = eventName;
            }
            if (eventDate) {
              event.eventDate = eventDate;
            }
            pubsub.publish("EVENT", {
              event: {
                mutation: "UPDATED",
                data: event,
              },
            });

            const updatedEvent = await prisma.events.update({
              data: event,
              where: {
                id: event.id
              }
            })
            return updatedEvent
          } else {
            throw new ApolloError("ERROR");
          }
        } else {
          throw new AuthenticationError("Authorization error!");
        }
      } else {
        throw new ApolloError("No such events!");
      }
    },

    async deleteEvent(root, { id }, { req }) {
      console.log(id);
      const user = await verifyToken(req.headers.authorization);
      if (!user) {
        throw new AuthenticationError("You are not logged in!");
      }

      const event = await prisma.events.findUnique({
        where: { id },
      })

      if (!event) {
        return false;
      }
      pubsub.publish("EVENT", {
        event: {
          mutation: "DELETED",
          data: event,
        },
      });
      return prisma.events.delete(
        { where: { id: event.id } }
      )
    },
  },

  Subscription: {
    event: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("EVENT"),
        (payload, args) => {
          //console.log(payload.event.data.dataValues.id);
          if (!args.id || payload.event.data.dataValues.id == args.id) {
            return true;
          }
          return false;
        }
      ),
    },
  },

  Event: {
    createdBy(event) {
      return event.getCreatedBy();
    },
  },
};
