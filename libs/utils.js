const web3 = require("./web3.js");

const convertWeiToEther = (value) => {
  return web3.utils.fromWei(value, 'ether');
};

const convertEtherToWei = (value) => {
  return web3.utils.toWei(value, 'ether');
};

module.exports = { convertWeiToEther, convertEtherToWei };