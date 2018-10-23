import web3 from "./web3.js";
import ProjectListJson from "../compiled/ProjectList.json";
import address from "./../address.json";

const contract = new web3.eth.Contract(JSON.parse(ProjectListJson.interface), address);

export default contract;
