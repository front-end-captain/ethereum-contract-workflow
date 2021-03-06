import React, { Component } from "react";
import { Table } from "antd";
import { createProjectListContractInstance } from "./../../../libs/projectList";
import { createProjectContractInstance } from "./../../../libs/project.js";
import { convertWeiToEther } from "./../../../libs/utils.js";

import "./index.css";

class ProjectList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addressList: [],
      projectsList: [],
      fetchingProjectsList: false,
    };

    this.projectListContractInstance = createProjectListContractInstance();
    this.jumpToProjectDetail = this.jumpToProjectDetail.bind(this);
  }

  async componentDidMount() {
    const projectsList = await this.getProjects();
    this.setState({ projectsList });
  }

  async getProjects() {
    this.setState({ fetchingProjectsList: true });
    const addressList = await this.projectListContractInstance.methods.getProjects().call();
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
    this.setState({ fetchingProjectsList: false });
    return projectsList;
  }

  jumpToProjectDetail(address) {
    const { history } = this.props;
    history.push(`/projects/${address}`);
  }

  render() {
    const { projectsList, fetchingProjectsList } = this.state;
    const column = [
      {
        key: "1",
        title: "项目名称",
        dataIndex: "description",
      },
      {
        key: "2",
        title: "融资目标(ETH)",
        dataIndex: "goal",
        render: (goal) => {
          return convertWeiToEther(goal);
        },
      },
      {
        key: "3",
        title: "最小投资金额(ETH)",
        dataIndex: "minInvest",
        render: (minInvest) => {
          return convertWeiToEther(minInvest);
        },
      },
      {
        key: "4",
        title: "最大投资金额(ETH)",
        dataIndex: "maxInvest",
        render: (maxInvest) => {
          return convertWeiToEther(maxInvest);
        },
      },
      {
        key: "5",
        title: "参与投资人数(个)",
        dataIndex: "investorCount",
      },
      {
        key: "6",
        title: "操作",
        dataIndex: "address",
        render: (address) => {
          return <a onClick={() => this.jumpToProjectDetail(address)}>详情</a>;
        },
      },
    ];
    return (
      <div className="project-list-wrapper">
        <Table
          columns={column}
          dataSource={projectsList}
          fetchingProjectsList={fetchingProjectsList}
          rowKey="address"
          pagination={false}
        />
      </div>
    );
  }
}

export default ProjectList;
