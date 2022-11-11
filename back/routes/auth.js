const express = require("express");
const router = express.Router();
const logout = require("../controllers/logout");
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);

router.post("/login", userCtrl.login);

router.get("/logout", logout.handleLogout);

module.exports = router;
