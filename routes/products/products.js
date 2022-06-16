const router = require("express").Router();
const Product = require("../../models/Product");

//ADD PRODUCT
router.post("/add-product", async (req, res) => {
  //Changing the price object into an array
  const price_object = req.body.pizza_varities;
  var price_array = Object.keys(price_object).map((key) => {
    return { type: key, price: price_object[key] };
  });
  //Creating a new product
  const product = new Product({
    title: req.body.pizza_name,
    image: req.body.pizza_images,
    price: price_array,
    description: req.body.pizza_description,
    type: req.body.pizza_type,
  });

  //Saving the new product into the database
  try {
    const saveProduct = await product.save();
    res.send(saveProduct);
  } catch (err) {
    console.log(err);
  }
});

//GET ALL PRODUCT
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
