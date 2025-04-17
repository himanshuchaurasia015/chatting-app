const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log("err while connecting database", err);
    });
};
module.exports = connect();
