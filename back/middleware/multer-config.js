const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    let str = req.originalUrl;
    let n = str.lastIndexOf("/");
    let result = str.substring(n + 1);
    const userId = req.auth.userId;
    switch (result) {
      default:
        fs.mkdirsSync("./public/assets/images");
        callback(null, "./public/assets/images");
        break;
      case "newP":
        fs.mkdirsSync(`./public/assets/images/users/${userId}/posts`);
        callback(null, `./public/assets/images/users/${userId}/posts`);
        break;
      case "editP":
        fs.mkdirsSync(`./public/assets/images/temp`);
        callback(null, `./public/assets/images/temp`);
        break;
    }
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    callback(null, uuidv4() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
