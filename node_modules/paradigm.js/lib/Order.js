const Signature = require('./Signature.js');
const utils = require('./utils');

class Order {

  // TODO:
  //   0. Get ParadigmContracts running on TestRPC
  //   1. Work out how to make/take deals ==> Set up a dummy SubContract to pass in
  //   2. web3 and orderGateway should be instantiated in some kind of Paradigm {} class.
  //   3. Paradigm should be either passed in or accessible everywhere
  constructor(options) {
    if(options.subContract === undefined) throw new Error('SubContract is required');

    this.subContract      = options.subContract;
    this.maker            = options.maker;
    this.makerArguments   = options.makerArguments; // -> makerArguments
    this.takerArguments   = options.takerArguments; // -> takerArguments
    this.makerValues      = options.makerValues;
    this.makerSignature   = options.makerSignature;
  }

  async make() {
    await this.checkDataTypes();
    const dataToSign = this.formatData();
    const signature = await Signature.generate(this.web3, dataToSign[0], dataToSign[1], this.maker);
    this.makerValues.signature = signature; // QUESTION: Why is this here vs. makerSignature?
    this.makerSignature = signature;
  }

  async take(taker, takerValues) {
    this.checkDataTypes();
    const makerValuesBytes = this.serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this.serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participate(this.subContract, makerValuesBytes, takerValuesBytes, taker)
  }

  recoverMaker() {
    return Signature.recoverAddress(this.makerSignature);
  }

  recoverPoster() {
    // TODO: Work out the logic here
    return Signature.recoverAddress(this.makerSignature);
  }

  toJSON() {
    return {
      subContract: this.subContract,
      maker: this.maker,
      makerArguments: this.makerArguments,
      takerArguments: this.takerArguments,
      makerValues: this.makerValues,
      makerSignature: this.makerSignature
    }
  }

  serialize(args, values) {
    const output = [];

    args.forEach((arg) => {
      if(arg.dataType === 'signature') {
        if(values.signature instanceof Signature) values.signature = values.signature.toJSON();
        output.push(utils.toBytes32(values.signature.v));
        output.push(utils.toBytes32(values.signature.r));
        output.push(utils.toBytes32(values.signature.s));
      } else if(arg.dataType === 'signedTransfer') {
        output.push(utils.toBytes32(values[arg.name].recipient));
        output.push(utils.toBytes32(values[arg.name].maxAmount));
        output.push(utils.toBytes32(values[arg.name].signature.v));
        output.push(utils.toBytes32(values[arg.name].signature.r));
        output.push(utils.toBytes32(values[arg.name].signature.s));
        output.push(utils.toBytes32(values[arg.name].nonce));
      } else {
        output.push(utils.toBytes32(values[arg.name]));
      }
    });

    return output;
  }

  async checkDataTypes() {
    /*
      Retrieves required arguments from subcontract
      if they are missing and parses JSON strings.
    */
    if(typeof this.makerArguments === 'undefined') this.makerArguments = await this.orderGateway.makerArguments(this.subContract);
    if(typeof this.takerArguments === 'undefined') this.takerArguments = await this.orderGateway.takerArguments(this.subContract);

    if(typeof this.makerArguments === 'string') this.makerArguments = JSON.parse(this.makerArguments);
    if(typeof this.takerArguments === 'string') this.takerArguments = JSON.parse(this.takerArguments);
  }

  formatData() {
    let dataTypes = [], values = [];
    this.makerArguments.forEach((argument) => {
      if (this.shouldInclude(argument)) {
        dataTypes.push(argument.dataType);
        values.push(this.makerValues[argument.name].toString());
      }
    });
    return [dataTypes, values];
  }

  shouldInclude(argument) {
    return this.makerValues[argument.name] != undefined && argument.dataType != 'signedTransfer';
  }
}

module.exports = Order;
