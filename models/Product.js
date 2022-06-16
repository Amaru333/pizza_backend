const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    max: 255,
  },
  image: {
    type: Array,
    required: true,
  },
  review: [
    {
      reviewer: {
        id: String,
        name: String,
        email: String,
      },
      rating: Number,
      description: String,
      time: String,
    },
  ],
  price: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
