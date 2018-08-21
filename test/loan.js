const Paradigm = require('paradigm.js');
const OrderGateway = artifacts.require("OrderGateway");
const Loan = artifacts.require("Loan");

contract("Loan", async (accounts) => {

  it("properly 'makes' a loan request", async () => {
    let orderGateway = await OrderGateway.deployed();
    let paradigm = new Paradigm({ provider: web3.currentProvider, networkId: 50 });
    const Order = paradigm.Order;

    let loanContract = Loan.new();

    makerValues = {
      maker: accounts[0],
      requestedToken: accounts[9],
      requestedQuantity: 1500000
    }

    let makerArguments = ['address', 'address', 'uint']

    let loanRequest = new Order({
      subContract: loanContract,
      maker: accounts[0],
      makerArguments: makerArguments,
      makerValues: makerValues,
      takerArguments: []
    });

    await loanRequest.make();

    assert.equal(accounts[0], loanRequest.recoverMaker(), "Maker should be accounts[0]");
  });

});
