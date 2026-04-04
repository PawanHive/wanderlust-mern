// '/listings' is common in all routes.

const express = require("express");
const router = express.Router(); //router object
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

// Combines all same path ("/") of multiple routes at one place
router
  .route("/")
  .get(wrapAsync(listingController.index)) // Index Route
  .post(
    validateListing, // middleware to check validation for schema
    wrapAsync(listingController.createListing), // Create Route
  );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Combines all same path ("/:id") of multiple routes at one place
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // Show Route
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing), // Update Route
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing), // Delete Route
  );

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;

/*
Note:
Here, common path was "/listings", so we remove that part
and added in app.js (express Router middleware) like: app.use("/listings", listingsRoute)
*/
