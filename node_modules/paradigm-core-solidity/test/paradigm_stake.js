const ParadigmStake = artifacts.require("./ParadigmStake.sol");

contract('ParadigmStake', async (accounts) => {
  let paradigmStake;
  before(async () => {
    paradigmStake = await ParadigmStake.deployed();
  });

  describe('stakeFor', () => {
    it('should allow transferFromSignature on valid signatures', async () => {
      (await paradigmStake.stakeFor.call(accounts[1])).toString().should.eq(web3.toWei('1'))
    });
  });
});