const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const handleRefreshToken = async (req, res) => {
  const cookies = req.session;
  if (!cookies?.refresh_token) return res.sendStatus(401);
  const refreshToken = cookies.refresh_token;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
    const roles = Object.values(foundUser.roles);
    const _id = foundUser._id;
    const xsrfToken = crypto.randomBytes(64).toString("hex");
    const accessToken = jwt.sign(
      /*{ firstName: user.firstName, lastName: user.lastName },*/
      {
        UserInfo: {
          id: decoded.id,
          email: decoded.email,
          roles: roles,
          xsrfToken,
        },
      },
      process.env.ACCESS_TOKEN,
      {
        algorithm: process.env.ALGORITHM,
        audience: process.env.AUDIENCE,
        issuer: process.env.ISSUER,
        expiresIn: Number(process.env.EXPIRES_IN) / 1000,
        subject: foundUser._id.toString(),
      }
    );

    res.json({
      roles,
      _id,
      accessToken,
    });
  });
};

module.exports = { handleRefreshToken };
