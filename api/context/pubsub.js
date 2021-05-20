import { PubSub } from "apollo-server-express";

const pubsub = new PubSub();

const pubsubTopics = { EVENT: "EVENT" };

module.exports = { pubsub, pubsubTopics };
