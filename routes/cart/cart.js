const router = require("express").Router();
const { USER_NOT_EXIST } = require("../../constants/errors/authError");
const User = require("../../models/User");
const verify = require("../users/verifyToken");
const { ObjectId } = require("mongodb");

//GET CART ITEMS
router.get("/details/:id", verify, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(400).send({ message: USER_NOT_EXIST, errorCode: 400 });

  //Checking if id which user is sending matches JWT
  if (req.user._id !== id) return res.status(401.4).send({ message: BAD_AUTHENTICATION, errorCode: 401.4 });

  //Getting the card details of the user
  try {
    const cart_items = await User.aggregate([
      {
        $match: {
          _id: new ObjectId("6249c2638a7efd7c38c310bd"),
        },
      },
      {
        $addFields: {
          cart: {
            $map: {
              input: "$cart",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    data: {
                      $toObjectId: "$$this.data",
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "cart.data",
          foreignField: "_id",
          as: "cart_data",
        },
      },
      {
        $project: {
          email: 1,
          name: 1,
          phoneNumber: 1,
          cart: {
            $map: {
              input: "$cart",
              as: "c",
              in: {
                $mergeObjects: [
                  "$$c",
                  {
                    $first: {
                      $filter: {
                        input: "$cart_data",
                        cond: {
                          $eq: ["$$this._id", "$$c.data"],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);
    return res.send(cart_items);
  } catch (err) {
    return res.send(err);
  }
});

//ADD TO CART
router.post("/:id", verify, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(400).send({ message: USER_NOT_EXIST, errorCode: 400 });

  //Checking if id which user is sending matches JWT
  if (req.user._id !== id) return res.status(401.4).send({ message: BAD_AUTHENTICATION, errorCode: 401.4 });

  //Adding item to the user's cart
  user.cart.push(req.body.data);

  //Saving the updated cart in database
  try {
    const updatedCart = await user.save();
    return res.send(updatedCart);
  } catch (err) {
    return res.send(err);
  }
});

//Edit quantity
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  console.log(id);
  const mongooseLink = "cart." + data.index + ".quantity";
  const mongooseLinkIndex = "cart." + data.index;

  let update_product;

  // const update_product = await User.findById(id);
  if (data.updatedQuantity > 0) {
    update_product = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          [mongooseLink]: data.updatedQuantity,
        },
      },
      { new: true }
    );
  } else {
    const update_product_null = await User.updateOne({ _id: id }, { $unset: { [mongooseLinkIndex]: 1 } });
    update_product = await User.updateOne({ _id: id }, { $pull: { cart: null } }, { new: true });
  }
  try {
    res.send(update_product);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
