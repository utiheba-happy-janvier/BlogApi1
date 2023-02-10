const router = require("express").Router();
//const Joi = require('joi');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Users = require("./model/User");

require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (password.length < 6 || password.length > 12) {
      return res.status(400).json({
        status: "failed",
        error: "Password range is between 6 to 12 characters only",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        status: "fail",
        error: "Input a valid email for new user",
      });
    }
    const users = await Users.findOne({ email: req.body.email });
    if (users) {
      return res.status(400).json({
        status: "fail",
        error: "Email is in use",
      });
    }
    //Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const saveUser = await user.save();
    res.status(201).json({
      token,
      user: saveUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      error: "Email and password  field are required",
    });
  }
  const users = await Users.findOne({ email: req.body.email });
  if (!users)
    return res.status(404).json({
      status: "fail",
      error: "Incorrect email or password",
    });
  const validPass = await bcrypt.compare(req.body.password, users.password);
  if (!validPass) {
    return res.status(400).json({
      status: "fail",
      error: "Incorrect email or password",
    });
  }

  //create and assign a token
  const token = jwt.sign({ id: users._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return res.status(200).json({
    token,
    message: "Login success",
  });
});

module.exports = router;
