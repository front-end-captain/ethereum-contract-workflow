import React, { Component } from 'react';
import { Card, Button, Row, Col, Form, Input, Spin, message } from 'antd';
import { convertWeiToEther, convertEtherToWei } from './../../../libs/utils.js';
import { createProjectContractInstance } from './../../../libs/project.js';
import web3 from './../../../libs/web3.js';
import Payments from './../Payments/index.jsx';

import './index.css';

const FormItem = Form.Item;

class ProjectDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectDetail: {},
      loading: null,
      submitting: null,
    };

    this.projectContractInstance = null;
    this.projectAddress = props.match.params.address;

    this.checkInvestAmount = this.checkInvestAmount.bind(this);
    this.confirmInvest = this.confirmInvest.bind(this);
    this.getProjectDetail = this.getProjectDetail.bind(this);
    this.refreshProjectDetail = this.refreshProjectDetail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    if (!this.projectAddress) {
      history.push('/');
    }
    this.projectContractInstance = createProjectContractInstance(
      this.projectAddress,
    );
    const projectDetail = await this.getProjectDetail();
    this.setState({ projectDetail, loading: false });
  }

  async refreshProjectDetail() {
    const projectDetail = await this.getProjectDetail();
    this.setState({ projectDetail, loading: false });
  }

  async getProjectDetail() {
    this.setState({ loading: true });
    const summary = await  this.projectContractInstance
      .methods.getSummary()
      .call();

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
      tasks.push(
        this.projectContractInstance
          .methods.payments(i)
          .call(),
      );
    }
    const payments = await Promise.all(tasks);
    return {
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
  }

  checkInvestAmount(_, value, callback) {
    if (!value) {
      callback('数量不能为空');
    }
    const investAmount = Number(value);

    if (Number.isNaN(investAmount)) {
      callback('请输入有效数量');
    }

    if (investAmount === 0) {
      callback('数量不能为0');
    }

    callback();
  }

  confirmInvest() {
    const {
      form: { validateFields, setFields, getFieldsValue },
    } = this.props;
    const { projectDetail: project } = this.state;
    const { minInvest, maxInvest } = project;
    const minInvestToEther = Number(convertWeiToEther(minInvest));
    const maxInvestToEther = Number(convertWeiToEther(maxInvest));
    let { investAmount } = getFieldsValue(['investAmount']);
    investAmount = Number(investAmount);
    if (investAmount < minInvestToEther) {
      setFields({
        investAmount: {
          value: investAmount,
          errors: [new Error('投资数量不能小于最小投资数量')],
        },
      });
      return;
    }
    if (investAmount > maxInvestToEther) {
      setFields({
        investAmount: {
          value: investAmount,
          errors: [new Error('投资数量不能大于最小投资数量')],
        },
      });
      return;
    }

    validateFields((error, fieldValues) => {
      if (error) {
        return;
      }
      const { investAmount } = fieldValues;
      this.handleSubmit(investAmount);
    });
  }

  async handleSubmit(investAmount) {
    this.setState({ submitting: true });

    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];

    let result = null;

    try {
      result = await this.projectContractInstance.methods
        .contribute()
        .send({
          from: owner,
          value: convertEtherToWei(investAmount),
          gas: 5000000,
        });

      if (result.status) {
        this.refreshProjectDetail();
      }
    } catch (error) {
      console.dir(error);
      message.error(error.message || 'unknown error');
      this.setState({ submitting: false });
      return;
    }

    this.setState({ submitting: false });
  }

  render() {
    const {
      form: { getFieldDecorator },
      history,
    } = this.props;
    const { projectDetail: project, loading, submitting } = this.state;
    if (loading || typeof loading === 'object') {
      return (
        <div className="project-detail">
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div className="project-detail">
        <Card title={project.description} bordered={false}>
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
                {project.investorCount} 个
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
                  {getFieldDecorator('investAmount', {
                    rules: [{ validator: this.checkInvestAmount }],
                  })(<Input placeholder="请输入投资数量" addonAfter="ETH" />)}
                </FormItem>
              </Col>
              <Col span={2}>
                <Button
                  type="primary"
                  onClick={this.confirmInvest}
                  loading={submitting}
                >
                  确定
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
        <Payments
          payments={project.payments}
          loading={loading}
          address={this.projectAddress}
          history={history}
          balance={project.balance}
          investorCount={project.investorCount}
          refreshAction={this.refreshProjectDetail}
          owner={project.owner}
        />
      </div>
    );
  }
}

export default Form.create()(ProjectDetail);
