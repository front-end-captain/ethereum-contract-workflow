import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin } from "antd";
import { createProjectListContractInstance } from "./../../../libs/projectList";
import { createProjectContractInstance } from "./../../../libs/project.js";
import { convertWeiToEther } from "./../../../libs/utils.js";
import "./index.css";

class ProjectList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addressList: [],
      projects: [],
      loading: null,
    };

    this.projectListContractInstance = createProjectListContractInstance();
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

  render() {
    const { projects, loading } = this.state;
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
            <Card
              key={project.address}
              title={project.description}
              bordered={false}
              actions={[<Link to={`/projects/${project.address}`}>查看详情</Link>]}
            >
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
            </Card>
          );
        })}
      </div>
    );
  }
}

export default ProjectList;
