const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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
  wrapAsync(async (req, res, next) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    // let listing = req.body.listing;
    // console.log(listing)
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
    const listing = await Listing.findById(id);
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
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
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

// handle unknown routes (runs when user requests a route that does not exist)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));                                               // next(err) MANUALLY passes a custom error to Express. Express skips all normal routes/middleware and forwards this error to the error-handling middleware, where it is received as 'err'.
});

// Error Handler Middleware
// (Its Job: Catch any error in our app and send a proper response to the client. and server may never crash)
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;                               // (deconstruct)extract info from Express 'err' object
  res.status(statusCode).render("error.ejs", { message })
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});

// commented routes created by my first:

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
