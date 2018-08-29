//==================================  MAKE  ==================================

const paradigm = new Paradigm({ provider: web3.currentProvider, orderStream: 'os-dev.paradigm.market', networkId: await web3.eth.net.getId() });
const Order = paradigm.Order;
const coinbase = await web3.eth.getCoinbase();

// Test token addresses
const TKA = "0xc8001ac8faed38171bd8960e2a177b2b80f1e9b0";
const TKB = "0x77ae4cded8c197b4c503895368f077ef6288462b";
const TKC = "0xb55b454e5f040d4c6f148d0590e767ba0dcbc615";

const subContract = '0xd5c4a95a499e2b876ffefc6117a9d7d53223cb58';

let taker = '0x7ed8E5d7884FF0Be732479a475ACB82f229C9e35';

const makerValues = {
  signer: coinbase, //Coinbase is the currently active Metamask address.
  signerToken: TKA,
  signerTokenCount: 1000,
  buyer: taker,
  buyerToken: TKB,
  buyerTokenCount: 1000
};


await paradigm.bank.giveMaxAllowanceFor(makerValues.signerToken, coinbase);
const transfer = paradigm.bank.createTransfer(subContract, TKA, coinbase, taker, makerValues.signerTokenCount, Date.now());
makerValues.signerTransfer = await paradigm.bank.createSignedTransfer(transfer);

const order = new Order({ subContract, maker: coinbase, makerValues });

await order.make();
paradigm.orderStream.add(order).then(res => console.log(res));
//{txid: "4c7f58effb8ed3b4801dc0fe619a2ff262ab4f35ae8220f175ab02d5dc557249"}

//==================================  TAKE  ==================================

const paradigm = new Paradigm({ provider: web3.currentProvider, orderStream: 'os-dev.paradigm.market', networkId: await web3.eth.net.getId() });
const subContract = '0xd5c4a95a499e2b876ffefc6117a9d7d53223cb58';
const coinbase = await web3.eth.getCoinbase();

const TKA = "0xc8001ac8faed38171bd8960e2a177b2b80f1e9b0";
const TKB = "0x77ae4cded8c197b4c503895368f077ef6288462b";
const TKC = "0xb55b454e5f040d4c6f148d0590e767ba0dcbc615";

const order = await paradigm.orderStream.find("203a48e2347a933939d3ecc522135a509b690b480d569c86dbfc85ef04597572");

const takerValues = {
  tokensToBuy: 100 //any number <= makerTokenCount
};

const takerTransfer = paradigm.bank.createTransfer(subContract, TKB, coinbase, order.maker, order.makerValues.buyerTokenCount, Date.now());
takerValues.buyerTransfer = await paradigm.bank.createSignedTransfer(takerTransfer);

await paradigm.bank.giveMaxAllowanceFor(order.makerValues.buyerToken, coinbase);
order.take(coinbase, takerValues);


//============================================================================
//***********************************  0x  ***********************************
//============================================================================

//==================================  MAKE  ==================================

const paradigm = new Paradigm({ provider: web3.currentProvider, networkId: await web3.eth.net.getId() });
const zeroEx = new ZeroEx(web3.currentProvider, { networkId: await web3.eth.net.getId() });

const Order = paradigm.Order;
const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
const PROXY = zeroEx.proxy.getContractAddress();
const coinbase = await web3.eth.getCoinbase();

// Test token addresses
const TKA = "0xc8001ac8faed38171bd8960e2a177b2b80f1e9b0";
const TKB = "0x77ae4cded8c197b4c503895368f077ef6288462b";

const TKC = "0xb55b454e5f040d4c6f148d0590e767ba0dcbc615";
const subContract = '0x832d280ba9c92a3d84f015a7cd8cf5ca72bf2a95';

const zeroExOrder = {
  maker: coinbase,
  taker: ZeroEx.NULL_ADDRESS,
  feeRecipient: ZeroEx.NULL_ADDRESS,
  makerTokenAddress: TKA,
  takerTokenAddress: TKB,
  exchangeContractAddress: EXCHANGE_ADDRESS,
  salt: ZeroEx.generatePseudoRandomSalt(),
  makerFee: new BigNumber(0),
  takerFee: new BigNumber(0),
  makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(1), 60), // Base 18 decimals
  takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(1), 60), // Base 18 decimals
  expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000)
};

await zeroEx.token.setUnlimitedAllowanceAsync(TKA, coinbase, PROXY);

let toMakerValues = {};

Object.keys(zeroExOrder).forEach((key) => {
  toMakerValues[`order${key.replace(/^\w/, c => c.toUpperCase())}`] = zeroExOrder[key];
});

const ecSignature = await zeroEx.signOrderHashAsync(ZeroEx.getOrderHashHex(zeroExOrder), coinbase, true);
const makerValues = {
  ...toMakerValues,
  signatureV: ecSignature.v,
  signatureR: ecSignature.r,
  signatureS: ecSignature.s
};

const order = new Order({ subContract, maker: coinbase, makerValues });

await order.make();
paradigm.orderStream.add(order).then(res => console.log(res));

//==================================  TAKE  ==================================

const paradigm = new Paradigm({ provider: web3.currentProvider, networkId: await web3.eth.net.getId() });
const zeroEx = new ZeroEx(web3.currentProvider, { networkId: await web3.eth.net.getId() });

const coinbase = await web3.eth.getCoinbase();

// Test token addresses
const TKA = "0xc8001ac8faed38171bd8960e2a177b2b80f1e9b0";
const TKB = "0x77ae4cded8c197b4c503895368f077ef6288462b";
const TKC = "0xb55b454e5f040d4c6f148d0590e767ba0dcbc615";

const orderId = 'a6421eb9575ba94f3119e91c66696667defb14c1729d529e0d3026d31318e9e1';

const order = await paradigm.orderStream.find(orderId);

await zeroEx.token.setUnlimitedAllowanceAsync(TKB, coinbase, order.subContract);

const takerValues = {
  tokensToTake: 500,
  throwOnError: false,
  makerTokenReceiver: coinbase
};

await order.take(coinbase, takerValues);