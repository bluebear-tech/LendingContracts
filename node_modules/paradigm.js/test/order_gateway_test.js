const OrderGateway = require('../lib/OrderGateway');

describe('OrderGateway', () => {
  let orderGateway;

  before(() => {
    orderGateway = paradigm.orderGateway;
  });

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
});