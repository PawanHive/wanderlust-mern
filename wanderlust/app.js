const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listingsRoute = require("./routes/listings.js"); // require 'listings' all routes
const reviewsRoute = require("./routes/reviews.js"); // require 'reviews' all routes

// installed cors package so that i can use (http://localhost:8080/listings) local sever to hoppscotch.io
const cors = require("cors"); // 1. Import it
app.use(cors()); // 2. Enable it for all routes

let port = 8080;

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// configuration for session Options
const sessionOptions = {
  secret: "MySuperSecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7(days) * 24(hours) * 60(mins) * 60(sec) * 1000(milisecs)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// express-session middleware
app.use(session(sessionOptions));
// connect-flash middleware
app.use(flash());

// connect-flash custom-middleware (flash should always declared above routes)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// express Router Middleware ( these are routes )
app.use("/listings", listingsRoute); // for "listings" (below line is = whole code in ./routes/listings.js)
app.use("/listings/:id/reviews", reviewsRoute); // for "reviews" (below line is = whole code in ./routes/reviews.js)

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
