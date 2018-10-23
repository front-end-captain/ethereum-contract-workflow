import web3 from "./web3.js";
import ProjectJson from "./../compiled/Project.json";

const getContract = (address) => {
  return new web3.eth.Contract(JSON.parse(ProjectJson.interface), address);
};

export default getContract;
