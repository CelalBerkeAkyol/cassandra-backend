const mongoose = require("mongoose");

const conntectToDatabase = () => {
  mongoose
    .connect(process.env.MONGOOSE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      retryWrites: true,
      w: "majority",
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
