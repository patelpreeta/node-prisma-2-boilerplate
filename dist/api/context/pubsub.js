"use strict";

var _apolloServerExpress = require("apollo-server-express");

const pubsub = new _apolloServerExpress.PubSub();
const pubsubTopics = {
  EVENT: "EVENT"
};
module.exports = {
  pubsub,
  pubsubTopics
};