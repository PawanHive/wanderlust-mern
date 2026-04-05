const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: "String", 
    filename: "String"
  },
  price: Number,
  location: String,
  country: String,
  reviews: [ // add 'reviews' field in listingSchema
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: { // add 'owner' field in listingSchema
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// this code: will automatically delete all reviews, if listing deleted. (cascade delete using mongoose middleware)
// this is (post) mongoose middleware
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
