const Paradigm = require('paradigm.js');
const OrderGateway = artifacts.require("OrderGateway");
const Token = artifacts.require("./Token.sol");
const Loan = artifacts.require("Loan");

contract("Loan", async (accounts) => {

  beforeEach(async () => {
    lender   = accounts[3];
    borrower = accounts[0];
    // Give the lender some money to lend
    usdCoin  = await Token.new("United Stated Dollar Coin", 'USDC', { from: lender });
    gateway  = await OrderGateway.deployed();
    paradigm = new Paradigm({ provider: web3.currentProvider, networkId: 50 });
    Order    = paradigm.Order;
    loanContract = await Loan.new(
      '[{"dataType":"address","name":"maker"}, {"dataType":"address","name":"requestedToken"}, {"dataType":"uint","name":"requestedQuantity"}]',
      '[{"dataType":"address","name":"taker"}, {"dataType":"uint","name":"takenQuantity"}]'
    );
  });

  it("(setup) The lender should have $100,000", async () => {
    // Need to handle 18 decimal places in the token contract -> this is typical
    let weiBalance = (await usdCoin.balanceOf.call(lender)).toNumber();
    let balance = web3._extend.utils.fromWei(weiBalance);
    assert.equal(100000, balance, "Lender should have $100,000");
  });

  it("properly 'makes' a loan request", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: 1500 };
    let makerArguments = ['address', 'address', 'uint'];

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: accounts[0],
      makerValues: makerValues
    });

    await loanRequest.make();
    assert.equal(borrower, loanRequest.recoverMaker(), "Maker should be borrower");
  });

  it("immediately transfers funds to borrower if fully funded", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }
    let makerArguments = ['address', 'address', 'uint']

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1500) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = fromWei(weiBalance);
    assert.equal(1500, balance, "Borrower should have $1,500")
  });

  it("does not transfer the funds if the entire loan is not funded yet", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }
    let makerArguments = ['address', 'address', 'uint'];

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1200) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = fromWei(weiBalance);
    assert.equal(0, balance, "Borrower should have $0")
  });

});

function fromWei(amount) {
  return web3._extend.utils.fromWei(amount);
}

function toWei(amount) {
  return web3._extend.utils.toWei(amount);
}
