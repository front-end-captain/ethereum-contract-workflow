import web3 from "./web3.js";
import ProjectJson from "./../compiled/Project.json";

/**
 * 创建一个新的 「项目合约」实例对象
 * @param  {string} address 合约地址
 * @return {object} 新的 「项目合约」实例对象
 */
const createProjectContractInstance = (address) => {
  return new web3.eth.Contract(JSON.parse(ProjectJson.interface), address);
};

export default createProjectContractInstance;
