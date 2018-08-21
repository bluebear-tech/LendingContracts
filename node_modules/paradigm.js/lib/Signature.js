// Question: Can we do something simpler like this: (?)
// https://ethereum.stackexchange.com/questions/23701/can-i-web3-eth-sign-with-private-key

// TODO:
//   1. Refactor static methods

const ethUtil = require('ethereumjs-util');
const solSHA3 = require('ethereumjs-abi').soliditySHA3;
const Web3 = require('web3');


class Signature {

  static async generate(web3, dataTypes, values, signer) {
    let signature = new Signature(web3, dataTypes, values, signer);
    await signature.sign();

    if(!this.validate(signature)) {
      let vrs = ethUtil.fromRpcSig(signature.raw);
      signature.update(vrs);
    }

    if(!this.validate(signature))
      throw new Error('Bad signature.');

    return signature;
  }

  static validate(signature) {
    return this.recoverAddress(signature) === signature.signer;
  }

  static recoverAddress(signature) {
    const msgBuffer = ethUtil.hashPersonalMessage(ethUtil.toBuffer(signature.messageHex));
    try {
      const rawPub = ethUtil.ecrecover(msgBuffer, signature.v, signature.r, signature.s);
      return ethUtil.bufferToHex(ethUtil.publicToAddress(rawPub));
    } catch (e) { // what should this return?
      return false;
    }
  }

  constructor(web3, dataTypes, values, signer) {
    this.verifyFormatOfAddresses(dataTypes, values);

    this.web3       = web3;
    this.dataTypes  = dataTypes;
    this.values     = values;
    this.signer     = signer.toLowerCase();
  }

  async sign() {
    this.messageHex = this.getMessageHex();
    this.raw        = await this.getRaw();
    this.buffer     = this.getBuffer();

    this.setVRS()
  }

  update(vrs) {
    this.v = vrs.v;
    this.r = vrs.r;
    this.s = vrs.s;
  }

  getMessageHex() {
    return ethUtil.bufferToHex(solSHA3(this.dataTypes, this.values));
  }

  async getRaw() {
    let raw;

    try {
      raw = await this.web3.eth.personal.sign(this.messageHex, this.signer)
    } catch (e) {
      raw = await this.web3.eth.sign(this.messageHex, this.signer);
    }

    return raw;
  }

  getBuffer() {
    return ethUtil.toBuffer(this.raw);
  }

  setVRS() {
    this.v = this.buffer[0];
    this.r = this.buffer.slice(1, 33);
    this.s = this.buffer.slice(33, 65);
    if(this.v < 27) this.v = 27;
  }

  verifyFormatOfAddresses(dataTypes, values) {
    dataTypes.forEach((type, i) => {
      if (type === 'address' && !Web3.utils.isAddress(values[i]))
        throw new Error(`Value at index ${i} is not a valid address`);
    });
  }

  toJSON() {
    return {
      v: this.v,
      r: ethUtil.bufferToHex(this.r),
      s: ethUtil.bufferToHex(this.s),
      messageHex: this.messageHex
    }
  }
}

module.exports = Signature;
