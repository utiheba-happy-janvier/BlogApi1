const express = require("express");
const Authorization = require("./Authorization");
const Comment = require("./model/Comment");
const Post = require("./model/Post");

const router = express.Router();

router.post("/:blogId", Authorization, async (req, res) => {
  const blog = await Post.findById({ _id: req.params.blogId });

  if (!blog) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  const comment = new Comment({
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment,
  });
  console.log(comment);
  //   const updated = await Post.findByIdAndUpdate(
  //     { _id: req.params.blogId },
  //     { $addToSet: { comments: [comment] } }
  //   );
  blog.comments.push(comment);

  const newPost = await blog.save();

  return res.status(201).json({
    message: "Comment posted successfully",
    blog,
    // updated,
  });
});

module.exports = router;
