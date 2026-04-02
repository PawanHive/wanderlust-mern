// Authentication (Schema for Users);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose); // this plugin automaticaly add fields like (username, hash, value)

module.exports = mongoose.model("User", userSchema);
