import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  web3 = new Web3(window.web3.currentProvider);
} else {
  web3 = new Web3(
    new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/4ca5fec194be42278869da6855d2aa9e"),
  );
}

export default web3;
