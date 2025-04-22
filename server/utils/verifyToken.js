const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
