import web3 from "./web3.js";
import ProjectListJson from "../compiled/ProjectList.json";
import address from "./../address.json";

/**
 * 创建一个新的 「项目列表」合约实例对象
 * @return {object} 新的「项目列表」合约实例对象
 */
const createProjectListContractInstance = () => {
  return new web3.eth.Contract(JSON.parse(ProjectListJson.interface), address);
};

export default createProjectListContractInstance;
export { createProjectListContractInstance }
