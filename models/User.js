const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    max: 255,
  },
  email: {
    type: String,
    required: false,
    max: 255,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  address: {
    addressLine1: {
      type: String,
      required: false,
    },
    addressLine2: {
      type: String,
      required: false,
    },
    latitude: {
      type: String,
      required: false,
    },
    longitude: {
      type: String,
      required: false,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
