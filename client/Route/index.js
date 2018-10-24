if (process.env.NODE_ENV === "production") {
  module.exports = require("./Route.prod.jsx");
} else {
  module.exports = require("./Route.dev.jsx");
}
