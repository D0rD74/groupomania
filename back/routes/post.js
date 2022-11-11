const express = require("express");
const router = express.Router();
const multer = require("../middleware/multer-config");

const postCtrl = require("../controllers/post");

const auth = require("../middleware/auth");

router.get("/", postCtrl.getAllPosts);
router.get("/:id", auth, postCtrl.getById);
router.put("/:id/editP", auth, multer, postCtrl.edit);
router.delete("/:id/delete", auth, postCtrl.delete);
router.post("/newP", auth, multer, postCtrl.addPost);
router.post("/:id/like", auth, postCtrl.like);

module.exports = router;
