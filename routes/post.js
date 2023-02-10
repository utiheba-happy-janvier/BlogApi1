const express = require("express");
const router = express.Router();
const Post = require("../routes/model/Post");
const Authorization = require("./Authorization");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

let upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

const uploadToCloud = async (file, res) => {
  try {
    const profilePicture = await cloudinary.uploader.upload(file.path, {
      folder: "image",
      use_filename: true,
    });
    return profilePicture;
  } catch (error) {
    return res.status(500).send(error);
  }
};

//find all post
router.get("/", async (req, res) => {
  try {
    const post = await Post.find();
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});
//creating posts
router.post("/", Authorization, upload.single("image"), async (req, res) => {
  try {
    const result = await uploadToCloud(req.file, res);
    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      image: result.secure_url,
    });
    return res.json({ message: "success", post: post });
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
  //GET POST BY ID
});
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

//delete post
router.delete("/:postId", Authorization, async (req, res) => {
  try {
    const removedpost = await Post.remove({ _id: req.params.postId });
    res.json(removedpost);
  } catch (err) {
    res.json({ message: err });
  }
});

//update posts

router.patch("/:postId", Authorization, async (req, res) => {
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title, description: req.body.description } }
    );
    res.status(200).json({
      message: "Update success",
    });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
