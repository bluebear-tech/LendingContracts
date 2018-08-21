const OrderGateway = artifacts.require("OrderGateway");
const Loan = artifacts.require("Loan");

contract("Loan", async (accounts) => {

  it("is working", async () => {
    orderGateway = await OrderGateway.deployed();
    console.log(orderGateway);
  });

});
