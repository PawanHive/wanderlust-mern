// initialize data to database

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  // await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    // Add owner field to each listing while keeping existing data using map and spread
    ...obj,
    owner: "69ce416cc6616214d6b5843c",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
