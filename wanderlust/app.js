const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); //server-side validation schema required
const Review = require("./models/review.js"); // 'Review' model required

// installed cors package so that i can use (http://localhost:8080/listings) local sever to hoppscotch.io
const cors = require("cors"); // 1. Import it
app.use(cors()); // 2. Enable it for all routes

let port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Defining new Middleware for listingSchema Validation (server-side)
// Middleware to validate request data against the listingSchema using Joi.
// If validation fails, it throws an ExpressError with status 400 and details of the error.
// Otherwise, it calls next() to continue to the next middleware or route handler.
const validateListing = (req, res, next) => {
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

// Defining new Middleware for reviewSchema Validation (server-side)
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const AllListings = await Listing.find({});
    // console.log(AllListings)
    res.render("listings/index.ejs", { AllListings });
  }),
);

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Route
app.post(
  "/listings",
  validateListing, // middleware to check validation for schema
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
  }),
);

// Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

// Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`); // redirect to (Show Route)
  }),
);

// Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }),
);

// REVIEWS - post route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id); //  Find listing
    const newReview = new Review(req.body.review); //  Create review
    listing.reviews.push(newReview); //  Link review to listing
    await newReview.save(); //  Save review
    await listing.save(); //  Save listing
    res.redirect(`/listings/${id}`);
  }),
);

// REVIEWS - delete route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // this line make sure: removes review ObjectId from 'reviews' array, means it should delete completely
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  }),
);

// handle unknown routes (runs when user requests a route that does not exist)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!")); // next(err) MANUALLY passes a custom error to Express. Express skips all normal routes/middleware and forwards this error to the error-handling middleware, where it is received as 'err'.
});

// Express Error Handler Middleware
// (Its Job: Catch any error in our app and send a proper response to the client. and server may never crash)
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err; // (deconstruct)extract info from Express 'err' object
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});

// commented routes created by my first:

// // Create Route
// app.post(
//   "/listings",
//   wrapAsync(async (req, res, next) => {
//     let result = listingSchema.validate(req.body);
//     // let listing = req.body.listing;
//     // console.log(listing)
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
//   }),
// );

// Create Route (Add data to DB)
// app.post('/listings', async (req, res) => {
//     let { title, description, price, location, country, image } = req.body;
//     // console.log(title, description, price, location, country, image)
//         let newListing = new Listing({                               // document created
//         title: title,
//         description: description,
//         price: price,
//         location: location,
//         country: country,
//     })
//     await newListing.save()

//     console.log(newListing)
//     console.log("successful data saved");
//     // res.send("successful data saved");
//     res.redirect('/listings')
// })

// app.get('/testlisting', async (req, res) => {
//         let sampleListing = new Listing({                               // document created
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     })
//     await sampleListing.save()

//     console.log("sample was saved");
//     res.send("successful testing");
// })
