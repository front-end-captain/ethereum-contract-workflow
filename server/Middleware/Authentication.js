const { checkToken } = require("./../Utils/Token.js");
const pathToRegexp = require("path-to-regexp");
const routes = require("./../Route/routes.js");

/**
 * 生成需要认证的路由所组成的数组，每一项为验证路由的正则
 * @param {object} routes 
 */
const createRegexpPathOfCheckPaths = (routes) => {
  let checkPaths = [];
  Object.values(routes).forEach((route) => {
    if (route.authentication) {
      checkPaths.push(route.path);
    }
  });
  
  const pathToRegexpOfCheckPaths = checkPaths.map((path) => {
    return pathToRegexp(path);
  });

  return pathToRegexpOfCheckPaths;
};

/**
 * 接口认证中间件 需要检查认证的路由见 /Route/routes.js
 */
const authentication = () => {
  const pathToRegexpOfCheckPaths = createRegexpPathOfCheckPaths(routes);
  return async (ctx, next) => {
    const { header: { authorization }, path } = ctx;

    let currentPathNeedToCheck = false;

    pathToRegexpOfCheckPaths.forEach((pathRegexp) => {
      if (pathRegexp.test(path)) {
        currentPathNeedToCheck = true;
      }
    });

    if (currentPathNeedToCheck) {
      const isTokenValidate = await checkToken(authorization);
      if (!isTokenValidate) {
        ctx.status = 401;
        ctx.body = { code: -1, message: "need authorization" };
        return;
      } else {
        await next();
      }
    } else {
      await next();
    }
  };
};

module.exports = authentication;
