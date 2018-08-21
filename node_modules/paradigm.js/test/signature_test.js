const Signature = require('../lib/Signature.js');

describe('Signature', () => {
  describe('generate()', () => {
    it('generates a signature given an array of data types and an array of values', async () => {
      const dataTypes = ['address', 'address', 'uint', 'uint', 'address'];
      const values = [accounts[1], accounts[2], 42, 57, accounts[3]];
      const signer = accounts[5];

      let signature = await Signature.generate(web3, dataTypes, values, signer);
      assert.equal(typeof signature, 'object');
    });
  });

  describe('validate()', () => {
    it('should validate a signature signer is equal to its recovered address', async () => {
      const dataTypes = ['address', 'address', 'uint', 'uint', 'address'];
      const values = [accounts[1], accounts[2], 42, 57, accounts[3]];
      const signer = accounts[5];

      let signature = await Signature.generate(web3, dataTypes, values, signer);
      assert.equal(Signature.validate(signature), signature.signer === signer.toLowerCase());
    });

    it('should validate a signature signer is not equal to recovered address', async () => {
      const dataTypes = ['address', 'address', 'uint', 'uint', 'address'];
      const values = [accounts[1], accounts[2], 42, 57, accounts[3]];
      const signer = accounts[5];

      let signature = await Signature.generate(web3, dataTypes, values, signer);

      signature.signer = 'milk';
      Signature.validate(signature).should.equal(signature.signer === signer.toLowerCase());
    });
  });

  describe('sign()', () => {

  });

  describe('', () => {

  });

  describe('', () => {

  });

  describe('', () => {

  });

  describe('', () => {

  });
});
