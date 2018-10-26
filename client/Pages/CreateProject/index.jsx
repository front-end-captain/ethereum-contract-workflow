import React, { Component } from "react";
import { Form, Button, Input, message } from "antd";
import { createProjectListContractInstance } from "./../../../libs/projectList";
import { convertEtherToWei } from "./../../../libs/utils.js";
import web3 from "../../../libs/web3";

import "./index.css";

const FormItem = Form.Item;

class CreateProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
    };

    this.projectListContractInstance = createProjectListContractInstance();

    this.handleConfirmSubmit = this.handleConfirmSubmit.bind(this);
    this.postSubmit = this.postSubmit.bind(this);
  }

  handleConfirmSubmit() {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((error, fieldValue) => {
      
      if (error) {
        return;
      }

      const { description, minInvest, maxInvest, goal } = fieldValue;
      const minInvestToWei = convertEtherToWei(minInvest);
      const maxInvestToWei = convertEtherToWei(maxInvest);
      const goalToWei = convertEtherToWei(goal);
      this.postSubmit(description, minInvestToWei, maxInvestToWei, goalToWei);
    });
  }

  async postSubmit(description, minInvest, maxInvest, goal) {
    const { history } = this.props;
    this.setState({ submitting: true });
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    let result;

    try {
      result = await this.projectListContractInstance.methods
      .createProject(description, minInvest, maxInvest, goal)
      .send({
        from: owner,
        gas: 5000000,
      });
    } catch (error) {
      console.dir(error);
      message.error(error.message);
      this.setState({ submitting: false });
      return;
    }

    console.log(result);
    if (result.status) {
      history.push("/");
    }
    this.setState({ submitting: false });
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { submitting } = this.state;
    return (
      <div className="crete-project">
        <Form>
          <FormItem label="项目名称">
            {getFieldDecorator("description", {
              rules: [{ required: true, message: "请输入项目名称" }],
            })(<Input placeholder="请输入项目名称" />)}
          </FormItem>
          <FormItem label="最大投资金额">
            {getFieldDecorator("maxInvest", {
              rules: [{ required: true, message: "请输入最大投资金额" }],
            })(<Input placeholder="请输入最大投资金额" addonAfter="ETH" />)}
          </FormItem>
          <FormItem label="最小投资金额">
            {getFieldDecorator("minInvest", {
              rules: [{ required: true, message: "请输入最小投资金额" }],
            })(<Input placeholder="请输入最小投资金额" addonAfter="ETH" />)}
          </FormItem>
          <FormItem label="融资目标">
            {getFieldDecorator("goal", {
              rules: [{ required: true, message: "请输入融资目标" }],
            })(<Input placeholder="请输入融资目标" addonAfter="ETH" />)}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              onClick={this.handleConfirmSubmit}
              loading={submitting}
            >
              确认
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(CreateProject);
