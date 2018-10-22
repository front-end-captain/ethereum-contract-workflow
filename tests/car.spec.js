// TODO: 合约部署时传入的 brand 属性被正确的存储
// TODO: 调用 setBrand 时确保 brand 属性被正确的更新

const path = require("path");
const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-cli");

// 准备好 bytecode
const contractPath = path.resolve(__dirname, "../compiled/Car.json");
const { interface, bytecode } = require(contractPath);

// 可以看到我们没有提供任何跟账户有关的参数，比如钱包助记词或者公钥私钥之类的信息
// 这是因为 ganache-cli 的 provider 自己在内部管理了一些账户
const web3 = new Web3(ganache.provider());

let accounts;
let result;
let initialBrand = "AUDI";

describe("contract", () => {
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    console.log("合约部署账户", accounts[0]);

    const contract = new web3.eth.Contract(JSON.parse(interface));
    const transaction = contract.deploy({ data: bytecode, arguments: [initialBrand] });
    result = await transaction.send({ from: accounts[0], gas: 1000000 });
    console.log("合约部署成功", result.options.address);
  });

  it("deploy a contract", () => {
    assert.ok(result.options.address);
  });

  it("has initialBrand", async () => {
    const brand = await result.methods.brand().call();
    assert.equal(brand, initialBrand);
  });

  it("update the brand", async () => {
    const newBrand = "BWM";
    await result. methods.setBrand(newBrand).send({ from: accounts[0] });
    const brand = await result.methods.brand().call();
    assert.equal(brand, newBrand);
  })
})