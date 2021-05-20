import { AuthenticationError } from "apollo-server-express";
import verifyToken from "../context";
import { prisma } from "../../prismaClient";
module.exports = {
  Mutation: {
    async createGuest(root, { input }, { req }) {
      const user = verifyToken(req.headers.authorization);
      const { email, eventId } = input;
      console.log({ email, eventId });
      const event = await prisma.events.findUnique({ where: { id: eventId } });
      if (!user && event.userId === user.id) {
        throw new AuthenticationError(
          "You are not authorized to create guest for this event!"
        );
      }
      return await prisma.guests.create({
        data: {
          eventId,
          userId: user.id,
          email,
        }
      });
    },
  },

  Query: {
    async getAllGuests(root, args, context) {
      return prisma.guests.findMany()
    },
  },
};
