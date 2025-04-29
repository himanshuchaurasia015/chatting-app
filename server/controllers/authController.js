const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const verify = async (req, res) => {
  try {
    let { _id: userId } = req.user;

    const user = await User.findById(userId);
    if (user) {
      return res.json({
        user,
        exist: true,
      });
    }
    return res.json({
      exist: false,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const register = async (req, res) => {
  try {
    let { mobileNumber, email, password, name } = req.body;
    console.log("hello", req.body);
    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        msg: "User already exist",
      });
    }
    const newUser = await User.create({ mobileNumber, email, password, name });
    console.log(newUser);
    const token = jwt.sign(
      { _id: newUser._id, name: newUser.name, email },
      process.env.JWT_SECRET
    );
    console.log({
      user: newUser,
      token,
    });
    return res.json({
      user: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        msg: "User not exist",
      });
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        { _id: user._id, name: user.name, email },
        process.env.JWT_SECRET
      );

      return res.status(200).json({
        user,
        token,
      });
    }
    return res.status(401).json({
      msg: "check email or password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Check email or password" });
  }
};

const users = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
module.exports = { verify, register, users, getUser, login };
