const Router = require("koa-router");
const routes = require("./routes.js");

const router = new Router();

/**
 * 生成应用路由
 * @param {object} router 路由实例
 * @param {object} routes 路由信息
 */
const generateRouter = (router, routes) => {
  return Object.values(routes).forEach((route) => {
    router[route.method](route.path, route.handler);
  });
};

generateRouter(router, routes)

module.exports = router;
