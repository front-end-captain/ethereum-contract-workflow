const web3 = require("./web3.js");
const ProjectListJson = require("../compiled/ProjectList.json");
const address = require("./../address.json");

/**
 * 创建一个新的 「项目列表」合约实例对象
 * @return {object} 新的「项目列表」合约实例对象
 */
const createProjectListContractInstance = () => {
  return new web3.eth.Contract(JSON.parse(ProjectListJson.interface), address);
};

module.exports = { createProjectListContractInstance }
