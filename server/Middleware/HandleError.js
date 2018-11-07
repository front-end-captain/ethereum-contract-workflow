const Chalk = require("chalk");
const { Log } = require("./../Model/index.js");

const handleError = () => {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      console.log(Chalk.red(error));
      const log = new Log({
        type: 2,
        description: "server error",
        log: error.message || "server error",
      });
      await log.save();
      context.status = 500;
      context.body = { message: "server error", code: 500 };
    };
  };
};

module.exports = handleError;
