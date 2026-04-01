const express = require("express");
const router = express.Router(); //router object

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); //server-side validation (Joi) schema required
const Listing = require("../models/listing");



// Defining new Middleware for listingSchema Validation (server-side)
// Middleware to validate request data against the listingSchema using Joi.
// If validation fails, it throws an ExpressError with status 400 and details of the error.
// Otherwise, it calls next() to continue to the next middleware or route handler.
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  // console.log(error);
  if (error) {        // agar result ke andar error aaya to error throw karo (joi ke wajah se throw hoga which we can see in hoppscotch.io)
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const AllListings = await Listing.find({});
    // console.log(AllListings)
    res.render("listings/index.ejs", { AllListings });
  }),
);

// New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Route
router.post(
  "/",
  validateListing, // middleware to check validation for schema
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!"); // this message will flash after creating new listing but to access this message we will use res.locals()
    res.redirect("/listings");
  }),
);

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
  }),
);

// Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

// Update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`); // redirect to (Show Route)
  }),
);

// Delete Route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }),
);

module.exports = router;



/*
Note:
Here, common path was "/listings", so we remove that part
and added in app.js (express Router middleware) like: app.use("/listings", listingsRoute)
*/