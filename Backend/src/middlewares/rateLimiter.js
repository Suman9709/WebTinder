const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redishClient } = require("../config/redish");

const createRateLimiter = () => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redishClient.sendCommand(args),
    }),

    windowMs: 15* 60 * 1000,
    max: 100,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
  });
};

module.exports = { createRateLimiter };