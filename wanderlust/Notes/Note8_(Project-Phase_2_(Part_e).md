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

# --------------------------------------------------------------------------------------------------

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

# --------------------------------------------------------------------------------------------------

# #3: Add Styling
to SignUp , Login and Logout.

`../views/includes/navbar.js`
```html
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

# --------------------------------------------------------------------------------------------------

# #4: Login after SignUp
**Problem/Flaws:**   
we found flaws even after SignUp, we need to login then to create, edit something.

**Solution:**   
as user SignUp(register) in website, they should automatically logged-in.

## 4.1. Sigma note:
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

# --------------------------------------------------------------------------------------------------

# #5: Post-Login Redirection

**Problem / Flaw:**  
When an unauthenticated user tries to access a protected route like `/listings/new`, they are redirected to the login page. However, after successfully logging in, the user is redirected to `/listings` instead of the originally requested URL (`/listings/new`).

**Solution:**  
After successful login, the user should be redirected back to the original URL from which they were sent to the login page.

## 5.1. Solution (Step-by-Step);

### 5.1.1. Save original URL before redirecting to login
Update your `isLoggedIn` middleware:

`../middleware.js`
```js
// Defining middleware for `req.isAuthenticate()` means is user logged-in or not.

const isLoggedIn = (req, res, next) => {
  console.log(req.path, "..", req.originalUrl);
  if (!req.isAuthenticated()) { // if 'user' is not logged-in
    req.session.redirectUrl = req.originalUrl; // save URL, User tries: /listings/new  ....(save url only if user is not logged-in, it will save last page URL on which /login page redirects )
  }
  next(); // calling next() is compulsory.
};

module.exports = isLoggedIn;
```

### 5.1.2 Create middleware to pass it to res.locals

`../middleware.js`
```js
// Middleware(login): This middleware takes the URL saved in session (before login) and makes it available after login so you can redirect the user back to the same page.
module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {   // if req.session.redirectUrl exits
    res.locals.redirectUrl = req.session.redirectUrl; // then save to 'req.locals', ... 'redirectUrl' variable
  }
  next();
}
```

### 5.1.3. Use it after login
In your login route:

```js
const { saveRedirectUrl } = require("../middleware.js");

// Login POST route: // passport.authenticate() is middleware by passport
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; // redirect to saved URL if exists, otherwise default to /listings
    delete req.session.redirectUrl; // clearn after use
    res.redirect(redirectUrl);
  },
);
```
### 5.1.4. Flow (Redirect to Original Page After Login)

1. User tries `/listings/new`
2. Not logged in → save URL in session
3. Redirect to `/login`
4. After login → redirect to saved URL 🎯

# --------------------------------------------------------------------------------------------------

# #6: Listing Owner

**Feature we want:**  
- Every listing should store **who created it (owner)**
- And show it in UI

## STEP 1: Add owner field in listingSchema;
📁 `models/listing.js`
```js
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```
This creates a **relationship with User**

## STEP 2: Assign owner while creating listing ⭐ (MOST IMPORTANT)

📁 `routes/listings.js`

```js 
// Create Route
router.post(
  "/",
  validateListing, // middleware to check validation for schema
  wrapAsync(async (req, res, next) => {
    newListing.owner = req.user._id; // passport by default save user info in 'req.user'
  }),
);
```
This connects: **Listing -> User**

## STEP 3: Populate owner in Show Route

```js 
// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
  }),
);
```
Converts:  
`owner: id` → `owner: full user object`

## STEP 4: Show owner in EJS

```html
<p class="card-text">
  <strong>Owned By:</strong>
  <i> <%= listing.owner.username %></i> 
</p>
```

# #7: Starting with Authorization

**Feature we want:**  
👉 Only the **owner of a listing** should:

- See **Edit** button
- See **Delete** button
- Be able to edit/delete

## 7.1 STEP 1: Hide buttons in EJS (UI level)

📁 `show.ejs`

```html
        <% if (currUser && listing.owner._id.equals(currUser._id)) { %>    <%# check current user means logged-in user exists, if exists then match current(loggedin) user id to listing.owner Id, then only edit and delete btns will appear %>
          <div class="row">
            <div class="mt-3 col-2">
              <a href="/listings/<%=listing._id%>/edit" class="btn btn-dark edit-button">Edit</a>
            </div>
  
            <div class="mt-3 col-2">
              <form method="POST" action="/listings/<%=listing._id%>?_method=DELETE">
                <button class="btn btn-dark">Delete</button>
              </form>
            </div>
          </div>
        <% } %>
```

## 7.2  What this does?

👉 Checks:

~~~js
currUser && listing.owner._id.equals(currUser._id)
~~~

### 💥 Meaning:

- User is logged in ✅  
- AND user is owner ✅  

👉 Only then show buttons

# #8: Authorization for `/listings`

**Feature we want:**  
- **Listing Ownership Protection** - means **Only owners can modify their listings**.
- meaning while others are **blocked** even if they try to access the route directly (using `postman` or `hoppscotch`)
- Always **validate ownership on the backend**.

## 8.1. STEP 1: Create isOwner middleware (REAL SECURITY)

This middleware **checks if the current user is the owner of a listing and blocks access if they aren’t.**

📁 `middleware.js`
```js
// 'isOwner' middleware checks if the current user is the owner of a listing and blocks access if they aren’t. (no one can request for edit/delete from postman or hoppscotch)
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
```

## 8.2. STEP 2: Use `isOwner` middleware in routes

📁 `routes/listings.js`

```js
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
  }),
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
  }),
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
  }),
);
```

# #9: Authorizatin for `/reviews`

**Feature we Want:**  
- When a user posts a review → store the **owner/author**
- Display **author name** next to each review
- Only the **review owner** can delete it (authorization)
- Add backend checks to **secure deletion**
- Show/hide **delete button** on frontend based on owner

## 9.1 Step 1: Update Review Model

📁 `models/review.js`

```js
  author: {
    // add 'author' field in reviewSchema
    type: Schema.Types.ObjectId,
    ref: "User",
  },
```
`author` stores the **User ID** of the review author.

## 8.2 Step 2: Store owner when creating a review

📁 routes/reviews.js

```js
// REVIEWS - post route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(async (req, res) => {
    newReview.author = req.user._id; // Link review to logged-in user
  }),
);
```
✅ Same as previous step — this is **required for both showing author and authorization.**

## 8.3 Step 3: Populate owner when fetching listing

📁 `routes/listings.js` → Show Route

```js
// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(id)
      .populate({   // nestes populate of 'reviews' and it's review's author.
        path: "reviews", // fetch 'reviews' and it also means we want 'review' ke saath wale 'author' field ko pupulate karna chahte hai.
        populate: { path: "author" },  // fetch each review's owner
      })
      .populate("owner"); // fetch listing's owne
  }),
);
```
`populate("reviews")` fetches reviews
`populate("reviews.author")` fetches **review authors**

## 8.4 Step 4: Update EJS to show author

📁 `views/listings/show.ejs`

```html
<h5 class="card-title"> @<%= review.author.username %></h5>
```
`review.owner.username` shows the **author’s name**

## 8.5 Step 5: Backend authorization for deleting reviews

📁`middleware.js`

```js
const Review = require("./models/review.js");

// 'isReviewAuthor' middleware checks if the current user is the author of a review and blocks access if they aren’t. (no one can request for edit/delete from postman or hoppscotch)
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id,  reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
```

## 8.6 Step 6: Apply middleware to DELETE route

📁 `routes/reviews.js`

```js
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// REVIEWS - delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
  }),
);
```