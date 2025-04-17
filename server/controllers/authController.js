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
    console.log(req.body);
    const user = await User.findOne({ mobileNumber: mobileNumber });
    if (user) {
      return res.json({
        msg: "User already exist",
      });
    }
    const newUser = await User.create({ mobileNumber, email, password, name });

    return res.json({
      user: newUser,
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
    await bcrypt.compare(password, user.password);
    const token = jwt.sign(
      { _id: user._id, name: user.name, email },
      "jhguygygbhbuyh7tdfxgvjhbuhdfj"
    );

    return res.json({
      user,
      token,
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
