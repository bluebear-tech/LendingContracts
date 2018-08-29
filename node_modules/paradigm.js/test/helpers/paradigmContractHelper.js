const BasicTradeSubContract = require('paradigm-js-test-solidity/build/contracts/BasicTradeSubContract');
const BasicTradeSubContractConfig = require('paradigm-js-test-solidity/configuration/BasicTradeSubContract');

module.exports = async () => {
  const basicTradeSubContract = await (new web3.eth.Contract(BasicTradeSubContract.abi))
    .deploy({ data: BasicTradeSubContract.bytecode, arguments: [
        JSON.stringify(BasicTradeSubContractConfig.makerArguments),
        JSON.stringify(BasicTradeSubContractConfig.takerArguments)
      ] }).send({ from: accounts[0], gas: 4500000 });
  global.subContract = basicTradeSubContract._address;
};
