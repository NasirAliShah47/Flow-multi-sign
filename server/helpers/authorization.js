const { SHA3 } = require("sha3");

var EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// private key for the emulator address

const PRIVATE_KEY = "e26834a635cbd723a8a2c45d51f7dbe8b490cc6f52e2491f6b7dd907387e2bfb";

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