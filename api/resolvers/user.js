import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticationError, ApolloError } from "apollo-server-express";
import verifyToken from "../context";
import { prisma } from '../../prismaClient'
require("dotenv").config();
module.exports = {
  Query: {
    async getAllUsers(root, args, context) {
      return prisma.users.findMany()
    },

    async dashboard(root, args, { req }) {
      const user = await verifyToken(req.headers.authorization);
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      return prisma.users.findUnique({ where: { id: user.id } });
    },
  },

  Mutation: {
    async register(root, args, context) {
      const { name, email, password, role } = args.input;
      console.log({ name, email, password });
      return bcrypt.hash(password, 10).then((hash) => {
        return prisma.users.create({
          data: {
            name,
            email,
            password: hash,
            role,
          }
        }).catch((err) => {
          throw new ApolloError(err);
        });
      });
    },

    async login(root, { input }, context) {
      const { email, password } = input;
      const user = await prisma.users.findFirst({ where: { email: email } })
      if (!user) {
        throw new ApolloError("No such User");
      }
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new ApolloError("email or password is incorrect!");
      }
      if (user && isValidPassword) {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.SECRET_KEY
        );
        return { ...user, token };
      }
    },
    async deleteUser(root, { id }, { req }) {
      const user = await verifyToken(req.headers.authorization);
      const deletedUser = await prisma.users.delete({ where: { id: user.id } })
      if (deletedUser) {
        return true
      }
      return false
    },

    async changePassword(root, { newPassword }, { req }) {
      const user = await verifyToken(req.headers.authorization);
      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to be able to change password!"
        );
      }
      return bcrypt.hash(newPassword, 10).then(async (hash) => {
        user.password = hash;
        const updatedUser = await prisma.users.update({ data: user, where: { id: user.id } })
        return updatedUser
      });
    },
  },

  User: {
    async createdEvents(user) {
      return await prisma.events.findMany({
        where: {
          userId: user.id,
        },
      });
    },
    async invitedEvents(user) {
      const invitees = await prisma.guests.findMany({
        where: {
          email: user.email
        },
      });
      return invitees;
    },
  },
};
