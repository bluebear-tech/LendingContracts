const OrderGatewayContract = require('paradigm-core-solidity/build/contracts/OrderGateway');

class OrderGateway {
  constructor(options) {
    this.web3 = options.web3;
    this.init(options);
  }

  async init(options) {
    if (OrderGatewayContract.networks[options.networkId]) {
      this.address = OrderGatewayContract.networks[options.networkId].address;
      this.contract = new this.web3.eth.Contract(OrderGatewayContract.abi, this.address);
    } else {
      this.contract = await (new this.web3.eth.Contract(OrderGatewayContract.abi))
        .deploy({ data: OrderGatewayContract.bytecode }).send({ from: await this.web3.eth.getCoinbase(), gas: 4500000 });
      this.address = this.contract._address;
    }
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
}

module.exports = OrderGateway;
