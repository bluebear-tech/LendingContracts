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

  async giveMaxAllowanceFor(address, from = null) {
    await this.checkAddress();
    const token = SimpleERC20(address, await this.web3.eth.net.getId(), this.web3);
    await token.approve(this.address, this.MAX_UINT, from);
  }

  async giveAllowanceFor(address, value, from = null) {
    await this.checkAddress();
    const token = SimpleERC20(address, await this.web3.eth.net.getId(), this.web3);
    await token.approve(this.address, value, from);
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

  async checkAddress() {
    if(!this.address) {
      this.address = await this.orderGateway.paradigmBank();
    }
  }
};

module.exports = Bank;
