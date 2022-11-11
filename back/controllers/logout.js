const User = require("../models/user");

const handleLogout = async (req, res) => {
  const cookies = req.session;
  if (!cookies?.access_token) return res.sendStatus(204); // No content
  const refreshToken = cookies.access_token;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    req.session.destroy();
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  req.session.destroy();
  res.sendStatus(204);
};

module.exports = { handleLogout };
