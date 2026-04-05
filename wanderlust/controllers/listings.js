const Listing = require("../models/listing");

// Index Route - controller
module.exports.index = async (req, res) => {
  const AllListings = await Listing.find({});
  // console.log(AllListings)
  res.render("listings/index.ejs", { AllListings });
};

// New Route - controller
module.exports.renderNewForm = (req, res) => {
  // console.log(req.user); // store 'user' related information.
  res.render("listings/new.ejs");
};

// Create Route - controller
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // (Link listing to logged-in user), passport by default save user info in 'req.user'
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!"); // this message will flash after creating new listing but to access this message we will use res.locals()
  res.redirect("/listings");
};

// show Route - controller
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      // nestes populate of 'reviews' and it's review's author.
      path: "reviews", // fetch 'reviews' and it also means we want 'review' ke saath wale 'author' field ko pupulate karna chahte hai.
      populate: { path: "author" }, // fetch each review's owner
    })
    .populate("owner"); // fetch listing's owner
  // console.log(listing);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist"); // request to: http://localhost:8080/listings/69ccc12e0f88fd9bc12480a4    to test it copy link of exiting listing and delete and find again then this message will appear
    return res.redirect("/listings");
  }
  // console.log(listing)
  res.render("listings/show.ejs", { listing });
};

// Edit Route - controller
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for edit does not exist"); // request to: http://localhost:8080/listings/69ccc12e0f88fd9bc12480a4/edit
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250/");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update Route - controller
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    // if new image added then update it while editing, otherwise render old one.
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`); // redirect to (Show Route)
};

// Delete Route - controller
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
