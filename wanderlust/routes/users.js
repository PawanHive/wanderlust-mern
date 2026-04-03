const express = require("express");
const router = express.Router(); //router object
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

// SignUp GET route
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// SignUp POST route
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password); // stored user info into data base.
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        // 'req.login()' make user login automatically just after signup(register).
        if (err) {
          return next(err); // rare (err), handle using express error handler.
        }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }),
);

// Login GET route
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login POST route: // passport.authenticate() is middleware by passport
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
  },
);

// Logout GET route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // if passport is failed a middleware then only we get this error. other we usually don't get error during logout.
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
