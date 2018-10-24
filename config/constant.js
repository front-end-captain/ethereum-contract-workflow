const path = require("path");
const fs = require("fs");

// 源代码根目录
const SRC_PATH = path.resolve("./client");

// 打包后文件的存放目录
const BUILD_PATH = path.resolve("./build");

const ASSETS_PATH = "/assets/";

const ROOT_PATH = fs.realpathSync(process.cwd());

module.exports = {
  SRC_PATH,
  BUILD_PATH,
  ASSETS_PATH,
  ROOT_PATH,
};
