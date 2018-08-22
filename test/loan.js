const Paradigm = require('paradigm.js');
const OrderGateway = artifacts.require("OrderGateway");
const Token = artifacts.require("./Token.sol");
const Loan = artifacts.require("Loan");

contract("Loan", async (accounts) => {

  before(async () => {
    lender   = accounts[3];
    borrower = accounts[0];
    // Give the lender some money to lend
    usdCoin  = await Token.new("United Stated Dollar Coin", 'USDC', { from: lender });
    gateway  = await OrderGateway.deployed();
    paradigm = new Paradigm({ provider: web3.currentProvider, networkId: 50 });
    Order    = paradigm.Order;
  });

  it("(setup) The lender should have $100,000", async () => {
    // Need to handle 18 decimal places in the token contract -> this is typical
    let weiBalance = (await usdCoin.balanceOf.call(lender)).toNumber();
    let balance = web3._extend.utils.fromWei(weiBalance);
    assert.equal(100000, balance, "Lender should have $100,000");
  });

  it("properly 'makes' a loan request", async () => {
    let loanContract = Loan.new();
    makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: 1500 }
    let makerArguments = ['address', 'address', 'uint']

    let loanRequest = new Order({
      subContract: loanContract,
      maker: accounts[0],
      makerArguments: makerArguments,
      makerValues: makerValues,
      takerArguments: [1500]
    });

    await loanRequest.make();
    assert.equal(borrower, loanRequest.recoverMaker(), "Maker should be borrower");
  });

  it("immediately transfers funds to borrower if fully funded", async () => {
    console.log("NOT YET IMPLEMENTED");
  });

  it("does not transfer the funds if the entire loan is not funded yet", async () => {
    console.log("NOT YET IMPLEMENTED");
  });

});
