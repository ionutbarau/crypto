const hexToBinary = require('hex-to-binary');
const{GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptoHash} = require('../util');

class Block {
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        //hash of the previous block
        this.lastHash = lastHash;
        //computed value based on SHA256(timestamp,lastHash,data,nonce, difficulty)
        this.hash = hash;
        this.data = data;
        //also called number used once, that is used in mining to generate the hash until it reaches the difficulty level
        this.nonce=nonce;
        //the number of leading zeros that the binary form of the hash has to have in order to be the result of the mining operations
        this.difficulty=difficulty;
    }

    static genesis(){
        return new Block(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data}){
        let hash, timestamp;
        const lastHash=lastBlock.hash;
        let {difficulty} = lastBlock;
        let nonce=0;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({originalBlock:lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        }while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        return new Block({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        })
    }

    static adjustDifficulty({originalBlock, timestamp}){
        const {difficulty} = originalBlock;
        //difficulty should never be 0
        if(difficulty < 1){
            return 1;
        }
        if(timestamp - originalBlock.timestamp > MINE_RATE){
            return difficulty - 1;
        }
        return difficulty + 1;
    }
}


module.exports = Block;
