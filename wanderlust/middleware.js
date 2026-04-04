const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //server-side validation (Joi) schema required

// Defining middleware for `req.isAuthenticate()` means is user logged-in or not.
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.path, "..", req.originalUrl);
  if (!req.isAuthenticated()) {
    // if 'user' is not logged-in
    req.session.redirectUrl = req.originalUrl; // save URL, User tries: /listings/new  ....(save url only if user is not logged-in, it will save last page URL on which /login page redirects )
    req.flash("error", "You must be logged-in"); // show flash message
    return res.redirect("/login"); // redirect to login page to do login
  }
  next(); // calling next() is compulsory.
};


// Middleware(login): This middleware takes the URL saved in session (before login) and makes it available after login so you can redirect the user back to the same page.
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    // if req.session.redirectUrl exits
    res.locals.redirectUrl = req.session.redirectUrl; // then save to 'req.locals', ... 'redirectUrl' variable
  }
  next();
};

// 'isOwner' middleware checks if the current user is the owner of a listing and blocks access if they aren’t. (no one can request for edit/delete from postman or hoppscotch)
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// 'isReviewAuthor' middleware checks if the current user is the author of a review and blocks access if they aren’t. (no one can request for edit/delete from postman or hoppscotch)
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id,  reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};


// Defining new Middleware for listingSchema Validation (server-side)
// Middleware to validate request data against the listingSchema using Joi.
// If validation fails, it throws an ExpressError with status 400 and details of the error.
// Otherwise, it calls next() to continue to the next middleware or route handler.
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  // console.log(error);
  if (error) {
    // agar result ke andar error aaya to error throw karo (joi ke wajah se throw hoga which we can see in hoppscotch.io)
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Defined new Middleware for reviewSchema Validation (server-side)
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};