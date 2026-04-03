# #1: Connecting Login Route

## 1.1. How to check if User is Logged in?

`req.isAuthenticated()` // Passport method
- It checks **Whether the current user is logged in (authenticated) or not**.

## 1.2. Why we use it:
Mainly for **protecting routes** (authorization logic).  
means if you are not **loggedin** then you can't create, edit or delete listings.

**Exmaple:**
```js
// New Route
router.get("/new", (req, res) => {
  console.log(req.user); // store 'user' related information.
  if (!req.isAuthenticated()) { // if user is not logged-In
    req.flash("error", "You must be logged-in")
    return res.redirect("/login")
  }
  res.render("listings/new.ejs");
});
```
now we convert `req.isAuthenticated()` part into **middleware** so that i could easy to use with multiple routes, so we will refactor this code.

### Refactoring Above code.
**`middleware.sj`:**
```js
// middleware.js

// Defining middleware for `req.isAuthenticate()` means is user logged-in or not.

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) { // if 'user' is not logged-in
    req.flash("error", "You must be logged-in"); // show flash message
    return res.redirect("/login"); // redirect to login page to do login
  }
  next(); // calling next() is compulsory.
};

module.exports = isLoggedIn;
```
**`../routes/listings.js`:**
```js
const isLoggedIn = require("../middleware.js")

// New Route
router.get("/new", isLoggedIn, (req, res) => {  // now `isLoggedIn` added as middleware.
  res.render("listings/new.ejs");
});
```
Now we can add `isLoggedIn` middleware to multiple routes (where we want to authenticate is user logged-in or not).