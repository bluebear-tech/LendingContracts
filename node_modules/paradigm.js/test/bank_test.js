const Bank = require('../lib/Bank');

describe('Bank', () => {
  let bank;

  before(() => {
    bank = paradigm.bank;
  });

  describe('constructor', () => {
    it('should be created properly', () => {
      const testBank = new Bank('web3', 'orderGateway');

      testBank.web3.should.eq('web3');
      testBank.orderGateway.should.eq('orderGateway');
      testBank.MAX_UINT.toString().should.eq(bank.MAX_UINT.toString());
    });
  });

  describe('giveMaxAllowanceFor()', () => {
    it('should set allowance to max uint value', async () => {
      await bank.giveMaxAllowanceFor(TKA, accounts[0]);
      (await tka.allowance(accounts[0], bank.address)).should.eq(bank.MAX_UINT.toString());
    });
  });

  describe('giveAllowanceFor()', () => {
    it('should set allowance to max uint value', async () => {
      await bank.giveAllowanceFor(TKA, 500, accounts[0]);
      (await tka.allowance(accounts[0], bank.address)).should.eq('500');
    });
  });

  describe('createTransfer()', () => {
    it('should build a transfer hash', () => {
      bank.createTransfer('a', 'b', 'c', 'd', 1, 2).should.deep.eq({
        transferer: 'a',
        tokenAddress: 'b',
        tokenHolder: 'c',
        recipient: 'd',
        maxAmount: 1,
        nonce: 2
      });
    });

    it('should change null recipient to null address', () => {
      bank.createTransfer('a', 'b', 'c', null, 1, 1).recipient
        .should.eq(paradigm.utils.NULL_ADDRESS)
    });
  });

  describe('createSignedTransfer()', () => {
    it('should add a valid Signature to the transfer hash', async () => {
      const transfer = bank.createTransfer(TKA, TKA, accounts[0], TKA, 0, 0);

      const signedTransfer = await bank.createSignedTransfer(transfer);
      signedTransfer.should.contain.keys(transfer);
      signedTransfer.signature.should.contain.keys('v', 'r', 's')
    });
  });

  describe('checkAddress()', () => {
    it('should set the bank address from the orderGateway', async () => {
      const expectedAddress = await orderGateway.paradigmBank();

      const testBank = new Bank(web3, orderGateway);
      assert.equal(testBank.address, undefined);
      await testBank.checkAddress();
      testBank.address.should.eq(expectedAddress);
    });
  })
});