const router = require("express").Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { INVALID_PH_NO, PASSWORD_LENGTH, INVALID_PASSWORD, USER_NOT_EXIST, USER_EXISTS } = require("../../constants/errors/authError");

//REGISTER
router.post("/register", async (req, res) => {
  //Validation
  if (req.body.phoneNumber.length != 10) return res.status(400).send({ message: INVALID_PH_NO, errorCode: 400 });
  if (req.body.password.length < 8) return res.status(400).send({ message: PASSWORD_LENGTH, errorCode: 400 });

  //Checking if user exists
  const userExists = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (userExists) return res.status(400).send({ message: USER_EXISTS, errorCode: 400 });

  //Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Creating a user model
  const user = new User({
    phoneNumber: req.body.phoneNumber,
    password: hashedPassword,
  });

  //Saving the user in database
  try {
    const saveUser = await user.save();
    res.send(saveUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  //Validation
  if (req.body.phoneNumber.length != 10) return res.status(400).send({ message: INVALID_PH_NO, errorCode: 400 });
  if (req.body.password.length < 8) return res.status(400).send({ message: PASSWORD_LENGTH, errorCode: 400 });

  //Checking if user exists
  const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user) return res.status(400).send({ message: USER_NOT_EXIST, errorCode: 400 });

  //Checking if password is matching
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({ message: INVALID_PASSWORD, errorCode: 400 });

  //Assigning JWT token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY);
  res.header("auth-token", token).send(token);
});

module.exports = router;
