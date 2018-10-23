import React from "react";
import {
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
} from "@material-ui/core";
import withRoot from "../libs/withRoot";
import Layout from "../components/Layout.js";
import web3 from "../libs/web3.js";
import ProjectList from "../libs/projectList.js";
import Project from "../libs/project.js";
import InfoBlock from "../components/InfoBlock";
import { Link } from '../routes';

class Index extends React.Component {
  static async getInitialProps() {
    const addressList = await ProjectList.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map((address) =>
        Project(address)
          .methods.getSummary()
          .call(),
      ),
    );

    const projects = addressList.map((address, i) => {
      const [
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner,
      ] = Object.values(summaryList[i]);

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

    return { projects };
  }

  renderProject(project) {
    const progress = (project.balance / project.goal) * 100;
    return (
      <Grid item md={6} key={project.address}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
              {project.description}
            </Typography>
            <LinearProgress
              style={{ margin: "10px 0" }}
              color="primary"
              variant="determinate"
              value={progress}
            />
            <Grid container spacing={16}>
              <InfoBlock
                title={`${web3.utils.fromWei(project.goal, "ether")} ETH`}
                description="募资上限"
              />
              <InfoBlock
                title={`${web3.utils.fromWei(project.minInvest, "ether")} ETH`}
                description="最小投资金额"
              />
              <InfoBlock
                title={`${web3.utils.fromWei(project.maxInvest, "ether")} ETH`}
                description="最大投资金额"
              />
              <InfoBlock title={`${project.investorCount}人`} description="参投人数" />
              <InfoBlock
                title={`${web3.utils.fromWei(project.balance, "ether")} ETH`}
                description="已募资金额"
              />
            </Grid>
          </CardContent>
          <CardActions>
            <Link route={`/projects/${project.address}`}>
              <Button size="small" color="primary">
                立即投资
              </Button>
            </Link>
            <Link route={`/projects/${project.address}`}>
              <Button size="small" color="secondary">
                查看详情
              </Button>
            </Link>
          </CardActions>
        </Card>
      </Grid>
    );
  }

  render() {
    const { projects } = this.props;
    return (
      <Layout>
        <Grid container spacing={16}>
          {projects.map(this.renderProject)}
        </Grid>
      </Layout>
    );
  }
}

export default withRoot(Index);
