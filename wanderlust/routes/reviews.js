const express = require("express");
const router = express.Router({ mergeParams: true }); // Allows this router to access URL parameters (req.params) from its parent route (e.g., :id from app.use("/listings/:id/reviews", ...))
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js"); // 'Review' model required
const Listing = require("../models/listing.js"); // 'Listing' model required
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// REVIEWS - post route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(async (req, res) => {
    console.log(req.params.id);
    const { id } = req.params;
    const listing = await Listing.findById(id); //  Find listing
    const newReview = new Review(req.body.review); //  Create review
    newReview.author = req.user._id; // Link review to logged-in user
    // console.log(newReview)
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
  isLoggedIn,
  isReviewAuthor,
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
