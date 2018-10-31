const Koa = require("koa");
const KoaBody = require("koa-body");
const Logger = require("koa-morgan");
const Cors = require("koa-cors");
const Chalk = require("chalk");
const HandleErrorMiddleware = require("./Middleware/HandleError.js");
const router = require("./Route/index.js");

const PORT = 3000;
const HOST = "127.0.0.1";
const app = new Koa();

app
  .use(Logger('":method :url" :status :res[content-length] ":referrer" ":user-agent"'))
  .use(KoaBody())
  .use(HandleErrorMiddleware())
  .use(Cors())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(PORT, () => {
  console.log(Chalk.red(`The server is listen at ${HOST}:${PORT}`));
});

module.exports = app;
