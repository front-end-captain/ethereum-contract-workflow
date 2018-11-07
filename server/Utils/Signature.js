const ethUtil = require("ethereumjs-util");

const signatureMsg = "I am signing my one-time nonce:";

/**
 * 返回用户签名的信息
 * 
 * @param {number} nonce 用户签名 nonce
 * @returns {string}
 */
const createSignatureMessage = (nonce) => {
  return `${signatureMsg}${nonce}`;
};

/**
 * 对用户的签名进行验证 返回验证签名的地址
 * 
 * @param {string} signature 用户签名
 * @param {number} nonce 用户签名的 nonce
 * 
 * @returns {string} address 验证签名的用户地址
 */
const verifySignature = (signature, nonce) => {
  const msg = createSignatureMessage(nonce);

  // We now are in possession of msg, publicAddress and signature. We
  // can perform an elliptic curve signature verification with ecrecover
  const msgBuffer = ethUtil.toBuffer(msg);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
  const signatureBuffer = ethUtil.toBuffer(signature);
  const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
  const publicKey = ethUtil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s,
  );
  const addressBuffer = ethUtil.publicToAddress(publicKey);
  const address = ethUtil.bufferToHex(addressBuffer);

  return address;
};

module.exports = { verifySignature, createSignatureMessage };
