const Block = require('./block');
const {cryptoHash} = require('../util');
const{REWARD_INPUT, MINING_REWARD} = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain{
    constructor() {
        this.chain=[Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({
            lastBlock:this.chain[this.chain.length-1],
            data
        })
        this.chain.push(newBlock);
    }

    replaceChain(chain, validateTransactions, onSuccess){
        if(chain.length <= this.chain.length){
            console.error('The incoming chain must be longer');
            return;
        }
        if(!Blockchain.isValidChain(chain)){
            console.error('The incoming chain must be valid');
            return;
        }

        if(validateTransactions && !this.validTransactionData({chain})){
            console.error('The incoming chain has invalid transaction data');
            return;
        }

        if(onSuccess) onSuccess();
        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    validTransactionData({chain}){
        for(let i = 1; i<chain.length; i++){
            const block = chain[i];
            let rewardTransactionCount = 0;
            //used for not allowing duplicated transactions
            const transactionSet = new Set();
            for(let transaction of block.data){
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount += 1;
                    if(rewardTransactionCount > 1){
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                }else{
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid transaction');
                        return false;
                    }
                    //calculate true balance based on existing chain (not the received chain)
                    const trueBalance = Wallet.calculateBalance({chain:this.chain, address:transaction.input.address});
                    if(transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transaction appears more than once in the block');
                        return false;
                    }else{
                        transactionSet.add(transaction);
                    }
                }
            }
        }
        return true;
    }

    static isValidChain(chain){
        //check if it has genesis as first block
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i= 1; i<chain.length; i++){
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];
            const previousBlock = chain[i-1];

            //current block's lastHash has to match
            if(lastHash !== previousBlock.hash){
                return false;
            }
            //current block's hash has to match with the one generated from the current block's fields
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if(hash !== validatedHash){
                return false;
            }
            //difficulty should not jump. if we allow this, some bad actor could create blocks on the chain with a lower
            //difficulty to do easy mining ot higher difficulty to slow down mining.
            if(Math.abs(previousBlock.difficulty - difficulty) > 1){
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;
