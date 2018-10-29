import React, { Component } from "react";
import { Input, Card, Form, Button, message } from "antd";
import { createProjectContractInstance } from "./../../../libs/project.js";
import { convertEtherToWei, convertWeiToEther } from "./../../../libs/utils.js";
import web3 from "./../../../libs/web3.js";

const FormItem = Form.Item;

class CreatePayment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
    };

    this.projectAddress = props.match.params.address;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.applyCreatePayment = this.applyCreatePayment.bind(this);
  }

  componentDidMount() {
    const { history } = this.props;
    if (!this.projectAddress) {
      history.push("/");
    }
  }

  async handleSubmit() {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((error, fields) => {
      if (error) {
        return;
      }
      let { description, amount, receiver } = fields;
      amount = convertEtherToWei(amount);
      this.applyCreatePayment(description, amount, receiver);
    });
  }

  async applyCreatePayment(description, amount, receiver) {
    this.setState({ submitting: true });
    const { history } = this.props;
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];
    const projectContractInstance = createProjectContractInstance(this.projectAddress);
    let result = null;
    try {
      result = await projectContractInstance.methods
        .createPayment(description, amount, receiver)
        .send({ from: owner, gas: 5000000 });
    } catch (error) {
      message.error(error.message);
    } finally {
      this.setState({ submitting: false });
      if (result && result.status) {
        history.push(`/projects/${this.projectAddress}`);
      }
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      location: { state },
    } = this.props;
    const { balance } = state;
    const { submitting } = this.state;
    return (
      <Card
        title="创建资金支出请求"
        bordered={false}
        extra={`已募集资金：${convertWeiToEther(balance)}ETH`}
      >
        <FormItem label="支出理由">
          {getFieldDecorator("description", {
            rules: [{ required: true, message: "请输入支出理由" }],
          })(<Input placeholder="请输入支出理由" />)}
        </FormItem>
        <FormItem label="支出金额">
          {getFieldDecorator("amount", {
            rules: [{ required: true, message: "请输入支出金额" }],
          })(<Input placeholder="请输入支出金额" addonAfter="ETH" />)}
        </FormItem>
        <FormItem label="收款方">
          {getFieldDecorator("receiver", {
            rules: [{ required: true, message: "请输入收款方地址" }],
          })(<Input placeholder="请输入收款方地址" />)}
        </FormItem>
        <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
          提交
        </Button>
      </Card>
    );
  }
}

export default Form.create()(CreatePayment);
