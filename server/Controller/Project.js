const web3 = require("./../../libs/web3.js");
const { createProjectListContractInstance } = require("./../../libs/projectList.js");
const { createProjectContractInstance } = require("./../../libs/project.js");
const { convertEtherToWei } = require("./../../libs/utils.js");

class Project {
  constructor() {
    Project.projectListContractInstance = createProjectListContractInstance();
  }

  async projectsList(ctx) {
    const addressList = await Project.projectListContractInstance.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map((address) => {
        return createProjectContractInstance(address)
          .methods.getSummary()
          .call();
      }),
    );
    const projectsList = addressList.map((address, index) => {
      const [
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner,
      ] = Object.values(summaryList[index]);
      return {
        address,
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner,
      };
    });
    ctx.body = { status: 1, message: "success", data: projectsList };
  }

  async projectDetail(ctx) {
    const { address } = ctx.params;
    if (!web3.utils.isAddress(address)) {
      ctx.body = { status: -1, message: "the project address is invalid", data: null };
      return;
    }
    const projectContractInstance = createProjectContractInstance(address);
    const summary = await projectContractInstance.methods.getSummary().call();

    const [
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
    ] = Object.values(summary);
    const tasks = [];
    for (let i = 0; i < paymentCount; i++) {
      tasks.push(projectContractInstance.methods.payments(i).call());
    }
    const payments = await Promise.all(tasks);
    const projectDetail = {
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
      payments,
    };
    ctx.body = { status: 1, message: "success", data: projectDetail };
  }

  // creator description, minInvest, maxInvest, goal
  async createProject(ctx) {
    const { body } = ctx.request;
    let { creator, description, minInvest, maxInvest, goal } = body;
    if (!creator || !description || !minInvest || !maxInvest || !goal) {
      ctx.body = { status: -1, message: "the params is missing value" };
      return;
    }

    if (!web3.utils.isAddress(creator)) {
      ctx.body = { status: -1, message: "the creator address is invalid" };
      return;
    }

    minInvest = convertEtherToWei(minInvest);
    maxInvest = convertEtherToWei(maxInvest);
    goal = convertEtherToWei(goal);

    let result = null;
    try {
      result = await Project.projectListContractInstance.methods
        .createProject(description, minInvest, maxInvest, goal)
        .send({ from: creator, gas: 5000000 });
    } catch (error) {
      console.log(error);
      ctx.body = { status: -1, message: "create fail" };
    } finally {
      if (result && result.status) {
        ctx.body = { status: 1, message: "success", data: result };
      }
    }
  }
}

const project = new Project();

module.exports = project;
