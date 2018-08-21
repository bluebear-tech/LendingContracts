const ethUtil = require('ethereumjs-util');
const solSHA3 = require('ethereumjs-abi').soliditySHA3;
const Web3 = require('web3');
let web3;

const _error = (s) => {
  throw new Error(s);
};

const messages = {
  signMessage: async (dataTypes, data, provider, signer) => {
    web3 = new Web3(provider);
    const messageHex = messages.toHash(dataTypes, data);
    const signature = await messages.generateSignature(messageHex, signer.toLowerCase());
    return { messageHex, signature };
  },
  toHash: (dataTypes, data) => {
    messages.validate(dataTypes, data);
    return ethUtil.bufferToHex(solSHA3(dataTypes, data));
  },
  validate: (dataTypes, data) => {
    dataTypes.forEach((type, i) => {
      switch(type) {
        case 'address':
          if(!Web3.utils.isAddress(data[i])) _error(`Data at index ${i} is not a valid address`);
      }
    })
  },
  validateSignature: (message, signature, signer) => {
    const msgBuffer = ethUtil.hashPersonalMessage(ethUtil.toBuffer(message)); //TODO: ASSUMING eth_sign message prefix atm
    try {
      const rawPub = ethUtil.ecrecover(msgBuffer, signature.v, signature.r, signature.s);
      const calculatedPublicKey = ethUtil.bufferToHex(ethUtil.publicToAddress(rawPub));
      return calculatedPublicKey === signer;
    } catch (e) {
      return false;
    }
  },
  generateSignature: async (messageHex, signer) => {
    const rawSignature = await web3.eth.sign(messageHex, signer);
    const rawSignatureBuffer = ethUtil.toBuffer(rawSignature);

    //Try V, R, S
    let signature = {
      v: rawSignatureBuffer[0],
      r: rawSignatureBuffer.slice(1, 33),
      s: rawSignatureBuffer.slice(33, 65)
    };

    if(signature.v < 27) signature.v = 27;
    if(!messages.validateSignature(messageHex, signature, signer)) {
      //TRY R, S, V
      signature = ethUtil.fromRpcSig(rawSignature);
    }
    if(!messages.validateSignature(messageHex, signature, signer)) {
      throw new Error('bad signature')
    }

    signature.r = ethUtil.bufferToHex(signature.r);
    signature.s = ethUtil.bufferToHex(signature.s);

    return signature;
  }
};

module.exports = messages;