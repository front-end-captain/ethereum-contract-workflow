import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin, Form, Input, Button } from "antd";
import { createProjectListContractInstance } from "./../../../libs/projectList";
import { createProjectContractInstance } from "./../../../libs/project.js";
import { convertWeiToEther } from "./../../../libs/utils.js";

import "./index.css";

const FormItem = Form.Item;

class ProjectList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addressList: [],
      projects: [],
      loading: null,
    };

    this.projectListContractInstance = createProjectListContractInstance();
    this.checkInvestAmount = this.checkInvestAmount.bind(this);
    this.confirmInvest = this.confirmInvest.bind(this);
  }
  async getProjects() {
    this.setState({ loading: true });
    const addressList = await this.projectListContractInstance.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map((address) => {
        return createProjectContractInstance(address)
          .methods.getSummary()
          .call();
      }),
    );
    const projects = addressList.map((address, index) => {
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
    this.setState({ loading: false });
    return projects;
  }
  async componentDidMount() {
    const projects = await this.getProjects();
    this.setState({ projects });
  }

  checkInvestAmount(rule, value, callback) {
    if (!value) {
      callback("数量不能为空");
    }
    const investAmount = Number(value);

    if (Number.isNaN(investAmount)) {
      callback("请输入有效数量");
    }

    if (investAmount === 0) {
      callback("数量不能为0");
    }

    callback();
  }

  confirmInvest(address) {
    const {
      form: { validateFields, setFields, getFieldsValue },
    } = this.props;
    const { projects } = this.state;
    const { minInvest, maxInvest } = projects.find((project) => project.address === address);
    const minInvestToEther = Number(convertWeiToEther(minInvest));
    const maxInvestToEther = Number(convertWeiToEther(maxInvest));
    let { investAmount } = getFieldsValue(["investAmount"]);
    investAmount = Number(investAmount);
    if (investAmount < minInvestToEther) {
      setFields({
        investAmount: { value: investAmount, errors: [new Error("投资数量不能小于最小投资数量")] },
      });
      return;
    }
    if (investAmount > maxInvestToEther) {
      setFields({
        investAmount: { value: investAmount, errors: [new Error("投资数量不能大于最小投资数量")] },
      });
      return;
    }

    validateFields((error, fieldValues) => {
      if (error) {
        return;
      }
      console.log(fieldValues);
    });
  }

  render() {
    const { projects, loading } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    if (loading) {
      return (
        <div className="project-list-loading-container">
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div className="project-list-wrapper">
        {projects.map((project) => {
          return (
            <Card key={project.address} title={project.description} bordered={false}>
              <Row gutter={16}>
                <Col span={5}>
                  <Card bordered={false} hoverable={true} title="融资目标">
                    {convertWeiToEther(project.goal)}
                    ETH
                  </Card>
                </Col>
                <Col span={5}>
                  <Card bordered={false} hoverable={true} title="最小投资金额">
                    {convertWeiToEther(project.minInvest)} ETH
                  </Card>
                </Col>
                <Col span={5}>
                  <Card bordered={false} hoverable={true} title="最大投资金额">
                    {convertWeiToEther(project.maxInvest)} ETH
                  </Card>
                </Col>
                <Col span={5}>
                  <Card bordered={false} hoverable={true} title="参与投资人数">
                    ${convertWeiToEther(project.investorCount)} 个
                  </Card>
                </Col>
                <Col span={4}>
                  <Card bordered={false} hoverable={true} title="已募集资金">
                    {convertWeiToEther(project.balance)} ETH
                  </Card>
                </Col>
              </Row>
              <div className="invest-action">
                <Row gutter={16}>
                  <Col span={10}>
                    <FormItem wrapperCol={{ span: 10 }}>
                      {getFieldDecorator("investAmount", {
                        rules: [{ validator: this.checkInvestAmount }],
                      })(<Input placeholder="请输入投资数量" addonAfter="ETH" />)}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <Button onClick={() => this.confirmInvest(project.address)}>确定</Button>
                  </Col>
                </Row>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }
}

export default Form.create()(ProjectList);
