
const config = {
  networks: {
  }
};

if(process.env.keystore_password) {
  const WalletProvider = require("truffle-wallet-provider");
  const keystore = require('./keystore.json');
  const wallet = require('ethereumjs-wallet').fromV3(keystore, process.env.keystore_password);

  config.networks.staging = {
      network_id: 3,
      gas: 4600000,
      gasPrice: 40000000000,
      provider: new WalletProvider(wallet, "https://ropsten.infura.io")
  }
}

module.exports = config;
