const router = require("express").Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const { INVALID_PH_NO, PASSWORD_LENGTH, INVALID_PASSWORD, USER_NOT_EXIST, USER_EXISTS, BAD_AUTHENTICATION, INVALID_NAME, INVALID_MAIL, INVALID_ADDRESS } = require("../../constants/errors/authError");

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

  //Creating a new user
  const user = new User({
    phoneNumber: req.body.phoneNumber,
    password: hashedPassword,
  });

  //Saving the user in database
  try {
    const saveUser = await user.save();

    //Assigning JWT token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY);

    const resData = {
      token: token,
      _id: saveUser._id,
      phoneNumber: saveUser?.phoneNumber || null,
      date: saveUser?.date || null,
      address: {
        addressLine1: saveUser?.address?.addressLine1 || null,
        addressLine2: saveUser?.address?.addressLine2 || null,
        latitude: saveUser?.address?.latitude || null,
        longitude: saveUser?.address?.longitude || null,
      },
      email: saveUser?.email || null,
      name: saveUser?.name || null,
    };

    res.send(resData);
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: err, errorCode: 400 });
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
  let resData = {
    token: token,
    _id: user._id,
    phoneNumber: user?.phoneNumber || null,
    date: user?.date || null,
    address: {
      addressLine1: user?.address?.addressLine1 || null,
      addressLine2: user?.address?.addressLine2 || null,
      latitude: user?.address?.latitude || null,
      longitude: user?.address?.longitude || null,
    },
    email: user?.email || null,
    name: user?.name || null,
  };

  res.header("auth-token", token).send(resData);
});

router.patch("/update-details", verify, async (req, res) => {
  //Checking if user exists
  const user = await User.findById(req.body._id);
  if (!user) return res.status(400).send({ message: USER_NOT_EXIST, errorCode: 400 });

  //Checking if id which user is sending matches JWT
  if (req.user._id !== req.body._id) return res.status(401.4).send({ message: BAD_AUTHENTICATION, errorCode: 401.4 });

  //Validation
  if (req.body.name.length < 2) return res.status(400).send({ message: INVALID_NAME, errorCode: 400 });
  if (req.body.email.length < 2) return res.status(400).send({ message: INVALID_MAIL, errorCode: 400 });
  if (req.body.addressLine1.length < 2 || req.body.addressLine2.length < 2) return res.status(400).send({ message: INVALID_ADDRESS, errorCode: 400 });

  //Setting updated fields objects
  let updateFields = {
    name: req.body.name,
    email: req.body.email,
    address: {
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
  };

  console.log(updateFields);

  //Updating the user details
  const updatedUserDetails = await User.updateOne({ _id: req.body._id }, updateFields);
  const updatedUser = await User.findById(req.body._id);
  res.send(updatedUser);
});

//GET USER DETAILS
router.post("/get-user-details", verify, async (req, res) => {
  const user = await User.findById(req.body._id);
  res.send({ address: user.address, email: user.email, name: user.name, phoneNumber: user.phoneNumber });
});

module.exports = router;
