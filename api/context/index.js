const jwt = require("jsonwebtoken");
import { AuthenticationError } from "apollo-server-express";
require("dotenv").config();
import { prisma } from '../../prismaClient'

export default async function verifyToken(token) {
  try {
    if (!token) return null;
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await prisma.users.findUnique({ where: { id: id } })
    return user;
  } catch (err) {
    throw new AuthenticationError(err.message);
  }
};

/*const user = async ({ req }) => {
  const token = (req.headers && req.headers.authorization) || "";
  const user = await verifyToken(token);
  return { user };
};*/

/*
module.exports = async ({ req }) => {
  const token = (req.headers && req.headers.authorization) || "";
  const user = await verifyToken(token);
  return { user };
};*/
