const Post = require("../models/post");
const fs = require("fs");

function security(obj) {
  let err = 0;
  if (obj.message.length > 500)
    return "Length of message should be 500 maximum.";
  if (obj.message.length < 4) return "Length of message should be 4 minimum.";
  if (err > 0) return "Security problem with the value of your inputs";

  return false;
}

// Save a new post
exports.addPost = (req, res, next) => {
  console.log(req.auth);
  const postObject = req.body;
  let err = security(postObject);
  if (err)
    return res.status(422).json({
      message: err,
    });

  let imageUrl = req.file !== undefined ? req.file.filename : "";

  const post = new Post({
    ...postObject,
    author: req.auth.userId, // Recover the user id with the auth middleware
    imageUrl: imageUrl,
    likes: Number(0),
    dislikes: Number(0),
  });
  post
    .save()
    .then(() => res.status(201).json({ message: "Post saved successfully !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Get all posts
exports.getAllPosts = (req, res, next) => {
  Post.find({})
    .populate({ path: "author", select: "firstName lastName" })
    .then((posts) => {
      console.log("test");
      posts.forEach((post) => {
        // If post have an image
        if (post.imageUrl !== "") {
          // Add image path to posts object
          let path = `assets/images/users/${post.author._id}/posts/${post.imageUrl}`;
          post.imageUrl = `${req.protocol}://${req.get("host")}/${path}`;
        }
      });
      return res.status(200).json(posts);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Get one post by params.id
exports.getById = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(404).json({ error }));
};

// Edit one post by params.id
exports.edit = (req, res, next) => {
  const postObject = req.file
    ? {
        ...req.body,
        imageUrl: req.file.filename,
      }
    : { ...req.body };

  Post.findOne({ _id: req.params.id })
    .then((post) => {
      // test if the userId of post object is the user authentified and if the user is not admin
      if (post.author != req.auth.userId && req.auth.roles[0] < 50) {
        if (
          fs.existsSync(`${process.env.IMG_TEMP_FOLDER}${postObject.imageUrl}`)
        )
          // Delete the temp image because multer middleware act before this script
          fs.unlink(
            `${process.env.IMG_TEMP_FOLDER}${postObject.imageUrl}`,
            (err) => {
              if (err) {
                return res.status(422).json({
                  message: err,
                });
              }
            }
          );

        res.status(401).json({ message: "Not authorized" });
      } else {
        // Delete the previous image and move the new image from temp folder
        if (postObject.imageUrl !== undefined) {
          let path = `public/assets/images/users/${post.author}/posts/${post.imageUrl}`;
          if (fs.existsSync(path))
            fs.unlink(path, (err) => {
              if (err) {
                return res.status(422).json({
                  message: err,
                });
              }
            });

          if (
            fs.existsSync(
              `${process.env.IMG_TEMP_FOLDER}${postObject.imageUrl}`
            )
          )
            fs.rename(
              `${process.env.IMG_TEMP_FOLDER}${postObject.imageUrl}`,
              `public/assets/images/users/${post.author}/posts/${postObject.imageUrl}`,
              function (err) {
                if (err) throw err;
              }
            );
        }
        let err = security(postObject);
        if (err)
          return res.status(422).json({
            message: "Security problem with the value of your inputs",
          });

        Post.updateOne(
          { _id: req.params.id },
          { ...postObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Post edited !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Delete post by params.id
exports.delete = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      // if the userId of post object is not the user authentified and if the user is not admin
      if (post.author != req.auth.userId && req.auth.roles[0] < 50)
        // Je devrais faire un indexOf à la place
        return res.status(401).json({ message: "Not authorized" });

      // Delete the previous image
      if (post.imageUrl !== undefined) {
        let path = `public/assets/images/users/${post.author}/posts/${post.imageUrl}`;
        let fileExist = fs.existsSync(path);
        if (fileExist)
          fs.unlink(path, (err) => {
            if (err) {
              return res.status(500).json({
                message: err,
              });
            }
          });
      }

      Post.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Post deleted !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Like a post, and update array of the historic of user's likes for this post.
exports.like = (req, res, next) => {
  const postObject = { ...req.body };
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      let likesIndex = post.usersLiked.indexOf(req.auth.userId);
      if (postObject.like === 1) {
        // If like
        if (likesIndex !== -1) return alert("This post is already liked.");
        post.usersLiked.push(req.auth.userId);
        post.likes += 1;
      } else if (postObject.like === 0) {
        // If Unlike
        if (likesIndex !== -1) {
          // Unlike
          post.likes -= 1;
          post.usersLiked.splice(likesIndex, 1);
        }
      }
      Post.updateOne(
        { _id: req.params.id },
        {
          ...postObject,
          _id: req.params.id,
          likes: post.likes,
          usersLiked: post.usersLiked,
        }
      )
        .then(() => {
          res.status(200).json({
            data: {
              message: "Like edited !",
              usersLiked: post.usersLiked,
              likes: post.likes,
            },
          });
        })
        .catch((error) => res.status(401).json({ error }));
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
