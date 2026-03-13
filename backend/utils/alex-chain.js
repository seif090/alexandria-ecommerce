const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');

/**
 * Alex-Chain: A Local Merchant Distributed Ledger
 * Purpose: Secure, Immutable "Proof of Pickup" for clearance items in Alexandria.
 * Prevents double-claiming and merchant disputes.
 */

const blockSchema = new mongoose.Schema({
  index: Number,
  timestamp: { type: Date, default: Date.now },
  orderId: String,
  vendorId: String,
  buyerId: String,
  previousHash: String,
  hash: String,
  nonce: Number
});

const Block = mongoose.model('Block', blockSchema);

class AlexChain {
  constructor() {
    this.difficulty = 2; // Alexandria Proof-of-Work
  }

  async calculateHash(index, previousHash, timestamp, data, nonce) {
    return CryptoJS.SHA256(
      index + previousHash + timestamp + JSON.stringify(data) + nonce
    ).toString();
  }

  async mineBlock(orderId, vendorId, buyerId) {
    const lastBlock = await Block.findOne({}, {}, { sort: { 'index': -1 } });
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const previousHash = lastBlock ? lastBlock.hash : "ALEXANDRIA_GENESIS_BLOCK";
    const timestamp = new Date();
    const data = { orderId, vendorId, buyerId };
    
    let nonce = 0;
    let hash = "";
    
    // Simple Proof of Work to secure the pickup
    while (true) {
      hash = await this.calculateHash(index, previousHash, timestamp, data, nonce);
      if (hash.substring(0, this.difficulty) === Array(this.difficulty + 1).join("0")) {
        break;
      }
      nonce++;
    }

    const newBlock = new Block({
      index,
      timestamp,
      orderId,
      vendorId,
      buyerId,
      previousHash,
      hash,
      nonce
    });

    await newBlock.save();
    return newBlock;
  }

  async verifyChain() {
    const blocks = await Block.find().sort({ index: 1 });
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // Verify Hash
      const data = { orderId: currentBlock.orderId, vendorId: currentBlock.vendorId, buyerId: currentBlock.buyerId };
      const recalculatedHash = await this.calculateHash(
        currentBlock.index, 
        currentBlock.previousHash, 
        currentBlock.timestamp, 
        data, 
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }
}

module.exports = new AlexChain();
