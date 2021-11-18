const JWT = require("jsonwebtoken");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongo = require('../manager/mongoManager');

const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = 10;
const clientURL = process.env.CLIENT_URL;


exports.requestPasswordReset = async (email) => {
  const user = await mongo.getUser(email);
  console.log(user);
  if (!user) {
    return false;
  }

  let token = await mongo.getToken(user._id);
  if (token) await mongo.deleteToken(user._id);

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  const tokenTab = {
    "_id": resetToken,
    "userId": user._id,
    "token": hash,
    "createdAt": Date.now(),
  };

  await mongo.pushToken(tokenTab);


  const link = `http://localhost:7000/passwordReset?token=${resetToken}&id=${user.mail}`;

  sendEmail(
    user.mail,
    "Password Reset Request",
    {
      name: user.name,
      link: link,
    },
    "./template/requestResetPassword.handlebars"
  );
  return true;
};

exports.resetPassword = async (userId, token, password) => {
  let user = await mongo.getUser(userId);
  let passwordResetToken = await mongo.getToken(user._id);

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await bcrypt.hash(password, bcryptSalt);
  console.log(hash);
  user.password = hash ;

  await mongo.updateUser(user);


  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await mongo.deleteToken(`loccker:${userId}`);

  return true;
}