// kullanıcı email veya password girdi mi kontrol edilir
const bcrypt = require("bcryptjs");
const validateUserInput = (email, password) => {
  return email && password;
};
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { validateUserInput, comparePassword };
