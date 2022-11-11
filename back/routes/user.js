const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.get("/getById", userCtrl.getById);

module.exports = router;
