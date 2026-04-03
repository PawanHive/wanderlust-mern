# # Important Link:
**passport `req.logout()` documentation:**[https://www.passportjs.org/concepts/authentication/logout/](https://www.passportjs.org/concepts/authentication/logout/)

**passport `req.login()` documentation:**[https://www.passportjs.org/concepts/authentication/login/](https://www.passportjs.org/concepts/authentication/login/)

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

# #2: Logout User 
using passport `req.logout()` methods.  
`GET /logout`

**passport `req.logout()` documentation:**[https://www.passportjs.org/concepts/authentication/logout/](https://www.passportjs.org/concepts/authentication/logout/)

## What does `req.logout()` do?

`req.logout()` is a Passport method that removes the user from the session, clears `req.user`, and makes the request unauthenticated.

**Exmaple:** `../routes/users.js`
```js
// Logout GET route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // if passport is failed a middleware then only we get this error. other we usually don't get error during logout (this error usually handle by express-error-handling middleware).
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});
```

# #3: Add Styling
to SignUp , Login and Logout.

`../views/includes/navbar.js`
```
      <div class="navbar-nav ms-auto">    <%# 'ms-auto' means margin from start, shift this options to right side%>
        <% if (!currUser) { %>    <%# as we can't use 'req.user' directly into .ejs so we need to pass 'req.user', to all templates using 'res.locals' in our middleware(gloabal) in app.js with variable 'currUser'. %>
          <a class="nav-link" href="/signup">Sign up</a>
          <a class="nav-link" href="/login">Log in</a>
        <% } %>
        <% if (currUser) { %>
          <a class="nav-link" href="/logout">Log out</a>
        <% } %>
      </div>
```
`app.js`
```js
// middleware (Global): (we can access it in all .ejs template), ('req.locals' should always declared above routes)
app.use((req, res, next) => {
  res.locals.currUser = req.user; // It copies 'req.user' into 'res.locals' so by using 'currUser', logged-in user is accessible in all templates (as we can't use 'req.user' in .ejs).
  next();
});
```
This **middleware** makes flash messages and the logged-in user available to all EJS templates using `res.locals`.

# #4: Login after SignUp
**Problem/Flaws:** we found flaws even after SignUp, we need to login then to create, edit something.

**Solution:** as user SignUp(register) in website, they should automatically logged-in.

## 1.1. Sigma note:
Passport's login method automatically established a login session.  
We can invoke login to automatically login a user.

`../routes/users.js`
```js
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
```
we need to use `req.login()` just after registered/save user data to server, so that it can login immediately just after signup/register.

`req.login()` is a Passport method that logs in a user by storing their data in the session and setting `req.user`, making them authenticated immediately.