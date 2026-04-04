const express = require("express");
const router = express.Router(); //router object
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// ("/signup") Combines all same path of multiple routes at one place
router
  .route("/signup")
  .get(userController.renderSignupForm) // SignUp GET route
  .post(
    wrapAsync(userController.signup), // SignUp POST route
  );

// ("/login") Combines all same path of multiple routes at one place
router
  .route("/login")
  .get(userController.renderLoginForm) // Login GET route
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login", // passport.authenticate() is middleware by passport
      failureFlash: true,
    }),
    userController.login, // Login POST route:
  );

// Logout GET route
router.get("/logout", userController.logout);

module.exports = router;
