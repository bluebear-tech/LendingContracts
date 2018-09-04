var ParadigmStake = artifacts.require("./ParadigmStake.sol");

module.exports = function(deployer) {
  deployer.deploy(ParadigmStake);
};
