const uuidv1 = require("uuid/v1");
const web3 = require("./../../libs/web3.js");
const { User } = require("./../Model/index.js");
const TokenUtil = require("./../Utils/Token.js");
const { handleSignature, createSignatureMessage } = require("./../Utils/Signature.js");

class UserController {
  // GET /user/nonce/:publicAddress
  async getNonce(ctx) {
    let { publicAddress } = ctx.params;
    publicAddress = publicAddress.toLowerCase();
    if (!web3.utils.isAddress(publicAddress)) {
      ctx.body = { status: -1, message: "The address is not validate" };
      return;
    }

    const user = await User.findOne({ publicAddress });
    if (user) {
      const { nonce } = user;
      ctx.body = {
        status: 1,
        message: "success",
        data: { nonce, signatureMessage: createSignatureMessage(nonce) },
      };
      return;
    }

    ctx.body = { status: -1, message: "user not found, go register" }
  }

  async register(ctx) {
    const { email, name } = ctx.request.body;
    let { publicAddress } = ctx.request.body;
    publicAddress = publicAddress.toLowerCase();
    if (!email || !name) {
      ctx.status = 400;
      ctx.body = { status: -1, message: "The params is missing value" };
      return;
    }

    if (!web3.utils.isAddress(publicAddress)) {
      ctx.body = { status: -1, message: "The address is not validate" };
      return;
    }

    const user = await User.findOne({ publicAddress });
    if (user) {
      ctx.body = { status: -1, message: "the user has already registered" };
      return;
    }

    const nonce = Math.floor(Math.random() * 1000000);

    const newUser = new User({
      id: uuidv1(),
      email,
      name,
      publicAddress,
      nonce,
    });
    await newUser.save();

    const signatureMessage = createSignatureMessage(nonce);
    ctx.body = { status: 1, message: "success", data: { nonce, signatureMessage } };
  }

  // POST /user/auth
  // params: publicAddress, signature
  async auth(ctx) {
    let { publicAddress, signature } = ctx.request.body;
    publicAddress = publicAddress.toLowerCase();
    signature = signature.toLowerCase();
    if (!publicAddress || !signature) {
      ctx.body = { status: -1, message: "The params is missing value" };
      return;
    }

    if (!web3.utils.isAddress(publicAddress)) {
      ctx.body = { status: -1, message: "the publicAddress is not validate" };
      return;
    }

    const user = await User.findOne({ publicAddress });
    if (!user) {
      ctx.body = { status: -1, message: "the user is not found" };
      return;
    }

    const { nonce } = user;
    const signaturedAddress = handleSignature(signature, nonce);

    if (signaturedAddress.toLowerCase() !== publicAddress) {
      ctx.status = 401;
      ctx.body = { status: -1, message: "Signature verification failed" };
      return;
    }

    const token = TokenUtil.createToken();

    // 更新 nonce
    await User.updateOne({ publicAddress }, { nonce: Math.floor(Math.random() * 1000000) });

    ctx.body = {
      status: 1,
      message: "success",
      data: {
        id: user._doc.id,
        nonce: user._doc.nonce,
        publicAddress: user._doc.publicAddress,
        name: user._doc.name,
        email: user._doc.email,
        token,
      },
    };
  }
}

module.exports = new UserController();
