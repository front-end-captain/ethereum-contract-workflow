const JWT = require("jwt-simple");
const Day = require("dayjs");
const { Log, Token } = require("./../Model/index.js");

const SECRET = { key: "viking" };
Object.freeze(SECRET);
class TokenUtil {
  static createToken() {
    // 过期时间为当前时间点之后的 24 小时之后 单位: ms
    const expireTime = Day().add(1, 'days').valueOf();
    const payload = { expire: expireTime };
    return JWT.encode(payload, SECRET.key);
  };

  static async checkToken(token) {
    if (!token) {
      return false;
    }

    const targetUser = await Token.findOne({ token });
    if (!targetUser) {
      return false;
    }

    let decode = null;

    // 捕获验证签名失败的异常
    try {
      decode = JWT.decode(token, SECRET.key);
    } catch (error) {
      const log = new Log({
        type: 1,
        description: "Signature verification failed",
        log: error.message || 'Signature verification failed',
      });
      await log.save();
      return false;
    }

    // 24 * 60 * 60 * 1000 = 86400000
    if ((decode.expire + 86400000) < Date.now()) {
      return false;
    }

    return true;
  }
}

module.exports = TokenUtil;
