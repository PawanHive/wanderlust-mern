const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");

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
app.get("/", async (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get("/listings", async (req, res) => {
  const AllListings = await Listing.find({});
  // console.log(AllListings)
  res.render("listings/index.ejs", { AllListings });
});

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

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

// Create Route
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    // let listing = req.body.listing;
    // console.log(listing)
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// Show Route
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`); // redirect to (Show Route)
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

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

// Error Handler Middleware
app.use((err, req, res, next) => {
  res.send("someting went wrong!");
});

app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});
