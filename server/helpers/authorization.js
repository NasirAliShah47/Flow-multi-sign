const { SHA3 } = require("sha3");

var EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const PRIVATE_KEY = "abcf931bf868f2eeced45b36fad401cb516e7bce1ca66b6609797aede3ab24a0";

const sign = (message) => {
    const key = ec.keyFromPrivate(Buffer.from(PRIVATE_KEY, "hex"));
    const sig = key.sign(hash(message)); // hashMsgHex -> hash
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
}

const hash = (message) => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(message, "hex"));
    return sha.digest();
}

module.exports = {
    sign
}