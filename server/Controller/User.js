const uuidv1 = require("uuid/v1");
const web3 = require("./../../libs/web3.js");
const { User, Log, Token } = require("./../Model/index.js");
const TokenUtil = require("./../Utils/Token.js");
const { verifySignature, createSignatureMessage } = require("./../Utils/Signature.js");

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
    if (!user) {
      ctx.body = { status: -1, message: "user not found, go register" };
      return;
    }

    const { nonce } = user;

    const log = new Log({
      type: 1,
      description: "user get nonce success",
      log: `user get nonce success, id: ${user.id}, name: ${
        user.name
      }, nonce: ${nonce}, publicAddress: ${publicAddress}`,
    });
    await log.save();

    ctx.body = {
      status: 1,
      message: "success",
      data: { nonce, signatureMessage: createSignatureMessage(nonce) },
    };
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
    const userId = uuidv1();

    const newUser = new User({
      id: userId,
      email,
      name,
      publicAddress,
      nonce,
    });
    await newUser.save();

    const log = new Log({
      type: 1,
      description: "user register success",
      log: `user registered success, id: ${userId}, name: ${name}, publicAddress: ${publicAddress}, nonce: ${nonce}`,
    });
    await log.save();

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
    const signaturedAddress = verifySignature(signature, nonce);

    if (signaturedAddress.toLowerCase() !== publicAddress) {
      ctx.status = 401;
      ctx.body = { status: -1, message: "Signature verification failed" };
      return;
    }

    const targetUserInToken = await Token.findOne({ id: user.id });
    const token = TokenUtil.createToken();

    if (targetUserInToken) {
      await Token.updateOne({ id: user.id }, { token });
    } else {
      const tokenDoc = new Token({
        id: user.id,
        token,
      });
      await tokenDoc.save();
    }
    
    // 更新 nonce
    await User.updateOne({ publicAddress }, { nonce: Math.floor(Math.random() * 1000000) });

    const log = new Log({
      type: 1,
      description: "user authentication success",
      log: `user authentication success id: ${user.id}, name: ${
        user.name
      }, publicAddress: ${publicAddress}, email: ${user.email}`,
    });
    await log.save();

    ctx.body = {
      status: 1,
      message: "success",
      data: {
        id: user.id,
        nonce: user.nonce,
        publicAddress: user.publicAddress,
        name: user.name,
        email: user.email,
        token,
      },
    };
  }
}

module.exports = new UserController();
