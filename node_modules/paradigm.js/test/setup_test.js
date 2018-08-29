const Web3 = require('web3');
const chai = require('chai');
const ganacheProvider = require('ganache-core').provider();
const Paradigm = require('../index');

const tokenHelper = require('./helpers/tokenHelper.js');
const paradigmContractHelper = require('./helpers/paradigmContractHelper');

global.SimpleERC20 = require('simple-erc20');

before(async () => {
  global.assert = chai.assert;
  chai.should();
  global.web3 = new Web3(ganacheProvider);
  global.accounts = await web3.eth.personal.getAccounts();
  global.paradigm = new Paradigm({ provider: web3.currentProvider, networkId: await web3.eth.net.getId() });

  await paradigmContractHelper();

  await tokenHelper('TKA', 'Token A', 'TKA', accounts[7]);
  await tokenHelper('TKB', 'Token B', 'TKB', accounts[8]);

  it('should connect to web3', () => {
    assert.equal(accounts.length, 10, "There should be 10 ETH accounts.")
  });
});
