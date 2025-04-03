const mongoose = require("mongoose");

const conntectToDatabase = () => {
  mongoose
    .connect(process.env.MONGOOSE_URL, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 90000,
    })
    .then(() => {
      console.log("Connection is succesfull");
    })
    .catch((err) => {
      console.log("Connection is unsuccesfull");
      console.error(err);
    });
};
module.exports = conntectToDatabase;
