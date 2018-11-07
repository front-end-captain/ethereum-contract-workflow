const project = require("./../Controller/Project.js");
const user = require("./../Controller/User.js");

const routes = {
  projects: {
    method: "get",
    path: "/projects",
    authentication: true,
    handler: project.projectsList,
  },
  projectDetail: {
    method: "get",
    path: "/projects/:address",
    authentication: true,
    handler: project.projectDetail,
  },
  nonce: {
    method: "get",
    path: "/user/nonce/:publicAddress",
    authentication: false,
    handler: user.getNonce,
  },
  auth: {
    method: "post",
    path: "/user/auth",
    authentication: false,
    handler: user.auth,
  },
  register: {
    method: "post",
    path: "/user/register",
    authentication: false,
    handler: user.register,
  },
};

module.exports = routes;
