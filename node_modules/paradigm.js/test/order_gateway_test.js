const OrderGateway = require('../lib/OrderGateway');

describe('OrderGateway', () => {
  describe('participate()', () => {
    it('should participate in a fully constructed Order.');
  });

  describe('makerArguments()', () => {
    it('should get the makerArguments of a SubContract', async () => {
      const makerArguments = await orderGateway.makerArguments(subContract);
      assert.doesNotThrow(() => { JSON.parse(makerArguments) });
    });
  });

  describe('takerArguments()', () => {
    it('should get the takerArguments of a SubContract', async () => {
      const takerArguments = await orderGateway.takerArguments(subContract);
      assert.doesNotThrow(() => { JSON.parse(takerArguments) });
    });
  });

  describe('paradigmBank()', () => {
    it('should get the paradigmBank address', async () => {
      (await orderGateway.paradigmBank()).should.eq(paradigm.bank.address)
    })
  });

  describe('constructor()', () => {
    let utils;

    before(() => {
      utils = paradigm.utils;
    });

    it('should accept a custom orderGatewayAddress', async () => {
      const testInstance = new OrderGateway({ orderGatewayAddress: utils.NULL_ADDRESS, web3 });
      testInstance.address.should.eq(utils.NULL_ADDRESS);
    });
  })
});