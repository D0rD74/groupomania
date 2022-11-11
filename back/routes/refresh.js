const express = require("express");
const router = express.Router();
const refreshToken = require("../controllers/refreshToken");

router.get("/refresh", refreshToken.handleRefreshToken);

module.exports = router;
