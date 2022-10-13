const { SHA3 } = require("sha3");

var EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// private key for the emulator address

const PRIVATE_KEY = "9d5eb0cd86058533fd80182afe28af34056de5d0df075190504e2772fdf1c1f8";

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