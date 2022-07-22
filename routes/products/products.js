const router = require("express").Router();
const Product = require("../../models/Product");
const { cloudinary } = require("../../utils/cloudinary");

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

//DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  const image_id_array = product.image.map((a) => a.public_id);
  await cloudinary.api
    .delete_resources(image_id_array)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  let delete_product = await Product.findByIdAndDelete(id);
  try {
    res.send(delete_product).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

//GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  try {
    res.send(product).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

//DELETE IMAGE
router.delete("/image/:imgID/:pID", async (req, res) => {
  const { imgID } = req.params;
  const { pID } = req.params;
  await cloudinary.api
    .delete_resources([imgID])
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  const update_product = await Product.updateOne({ _id: pID }, { $pull: { image: { public_id: imgID } } });
  try {
    res.send(update_product);
  } catch (err) {
    res.send(err);
  }
});

//EDIT PRODUCT
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  //Changing the price object into an array
  const price_object = req.body.pizza_varities;
  var price_array = Object.keys(price_object).map((key) => {
    return { type: key, price: price_object[key] };
  });
  const update_product = await Product.findByIdAndUpdate(
    id,
    {
      title: req.body.pizza_name,
      image: req.body.pizza_images,
      price: price_array,
      description: req.body.pizza_description,
      type: req.body.pizza_type,
    },
    { new: true }
  );
  try {
    res.send(update_product);
  } catch (err) {
    res.send(err);
  }
});

router.get("/sort/popular", async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;
  console.log(limit, skip, "SKIPPPP");
  try {
    const products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $addFields: {
                rating: {
                  $avg: "$review.rating",
                },
              },
            },
            {
              $addFields: {
                rating: {
                  $ifNull: ["$rating", 0],
                },
              },
            },
            {
              $sort: {
                rating: -1,
                _id: 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          count: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);
    res.send(products);
  } catch (err) {
    res.send(err);
  }
});

router.get("/type/:type", async (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;
  try {
    const products = await Product.aggregate([
      {
        $facet: {
          results: [
            {
              $match: {
                type: type,
              },
            },
            {
              $addFields: {
                rating: {
                  $avg: "$review.rating",
                },
              },
            },
            {
              $addFields: {
                rating: {
                  $ifNull: ["$rating", 0],
                },
              },
            },
            {
              $sort: {
                rating: -1,
                _id: 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          count: [
            {
              $match: {
                type: type,
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);
    res.send(products);
  } catch (err) {
    res.send(err);
  }
});

router.get("/search/:query", async (req, res) => {
  const { query } = req.params;
  try {
    const products = await Product.aggregate([
      {
        $search: {
          index: "productSearch",
          text: {
            query: query,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
    ]);
    res.send(products);
  } catch (err) {
    res.send(err);
  }
});

router.get("/autoComplete/:query", async (req, res) => {
  const { query } = req.params;
  try {
    const products = await Product.aggregate([
      {
        $search: {
          index: "autoCompleteProduct",
          text: {
            query: query,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
      {
        $project: {
          title: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    res.send(products);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
