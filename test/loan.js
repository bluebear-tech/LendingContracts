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
    let balance = fromWei(weiBalance);
    assert.equal(100000, balance, "Lender should have $100,000");
  });

  it("properly 'makes' a loan request", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: 1500 };

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: accounts[0],
      makerValues: makerValues
    });

    await loanRequest.make();
    assert.equal(borrower, loanRequest.recoverMaker(), "Maker should be borrower");
  });

  it("immediately transfers funds to borrower if fully funded by one lender", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

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

  it("transfers funds to borrower if fully funded by multiple lenders", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });
    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(700) });

    let lender2 = accounts[7];
    await usdCoin.transfer(lender2, toWei(10000), { from: lender });
    await usdCoin.approve(loanContract.address, toWei(10000), { from: lender2 });
    await loanRequest.take(lender2, { taker: lender2, takenQuantity: toWei(800) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = fromWei(weiBalance);
    assert.equal(1500, balance, "Borrower should have $1,500");
  });

  it("transfers only requested amount to borrower if over-funded by multiple lenders", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });
    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(600) });

    let lender2 = accounts[7];
    await usdCoin.transfer(lender2, toWei(10000), { from: lender });
    await usdCoin.approve(loanContract.address, toWei(10000), { from: lender2 });
    await loanRequest.take(lender2, { taker: lender2, takenQuantity: toWei(600) });

    let lender3 = accounts[5];
    await usdCoin.transfer(lender3, toWei(10000), { from: lender });
    await usdCoin.approve(loanContract.address, toWei(10000), { from: lender3 });
    await loanRequest.take(lender3, { taker: lender3, takenQuantity: toWei(600) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = fromWei(weiBalance);
    assert.equal(1500, balance, "Borrower should have $1,500");

    let lenderOneBalance = fromWei((await usdCoin.balanceOf.call(lender)).toNumber());
    assert.equal(79400, lenderOneBalance, "Lender should have $79,400 left");
    let lenderTwoBalance = fromWei((await usdCoin.balanceOf.call(lender2)).toNumber());
    assert.equal(9400, lenderTwoBalance, "Lender2 should have $9,400 left");
    let lenderThreeBalance = fromWei((await usdCoin.balanceOf.call(lender3)).toNumber());
    assert.equal(9700, lenderThreeBalance, "Lender3 should have $9,700 left");
  });

  it("does not transfer the funds if the entire loan is not funded yet", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

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
    assert.equal(0, balance, "Borrower should have $0");
  });

  it("does transfer the amount requested if more is given", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1800) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = Number(fromWei(weiBalance));
    assert.equal(balance, 1500, "Borrower should have the amount requested even if more is given" )
  });

  //TODO: IS THIS THE SAME TEST AS THE ONE ABOVE
  it("does not transfer more funds than the borrower requested", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1800) });

    let weiBalance = (await usdCoin.balanceOf.call(borrower)).toNumber();
    let balance = Number(fromWei(weiBalance));
    assert.isAtMost(balance, 1500, "Borrower should have no more than the loan request amount" )
  });

  it("does not allow the lender to lend more than available balance", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(16000) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    let lender2 = accounts[7];

    await usdCoin.transfer(lender2, toWei(10000), { from: lender });
    await usdCoin.approve(loanContract.address, toWei(10000), { from: lender2 });
    try {
      await loanRequest.take(lender2, { taker: lender2, takenQuantity: toWei(8000) });
      await loanRequest.take(lender2, { taker: lender2, takenQuantity: toWei(8000) });
    } catch(error) {
      let borrowerBalance = fromWei((await usdCoin.balanceOf.call(borrower)).toNumber());
      let lenderPendingBalance = fromWei((await loanContract.totalPending.call(usdCoin.address, lender)).toNumber());
      assert.equal(borrowerBalance, 0, "Borrower should have no funding yet" )
      assert.equal(lenderPendingBalance, 8000, "Lender should only have first lent amount pending" )
    }

  });

  //TODO: CAN WE COMBINE WITH TEST ABOVE?
  it("does not transfer if lender has insufficient funds", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(16000) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(16000) });

    let borrowerBalance = fromWei((await usdCoin.balanceOf.call(borrower)).toNumber());
    assert.equal(borrowerBalance, 0, "Borrower should have no funding because lender cannot cover balance" )
  //  TODO: IS THERE SOME WAY TO CHECK THAT THE TRANSFER IS NOT EVEN ATTEMPTED?
  });

  it("does not transfer if contract has insufficient allowance", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(1000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1500) });

    let borrowerBalance = fromWei((await usdCoin.balanceOf.call(borrower)).toNumber());
    assert.equal(borrowerBalance, 0, "Borrower should have no funding because contract allowance not high enough" )
  //  TODO: IS THERE SOME WAY TO CHECK THAT THE TRANSFER IS NOT EVEN ATTEMPTED?
  });

  it("keeps track of partial loans (but doesn't transfer until fully funded)", async () => {
    let makerValues = { maker: borrower, requestedToken: usdCoin.address, requestedQuantity: toWei(1500) }

    let loanRequest = new Order({
      subContract: loanContract.address,
      maker: borrower,
      makerValues: makerValues
    });

    await loanRequest.make();
    await usdCoin.approve(loanContract.address, toWei(100000), { from: lender });

    await loanRequest.take(lender, { taker: lender, takenQuantity: toWei(1200) });

    // NOTE: We can use the function this will implement as a way to verify that
    //       the lender has enough funds to cover all loans they are trying to fill.
    let weiPending = (await loanContract.totalPending.call(usdCoin.address, lender)).toNumber();
    let pending = fromWei(weiPending);
    assert.equal(1200, pending, "Lender should have $1,200 pending.")
  });

});

function fromWei(amount) {
  return web3._extend.utils.fromWei(amount);
}

function toWei(amount) {
  return web3._extend.utils.toWei(amount);
}
