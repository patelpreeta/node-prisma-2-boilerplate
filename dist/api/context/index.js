"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = verifyToken;

var _apolloServerExpress = require("apollo-server-express");

var _prismaClient = require("../../prismaClient");

const jwt = require("jsonwebtoken");

require("dotenv").config();

async function verifyToken(token) {
  try {
    if (!token) return null;
    const {
      id
    } = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await _prismaClient.prisma.users.findUnique({
      where: {
        id: id
      }
    });
    return user;
  } catch (err) {
    throw new _apolloServerExpress.AuthenticationError(err.message);
  }
}

;
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