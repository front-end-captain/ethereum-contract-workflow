const Chalk = require("chalk");

const handleError = () => {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      console.log(Chalk.red(error));
      context.status = 500;
      context.body = { message: "server error", code: 500 };
    };
  };
};

module.exports = handleError;
