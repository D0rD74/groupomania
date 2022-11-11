const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const { headers } = req;
    const cookies = req.session;

    if (!cookies || !cookies.access_token) {
      return res.status(401).json({
        message: "Missing token in cookie",
      });
    }

    const accessToken = cookies.access_token;

    if (!headers || !headers["x-xsrf-token"]) {
      return res.status(401).json({ message: "Missing XSRF token in headers" });
    }

    const xsrfToken = headers["x-xsrf-token"];

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN, {
      algorithms: process.env.ALGORYTHM,
    });

    if (xsrfToken !== decodedToken.UserInfo.xsrfToken) {
      return res.status(401).json({ message: "Bad xsrf token" });
    }

    req.auth = {
      userId: decodedToken.UserInfo.id,
      roles: decodedToken.UserInfo.roles,
    };

    return next();
  } catch (error) {
    res.status(500).json({ message: "internal error" });
  }
};
