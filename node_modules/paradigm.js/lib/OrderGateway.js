const OrderGatewayContract = require('./contracts/OrderGateway');

const getOrderGatewayAddress = (options) => {
  if(options.orderGatewayAddress) return options.orderGatewayAddress;
  return OrderGatewayContract.networks[options.networkId].address;
};

class OrderGateway {
  constructor(options) {
    this.web3 = options.web3;
    this.address = getOrderGatewayAddress(options);
    this.contract = new this.web3.eth.Contract(OrderGatewayContract.abi, this.address);
  }

  async participate(subContract, makerData, takerData, taker) {
    const transaction = this.contract.methods.participate(subContract, makerData, takerData)
    return await transaction.send({ from: taker, gas: 4500000 });
  }

  async makerArguments(subContract) {
    return await this.contract.methods.makerArguments(subContract).call();
  }

  async takerArguments(subContract) {
    return await this.contract.methods.takerArguments(subContract).call();
  }

  async paradigmBank() {
    return await this.contract.methods.paradigmBank().call();
  }
}

module.exports = OrderGateway;
