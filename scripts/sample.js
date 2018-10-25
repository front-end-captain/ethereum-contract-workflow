// TODO: 往 ProjectList 合约中写入示例数据
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const ProjectListJson = require("../compiled/ProjectList.json");
const address = require("../address.json");

const web3 = new Web3(
  new HDWalletProvider(
    "reflect vacuum stairs chair typical leaf squirrel later happy identify toe water",
    "https://rinkeby.infura.io/v3/4ca5fec194be42278869da6855d2aa9e",
  ),
);
const contract = new web3.eth.Contract(JSON.parse(ProjectListJson.interface), address);

(async () => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts);

  const projects = [
    {
      description: "Ethereum DApp Tutorial",
      minInvest: web3.utils.toWei("0.001", "ether"),
      maxInvest: web3.utils.toWei("0.1", "ether"),
      goal: web3.utils.toWei("1", "ether"),
    },
  ];
  console.log(projects);

  const owner = accounts[0];
  const results = await Promise.all(
    projects.map((project) =>
      contract.methods
        .createProject(project.description, project.minInvest, project.maxInvest, project.goal)
        .send({ from: owner, gas: 1000000 }),
    ),
  );

  console.log(results);
})();
