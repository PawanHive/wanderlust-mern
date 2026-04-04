const express = require("express");
const router = express.Router(); //router object
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

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
router.get("/new", isLoggedIn, (req, res) => {
  // console.log(req.user); // store 'user' related information.
  res.render("listings/new.ejs");
});

// Create Route
router.post(
  "/",
  validateListing, // middleware to check validation for schema
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // (Link listing to logged-in user), passport by default save user info in 'req.user'
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
    const listing = await Listing.findById(id)
      .populate({   // nestes populate of 'reviews' and it's review's author.
        path: "reviews", // fetch 'reviews' and it also means we want 'review' ke saath wale 'author' field ko pupulate karna chahte hai.
        populate: { path: "author" },  // fetch each review's owner
      })
      .populate("owner"); // fetch listing's owner
    // console.log(listing);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist"); // request to: http://localhost:8080/listings/69ccc12e0f88fd9bc12480a4    to test it copy link of exiting listing and delete and find again then this message will appear
      return res.redirect("/listings");
    }
    // console.log(listing)
    res.render("listings/show.ejs", { listing });
  }),
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for edit does not exist"); // request to: http://localhost:8080/listings/69ccc12e0f88fd9bc12480a4/edit
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }),
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`); // redirect to (Show Route)
  }),
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;

/*
Note:
Here, common path was "/listings", so we remove that part
and added in app.js (express Router middleware) like: app.use("/listings", listingsRoute)
*/
