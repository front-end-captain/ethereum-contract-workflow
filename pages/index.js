import React from "react";
import { Button } from "@material-ui/core";
import withRoot from "../libs/withRoot";
import Layout from "../components/Layout.js";
import web3 from "../libs/web3.js";

class Index extends React.Component {
  state = {
    accounts: [],
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    const balances = await Promise.all(accounts.map((account) => web3.eth.getBalance(account)));
    this.setState({
      accounts: accounts.map((account, balanceIndex) => ({
        account,
        balance: balances[balanceIndex],
      })),
    });
  }

  render() {
    const { accounts } = this.state;
    return (
      <Layout>
        <Button variant="raised" color="primary">
          Welcome to Ethereum ICO DApp!
        </Button>
        <ul>
          {accounts.map((account) => (
            <li key={account.account}>
              账户：
              {account.account}
              ，余额：
              {web3.utils.fromWei(account.balance, "ether")} ETH
            </li>
          ))}
        </ul>
      </Layout>
    );
  }
}

export default withRoot(Index);
