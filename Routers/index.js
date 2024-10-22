const express = require("express");
const router = express.Router();
const user = require("./userRouter");
const auth = require("./authRouter");
const posts = require("./postRouter");
const category = require("./categoryRouter");

router.use("/user", user);
router.use("/auth", auth);
router.use("/posts", posts);
router.use("/category", category);
module.exports = router;
