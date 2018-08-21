'use strict';

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var abi = require('../lib/abi.json');

var infuraEndpoints = {
  1: "https://mainnet.infura.io",
  'main': "https://mainnet.infura.io",
  3: "https://ropsten.infura.io",
  'ropsten': "https://ropsten.infura.io",
  4: "https://rinkeby.infura.io",
  'rinkeby': "https://rinkeby.infura.io",
  42: "https://kovan.infura.io",
  'kovan': "https://kovan.infura.io"
};

var networks = {
  'main': 1,
  '1': 1,
  'ropsten': 3,
  '3': 3,
  'rinkeby': 4,
  '4': 4,
  'kovan': 42,
  '42': 42
};

var initWeb3 = function initWeb3(network, web3Param) {
  if (web3Param !== null) {
    return new _web2.default(web3Param.currentProvider);
  } else if (typeof web3 !== 'undefined') {
    return new _web2.default(web3.currentProvider);
  } else {
    return new _web2.default(new _web2.default.providers.HttpProvider(infuraEndpoints[network]));
  }
};

var SimpleERC20 = function SimpleERC20(address) {
  var network = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var web3Param = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var w3 = initWeb3(network, web3Param);
  if (typeof address === 'undefined') throw new Error('SimpleERC20: Address undefined');
  if (!w3.utils.isAddress(address)) throw new Error('SimpleERC20: Invalid address: ' + address);
  var contract = new w3.eth.Contract(abi, address);
  var methods = contract.methods;

  w3.eth.net.getId().then(function (actualNetwork) {
    if (network !== actualNetwork) {
      var networkId = networks[network];
      if (networkId !== actualNetwork) console.warn('The current network is ' + actualNetwork + ', ' + network + ' was specified');
    }
  });

  var getCoinbase = async function getCoinbase() {
    return w3.eth.getCoinbase().catch(function () {
      return console.error('SimpleERC20: web3 coinbase is undefined. Omitting transactions.');
    });
  };

  return {
    contract: contract,
    name: function name() {
      return methods.name().call();
    },
    symbol: function symbol() {
      return methods.symbol().call();
    },
    totalSupply: function totalSupply() {
      return methods.totalSupply().call();
    },
    decimals: function decimals() {
      return methods.decimals().call();
    },
    balanceOf: function balanceOf(owner) {
      return methods.balanceOf(owner).call();
    },
    allowance: function allowance(owner, spender) {
      return methods.allowance(owner, spender).call();
    },
    approve: async function approve(spender, value) {
      var from = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (from === null) from = await getCoinbase();
      var tx = methods.approve(spender, value);
      return tx.send({ from: from, gas: await tx.estimateGas({ from: from }) });
    },
    transferFrom: async function transferFrom(fromAddress, to, value) {
      var from = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      if (from === null) from = await getCoinbase();
      var tx = methods.transferFrom(fromAddress, to, value);
      return tx.send({ from: from, gas: await tx.estimateGas({ from: from }) });
    },
    transfer: async function transfer(to, value) {
      var from = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (from === null) from = await getCoinbase();
      var tx = methods.transfer(to, value);
      return tx.send({ from: from, gas: await tx.estimateGas({ from: from }) });
    }
  };
  //TODO: Events to expose actions for.
  // Approval
  // Transfer
};

module.exports = SimpleERC20;