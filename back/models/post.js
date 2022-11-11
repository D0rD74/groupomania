const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, required: true },
  imageUrl: { type: String, required: false },
  likes: { type: Number, required: false },
  usersLiked: { type: Array, required: false },
});

module.exports = mongoose.model("Post", postSchema);
