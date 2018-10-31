const path = require("path");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const assert = require("assert");
const BigNumber = require("bignumber.js");
const { convertEtherToWei } = require("./../libs/utils.js");

const web3 = new Web3(ganache.provider());
const ProjectJson = require(path.resolve(__dirname, "../compiled/Project.json"));
const ProjectListJson = require(path.resolve(__dirname, "../compiled/ProjectList.json"));

const projectDescription = "Ethereum App Tutorial";
// 最大投资金额 10 eth
const MAX_INVEST = convertEtherToWei("10");
// 最小投资金额 0.01 eth
const MIN_INVEST = convertEtherToWei("0.01");
// 目标融资金额 100 eth
const GOAL = convertEtherToWei("100");
let accounts;
let projectList;
let project;

describe("Project contract", () => {
  // 每次跑单元测试都部署全新的合约实例，起到隔离的作用
  beforeEach(async () => {
    // TODO: 拿到 ganache 本地测试网络的账号
    accounts = await web3.eth.getAccounts();

    // TODO: 部署 ProjectList 合约
    const ProjectListContractInstance = new web3.eth.Contract(
      JSON.parse(ProjectListJson.interface),
    );
    const ProjectListTransaction = ProjectListContractInstance.deploy({
      data: ProjectListJson.bytecode,
    });
    projectList = await ProjectListTransaction.send({ from: accounts[0], gas: 5000000 });

    // TODO: 调用 ProjectList 的 createProject 方法 创建 Project 合约实例
    // NOTE: 这里设置了项目初始的投资上下限和目标融资总金额 在后续的单元测试中投资、支出不可以超出这些设置，否则会将交易回滚
    await projectList.methods
      .createProject(projectDescription, MIN_INVEST, MAX_INVEST, GOAL)
      .send({ from: accounts[0], gas: 1000000 });

    // TODO: 获取上面创建的 project 合约实例的地址
    const [address] = await projectList.methods.getProjects().call();

    // TODO: 生成可用的 project 合约对象
    project = new web3.eth.Contract(JSON.parse(ProjectJson.interface), address);
  });

  it("should be deploy projectList and project", () => {
    assert.ok(projectList.options.address);
    assert.ok(project.options.address);
  });

  it("should be save correct project properties", async () => {
    const description = await project.methods.description().call();
    const owner = await project.methods.owner().call();
    const minInvest = await project.methods.minInvest().call();
    const maxInvest = await project.methods.maxInvest().call();
    const goal = await project.methods.goal().call();

    assert.equal(owner, accounts[0]);
    assert.equal(description, projectDescription);
    assert.equal(minInvest, MIN_INVEST);
    assert.equal(maxInvest, MAX_INVEST);
    assert.equal(goal, GOAL);
  });

  it("should allow investor contribute", async () => {
    const investor = accounts[0];
    // NOTE: 这里投资金额应该小于等于 MAX_INVEST
    const investValue = convertEtherToWei("5");
    await project.methods.contribute().send({
      from: investor,
      value: investValue,
    });
    const amount = await project.methods.investors(investor).call();
    const minInvest = await project.methods.minInvest().call();
    const maxInvest = await project.methods.maxInvest().call();
    const goal = await project.methods.goal().call();
    assert.equal(Number(amount), Number(investValue));
    assert.ok(Number(investValue) <= Number(maxInvest));
    assert.ok(Number(investValue) >= Number(minInvest));
    assert.ok(Number(investValue) <= Number(goal));
  });

  it("should require minInvest", async () => {
    try {
      const investor = accounts[0];
      await project.methods.contribute().send({
        from: investor,
        value: 10,
      });
      assert.ok(false);
    } catch (error) {
      assert.ok(error);
    }
  });

  it("should require maxInvest", async () => {
    try {
      const investor = accounts[0];
      await project.methods.contribute().send({
        from: investor,
        value: 100000,
      });
      assert.ok(false);
    } catch (error) {
      assert.ok(error);
    }
  });

  it("should allow owner to create payment", async () => {
    const owner = accounts[0];
    const receiver = accounts[2];
    const expenditure = convertEtherToWei("1");

    await project.methods.createPayment("Rent Office", expenditure, receiver).send({
      from: owner,
      gas: 1000000,
    });

    const payment = await project.methods.payments(0).call();
    assert.equal(payment.description, "Rent Office");
    assert.equal(payment.amount, expenditure);
    assert.equal(payment.receiver, receiver);
    assert.equal(payment.completed, false);
    assert.equal(payment.voterCount, 0);
  });

  it("should allow investor approve payment", async () => {
    const owner = accounts[0];
    const investor = accounts[1];
    const receiver = accounts[2];
    const expenditure = convertEtherToWei("1");
    const investValue = convertEtherToWei("0.1");

    const prevBalance = new BigNumber(await web3.eth.getBalance(receiver));

    await project.methods.contribute().send({
      from: investor,
      value: investValue,
      gas: 1000000,
    });

    await project.methods.createPayment("Rent office", expenditure, receiver).send({
      from: owner,
      gas: 1000000,
    });

    await project.methods.approvePayment(0).send({
      from: investor,
      gas: 1000000,
    });

    await project.methods.finishPayment(0).send({
      from: owner,
      gas: 1000000,
    });

    const payment = await project.methods.payments(0).call();
    assert.equal(payment.completed, true);
    assert.equal(payment.voterCount, 1);

    const nextBalance = new BigNumber(await web3.eth.getBalance(receiver));
    const diffBalance = nextBalance.minus(prevBalance);

    assert.equal(diffBalance, expenditure);
  });
});
