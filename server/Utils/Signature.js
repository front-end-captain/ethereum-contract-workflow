const ethUtil = require("ethereumjs-util");

const signatureMsg = "I am signing my one-time nonce:";

const createSignatureMessage = (nonce) => {
  return `${signatureMsg}${nonce}`;
};

const handleSignature = (signature, nonce) => {
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

module.exports = { handleSignature, createSignatureMessage };