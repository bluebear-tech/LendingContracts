// Interestingly the advice in this article to not require json was helpful in this case to infact do it.
// Great info to know!
// https://goenning.net/2016/04/14/stop-reading-json-files-with-require/
const OrderGatewayContract = require('../../lib/contracts/OrderGateway');
const BasicTradeSubContract = require('../../lib/contracts/BasicTradeSubContract');

const Paradigm = require('../../index');

module.exports = async () => {
  const orderGatewayContract = await (new web3.eth.Contract(OrderGatewayContract.abi))
    .deploy({ data: OrderGatewayContract.bytecode }).send({ from: accounts[0], gas: 4500000 });
  OrderGatewayContract.networks[await web3.eth.net.getId()] = { address: orderGatewayContract._address };

  global.paradigm = new Paradigm({ provider: web3.currentProvider, networkId: await web3.eth.net.getId() });
  global.orderGateway = paradigm.orderGateway;

  const basicTradeSubContract = await (new web3.eth.Contract(BasicTradeSubContract.abi))
    .deploy({ data: BasicTradeSubContract.bytecode, arguments: [
        await orderGateway.paradigmBank(),
        makerDataTypes,
        takerArguments
      ] }).send({ from: accounts[0], gas: 4500000 });
  global.subContract = basicTradeSubContract._address;
};


const makerDataTypes = JSON.stringify([
  { 'dataType': "address", 'name': "signer" },//0
  { 'dataType': "address", 'name': "signerToken" },//1
  { 'dataType': "uint", 'name': "signerTokenCount" },//2
  { 'dataType': "address", 'name': "buyer" },//3
  { 'dataType': "address", 'name': "buyerToken" },//4
  { 'dataType': "uint", 'name': "buyerTokenCount" },//5
  { 'dataType': 'signedTransfer', 'name': 'signerTransfer' },//7 -> 6 | 8 -> 7 | 9 -> 8 | 10 -> 9 | 11 -> 10 | 12 -> 11 -- recipient maxAmount v r s nonce
  { 'dataType': "signature", 'signatureFields': [0, 1, 2, 3, 4, 5]}//19 -> 12 | 20 -> 13 | 21 -> 14
]);

const takerArguments = JSON.stringify([
  { 'dataType': "uint", 'name': "tokensToBuy"},//6 -> 0
  { 'dataType': 'signedTransfer', 'name': 'buyerTransfer' },//13 -> 1 | 14 -> 2 | 15 -> 3 | 16 -> 4 | 17 -> 5 | 18 -> 6 | -- recipient maxAmount v r s nonce
]);