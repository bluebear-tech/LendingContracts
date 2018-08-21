describe('Order', () => {
  let maker, taker, order, bank, Signature;

  before(async () => {
    bank = paradigm.bank;
    Signature = paradigm.Signature;
    Order = paradigm.Order;

    maker = accounts[7].toLowerCase();
    taker = accounts[8].toLowerCase();
    let makerArguments = await orderGateway.makerArguments(subContract);
    let takerArguments = await orderGateway.takerArguments(subContract);

    await bank.giveMaxAllowanceFor(TKA, maker);
    await bank.giveMaxAllowanceFor(TKB, taker);

    const makerTransfer = bank.createTransfer(subContract, TKA, maker, taker, 1000, Date.now());
    const signedMakerTransfer = await bank.createSignedTransfer(makerTransfer);

    let makerValues = {
      signer: maker,
      signerToken: TKA,
      signerTokenCount: 1000,
      buyer: taker,
      buyerToken: TKB,
      buyerTokenCount: 1000,
      signerTransfer: signedMakerTransfer,
    };

    order = new paradigm.Order({ subContract, maker: maker, makerArguments, takerArguments, makerValues });
    await order.make();
  });

  it('should have token balances and allowances setup for the following test', async () => {
    assert.isAbove(parseInt(await tka.balanceOf(maker)), 3000);
    assert.isAbove(parseInt(await tka.allowance(maker, bank.address)), 3000);
    assert.isAbove(parseInt(await tkb.balanceOf(taker)), 3000);
    assert.isAbove(parseInt(await tkb.allowance(taker, bank.address)), 3000);
  });

  describe('constructor()', () => {
    it("receives an array of args to send to the OrderGateway", () => {
      assert.equal(order.makerValues.signer, maker);
      assert.equal(order.makerValues.signerTokenCount, 1000);
      assert.equal(order.makerValues.buyerTokenCount, 1000);
    });

    it("receives an array of data types", async () => {
      let makerArguments = order.makerArguments;
      if(typeof makerArguments !== 'string') makerArguments = JSON.stringify(makerArguments);
      assert.equal(makerArguments, await orderGateway.makerArguments(subContract)); //TODO: update
    });

    it("receives a SubContract address", () => {
      assert.equal(order.subContract, subContract);
    });
  });

  describe('make()', () => {
    it("signs the order details and stores the vrs", async () => {
      let makerArguments = await orderGateway.makerArguments(subContract);
      let makerValues = {
        signer: maker,
        signerToken: TKA,
        signerTokenCount: 1000,
        buyer: taker,
        buyerToken: TKB,
        buyerTokenCount: 1000
      };
      let o2 = new Order({ subContract, maker: maker, makerArguments, makerValues });
      await o2.make();
      assert.equal(Signature.recoverAddress(o2.makerSignature), maker);
    });
  });

  describe('take()', () => {
    it("posts the order to the OrderGateway", async () => {
      const takerTransfer = bank.createTransfer(subContract, TKB, taker, maker, 1000, Date.now());
      const signedTakerTransfer = await bank.createSignedTransfer(takerTransfer);

      const takerValues = {
        tokensToBuy: 100,
        buyerTransfer: signedTakerTransfer
      };

      await order.take(taker, takerValues);

      const tka = SimpleERC20(TKA, await web3.eth.net.getId(), web3);
      assert.equal(await tka.balanceOf(taker), '100')
      const tkb = SimpleERC20(TKB, await web3.eth.net.getId(), web3)
      assert.equal(await tkb.balanceOf(maker), '100')
    });
  });

  describe('recoverMaker()', () => {
    it('should result in the maker', () => {
      order.recoverMaker().should.eq(maker);
    })

    it("recovers the maker address from the JSON used to initalize it", () => {
      let json = order.toJSON();
      let newOrder = new Order(json);
      newOrder.recoverMaker().should.eq(maker);
    })
  });

  describe('recoverPoster()', () => {
    it('returns the maker address if not signed by poster', () => {
      order.recoverPoster().should.eq(maker);
    });
  });

  describe('toJSON()', () => {
    it("converts the order to JSON", async () => {
      assert.equal(typeof JSON.stringify(order), 'string');
    });

    it('should have the required keys', () => {
      order.toJSON().should.contain.keys('subContract', 'maker', 'makerArguments', 'takerArguments', 'makerValues');
    })
  });

  describe('validateStake()', () => {
    it("NYI -- verifies the stake of the maker (or poster)");
  });

  describe('serialize()', () => {
    it('WRITE TESTS');
  });

  describe('checkDataTypes', () => {
    it('should pull data types if they are missing')
  });
});
