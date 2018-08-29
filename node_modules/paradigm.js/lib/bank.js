const Web3 = require('web3');
const SimpleERC20 = require('simple-erc20');
const Signature = require('./Signature');
const utils = require('./utils');

class Bank {
  constructor(web3, orderGateway) {
    this.web3 = web3;
    this.orderGateway = orderGateway;

    this.MAX_UINT = Web3.utils.toBN('2').pow(Web3.utils.toBN('256')).sub(Web3.utils.toBN('1'));
  }

  async giveMaxAllowanceFor(token, spender, from = null) {
    const token_ = SimpleERC20(token, await this.web3.eth.net.getId(), this.web3);
    await token_.approve(spender, this.MAX_UINT, from);
  }

  async giveAllowanceFor(token, spender, value, from = null) {
    const token_ = SimpleERC20(token, await this.web3.eth.net.getId(), this.web3);
    await token_.approve(spender, value, from);
  }

  async createSignedTransfer(transfer) {
    //msg.sender, token, from, signedTo, signedValue, nonce signed values
    const dataTypes = ['address', 'address', 'address', 'address', 'uint', 'uint'];
    const values = [transfer.transferer, transfer.tokenAddress, transfer.tokenHolder, transfer.recipient, transfer.maxAmount, transfer.nonce];
    transfer.signature = (await Signature.generate(this.web3, dataTypes, values, transfer.tokenHolder)).toJSON();
    return transfer;
  }

  createTransfer(transferer, tokenAddress, tokenHolder, recipient, maxAmount, nonce) {
    if(recipient === null) recipient = utils.NULL_ADDRESS;
    return { transferer, tokenAddress, tokenHolder, recipient, maxAmount, nonce } //TODO: perhaps here would be a good place to generate a nonce?
  }
};

module.exports = Bank;
