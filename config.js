//it is the threshold used for adjusting the mining operation difficulty level.
//it is the rate at which mining takes place
//if the time difference between 2 blocks is longer than MIN_RATE, the difficulty is lowered, else it is raised.
const MINE_RATE=1000; //milliseconds
//initial number of leading zeros in the binary form of the generated hash
const INITIAL_DIFFICULTY=3;
//the initial block
const GENESIS_DATA={
    timestamp:1,
    lastHash:'-----',
    hash:'hash-one',
    difficulty:INITIAL_DIFFICULTY,
    nonce:0,
    data:[]
};

const STARTING_BALANCE = 1000;

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE};
