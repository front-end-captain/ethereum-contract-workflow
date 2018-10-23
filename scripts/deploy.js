const path = require("path");
const fs = require("fs-extra");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const Chalk = require("chalk");
const log = console.log;

// 准备 byteCode
const contractPath = path.resolve(__dirname, "../compiled/ProjectList.json");
const { interface, bytecode } = require(contractPath);

// 2. 配置 provider
const provider = new HDWalletProvider(
  "reflect vacuum stairs chair typical leaf squirrel later happy identify toe water",
  "https://rinkeby.infura.io/v3/4ca5fec194be42278869da6855d2aa9e",
);

const web3 = new Web3(provider);

(async () => {
  // 获取钱包中的账号
  const accounts = await web3.eth.getAccounts();
  log(Chalk.yellow("合约部署账户：", accounts[0]));

  console.time("合约部署耗时");
  const contract = new web3.eth.Contract(JSON.parse(interface));
  const transaction = contract.deploy({ data: bytecode });
  const result = await transaction.send({ from: accounts[0], gas: "5000000" });
  console.timeEnd("合约部署耗时");

  const contractAddress = result.options.address;

  console.log("合约部署成功:", contractAddress);
  console.log("合约查看地址:", `https://rinkeby.etherscan.io/address/${contractAddress}`);

  // 合约地址写入文件系统
  const addressFile = path.resolve(__dirname, "../address.json");
  fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
  console.log("地址写入成功:", addressFile);

  process.exit();
})();
