import React, { Component } from "react";
import { Card, Table, Button, message } from "antd";
import { convertWeiToEther } from "./../../../libs/utils.js";
import web3 from "./../../../libs/web3.js";
import { createProjectContractInstance } from "./../../../libs/project.js";

import "./index.css";

class Payments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      approving: false,
      transferring: false,
    };

    this.projectContactInstance = createProjectContractInstance(props.address);

    this.jumpToCreatePaymentPage = this.jumpToCreatePaymentPage.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
    this.handleFinishPayment = this.handleFinishPayment.bind(this);
  }

  jumpToCreatePaymentPage() {
    const { address, history, balance } = this.props;
    if (balance <= 0) {
      message.warning("暂时未募集到资金");
      return;
    }
    history.push(`/projects/${address}/payments/create`, { balance });
  }

  async handleApprove(index) {
    const { refreshAction } = this.props;
    this.setState({ approving: true });
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];
    const isInvestor = await this.projectContactInstance.methods.investors(sender).call();
    if (!isInvestor) {
      message.error("只有投资人才可以投票");
      this.setState({ approving: false });
      return;
    }
    let result = null;
    try {
      result = await this.projectContactInstance.methods
        .approvePayment(index)
        .send({ from: sender, gas: 5000000 });
    } catch (error) {
      console.dir(error);
      message.error(error.message);
    } finally {
      this.setState({ approving: false });
      if (result && result.status) {
        message.success("投票成功");
        refreshAction();
      }
    }
  }

  async handleFinishPayment(index) {
    const { refreshAction, owner } = this.props;
    this.setState({ transferring: true });
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];
    if (owner !== sender) {
      message.error("只有项目管理员可以进行划款");
      this.setState({ transferring: false });
      return;
    }
    let result = null;
    try {
      result = await this.projectContactInstance.methods
        .finishPayment(index)
        .send({ from: sender, gas: 5000000 });
    } catch (error) {
      console.dir(error);
      message.error(error.message);
    } finally {
      this.setState({ transferring: false });
      if (result && result.status) {
        message.success("划款成功");
        refreshAction();
      }
    }
  }

  render() {
    const { payments, loading, investorCount } = this.props;
    const { approving, transferring } = this.state;
    const columns = [
      {
        key: "1",
        title: "支出理由",
        dataIndex: "description",
      },
      {
        key: "2",
        title: "支出金额",
        dataIndex: "amount",
        render: (amount) => {
          return `${convertWeiToEther(amount)} ETH`;
        },
      },
      {
        key: "3",
        title: "收款人",
        dataIndex: "receiver",
      },
      {
        key: "4",
        title: "是否完成",
        dataIndex: "completed",
        render: (completed) => {
          return completed ? "是" : "否";
        },
      },
      {
        key: "5",
        title: "投票状态",
        dataIndex: "voterCount",
        render: (voterCount) => {
          return `${voterCount}/${investorCount}`;
        },
      },
      {
        key: "6",
        title: "操作",
        render: (text, record, index) => {
          return (
            <div>
              <Button
                type="dashed"
                disabled={record.completed}
                onClick={() => this.handleApprove(index)}
                loading={approving}
              >
                投票
              </Button>
              &nbsp; | &nbsp;
              <Button
                type="dashed"
                disabled={Number(record.voterCount) / Number(investorCount) < 0.5}
                onClick={() => this.handleFinishPayment(index)}
                loading={transferring}
              >
                划款
              </Button>
            </div>
          );
        },
      },
    ];
    return (
      <Card title="资金支出" bordered={false}>
        <Table
          dataSource={payments}
          columns={columns}
          loading={loading}
          rowKey={() => Math.random()}
          pagination={false}
        />
        <div className="create-payment-btn-wrapper">
          <Button type="primary" onClick={this.jumpToCreatePaymentPage}>
            创建资金支出请求
          </Button>
        </div>
      </Card>
    );
  }
}

export default Payments;
