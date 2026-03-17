const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://t4.ftcdn.net/jpg/15/42/90/85/360_F_1542908599_DW1Q3KFcohk7vyxEaqliTKiVgVGgMUBO.jpg",
    set: (v) =>
      v === ""
        ? "https://t4.ftcdn.net/jpg/15/42/90/85/360_F_1542908599_DW1Q3KFcohk7vyxEaqliTKiVgVGgMUBO.jpg"
        : v, // ternary operator, this will show when image defined but has empty value
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
