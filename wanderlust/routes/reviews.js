const express = require("express");
const router = express.Router({ mergeParams: true }); // Allows this router to access URL parameters (req.params) from its parent route (e.g., :id from app.use("/listings/:id/reviews", ...))

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js"); //server-side validation (Joi) schema required
const Review = require("../models/review.js"); // 'Review' model required
const Listing = require("../models/listing.js"); // 'Listing' model required

// Defined new Middleware for reviewSchema Validation (server-side)
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// REVIEWS - post route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    console.log(req.params.id);
    const { id } = req.params;
    const listing = await Listing.findById(id); //  Find listing
    const newReview = new Review(req.body.review); //  Create review
    listing.reviews.push(newReview); //  Link review to listing
    await newReview.save(); //  Save review
    await listing.save(); //  Save listing
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
  }),
);

// REVIEWS - delete route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // this line make sure: removes review ObjectId from 'reviews' array, means it should delete completely
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;

/*
Note:
Here, common path was "/listings/:id/reviews", so we remove that part
and added in app.js (express Router middleware) like: app.use("/listings/:id/reviews", reviewsRoute);;
*/