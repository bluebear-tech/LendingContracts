const Web3 = require('web3');

const utils = {
  toBytes32: (value) => {
    return Web3.utils.toTwosComplement(Web3.utils.toHex(value));
  },
  NULL_ADDRESS: '0x0000000000000000000000000000000000000000'
};

module.exports = utils;