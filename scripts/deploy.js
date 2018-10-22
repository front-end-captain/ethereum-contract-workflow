const path = require("path");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const Chalk = require("chalk");
const log = console.log;

// 准备 byteCode
const contractPath = path.resolve(__dirname, "../compiled/Car.json");
const { interface, bytecode } = require(contractPath);

// 2. 配置 provider
const provider = new HDWalletProvider(
  'reflect vacuum stairs chair typical leaf squirrel later happy identify toe water',
  'https://rinkeby.infura.io/v3/4ca5fec194be42278869da6855d2aa9e'
);

const web3 = new Web3(provider);

(async () => {

  // 获取钱包中的账号
  const accounts = await web3.eth.getAccounts();
  log(Chalk.yellow('部署合约的账户', accounts[0]));

  console.time("contract deploy");
  const contract = new web3.eth.Contract(JSON.parse(interface));
  const transaction = contract.deploy({ data: bytecode, arguments: ['BWM'] });
  const result = await transaction.send({ from: accounts[0], gas: 1000000 });
  console.timeEnd("contract deploy");

  log(Chalk.green("合约部署成功", result.options.address));
})()