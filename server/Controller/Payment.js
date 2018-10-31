const web3 = require("./../../libs/web3.js");
const { createProjectContractInstance } = require("./../../libs/project.js");
const { convertEtherToWei } = require("./../../libs/utils.js");

class Payment {
  // creator, description, amount, receiver
  async createPayment(ctx) {
    let { creator, description, amount, receiver, projectAddress } = ctx.request.body;
    if (!creator || !description || !amount || !receiver || !projectAddress) {
      ctx.body = { status: -1, message: "the params is missing value" };
      return;
    }

    if (!web3.utils.isAddress(creator)) {
      ctx.body = { status: -1, message: "the creator address is validate" };
      return;
    }

    if (!web3.utils.isAddress(projectAddress)) {
      ctx.body = { status: -1, message: "the projectAddress is validate" };
      return;
    }

    const projectContractInstance = createProjectContractInstance(projectAddress);

    amount = convertEtherToWei(Number(amount));
    let result = null;

    try {
      result = await projectContractInstance.methods
        .createPayment(description, amount, receiver)
        .send({
          from: creator,
          gas: 5000000,
        });
    } catch (error) {
      ctx.body = {
        status: -1,
        message: "create fail",
      };
    } finally {
      if (result && result.status) {
        ctx.body = { status: 1, message: "success", data: result };
      }
    }
  }

  // index, sender, projectAddress
  async approvePayment() {
    const { index, sender, projectAddress } = ctx.request.body;
    if (!index || !sender || !projectAddress) {
      ctx.body = { status: -1, message: "the params is missing value" };
      return;
    }
    if (!web3.utils.isAddress(sender)) {
      ctx.body = { status: -1, message: "the sender address is validate" };
      return;
    }

    if (!web3.utils.isAddress(projectAddress)) {
      ctx.body = { status: -1, message: "the projectAddress address is validate" };
      return;
    }
    const projectContractInstance = createProjectContractInstance(projectAddress);
    const isInvestor = await projectContractInstance.methods.investors(sender).call();
    if (!isInvestor) {
      ctx.body = { status: -1, message: "only the investor can approve" };
      return;
    }

    let result = null;
    try {
      result = await projectContractInstance.methods
        .approvePayment(index)
        .send({ from: sender, gas: 5000000 });
    } catch (error) {
      ctx.body = { status: -1, message: "approve fail" };
    } finally {
      if (result && result.status) {
        ctx.body = { status: 1, message: "approve success", data: result };
      }
    }
  }

  // index, sender, projectAddress
  async finishPayment() {
    const { index, sender, projectAddress } = ctx.request.body;
    if (!index || !sender || !projectAddress) {
      ctx.body = { status: -1, message: "the params is missing value" };
      return;
    }
    if (!web3.utils.isAddress(sender)) {
      ctx.body = { status: -1, message: "the sender address is validate" };
      return;
    }

    if (!web3.utils.isAddress(projectAddress)) {
      ctx.body = { status: -1, message: "the projectAddress address is validate" };
      return;
    }

    const projectContractInstance = createProjectContractInstance(projectAddress);
    const owner = await projectContractInstance.methods.owner().call();
    if (owner !== sender) {
      ctx.body = { status: -1, message: "only project owner can finish the payment" };
      return;
    }

    let result = null;
    try {
      result = await projectContractInstance.methods
        .finishPayment(index)
        .send({ from: sender, gas: 5000000 });
    } catch (error) {
      ctx.body = { status: -1, message: "finish fail" };
    } finally {
      if (result && result.status) {
        ctx.body = { status: 1, message: "finish success", data: result };
      }
    }
  }
}

const payment = new Payment();

module.exports = payment;
