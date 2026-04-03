

# #1: User Model:

*user: username, password, email*

**Note:**
```text
You're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value `automatically`.

Additionally, Passsport-Local Mongoose adds some methods to your Schema. 
```

# # `./models/user.js` code snippet explained

```js
// Import mongoose (used to interact with MongoDB)
const mongoose = require("mongoose");

// Extract Schema constructor from mongoose
const Schema = mongoose.Schema;

// Import plugin that simplifies authentication (username, password, hashing, etc.)
const passportLocalMongoose = require("passport-local-mongoose");

// Create a schema (structure of User data in DB)
const userSchema = new Schema({
  // Email field for user
  email: {
    type: String,     // must be a string
    required: true,   // cannot be empty
  },
});

// ❌ MISTAKE HERE:
// You wrote: User.plugin(...)
// But "User" model is not created yet

// ✅ Correct usage:
// Apply plugin to the schema (not the model)
userSchema.plugin(passportLocalMongoose);

/*
What this plugin does automatically:

1. Adds fields:
   - username
   - hash (hashed password)
   - salt

2. Adds methods:
   - User.register() → to register user
   - User.authenticate() → to login user
   - serializeUser / deserializeUser → for sessions

3. Handles:
   - password hashing 🔐
   - password comparison
   - authentication logic

👉 So you don’t need to manually use bcrypt here
*/

// Export the model (creates "User" collection in MongoDB)
module.exports = mongoose.model("User", userSchema);
```
# #2: Configure `passport` strategies (`app.js`)
```js
const passport = require("passport"); 
// Import Passport (main authentication library)

const LocalStrategy = require("passport-local"); 
// Import Local Strategy (username + password authentication)

const User = require("./models/user/.js"); 
// Import User model (which uses passport-local-mongoose plugin)

const usersRoute = require("./routes/users.js"); 
// Import user routes (signup, login, logout)


// ---------------- PASSPORT CONFIGURATION ----------------

// NOTE: These lines must come AFTER express-session middleware
// because Passport uses session to store login info

app.use(passport.initialize()); 
// Initialize Passport (required for every request)

app.use(passport.session()); 
// Enable persistent login sessions (keeps user logged in)


// Configure Local Strategy
passport.use(new LocalStrategy(User.authenticate())); 
/*
- Tells Passport to use "local strategy"
- User.authenticate() is provided by passport-local-mongoose
- It automatically checks username + password
*/


// Serialize User (store user info in session)
passport.serializeUser(User.serializeUser()); 
/*
- Decides what data to store in session
- Usually stores user ID
*/


// Deserialize User (get user from session)
passport.deserializeUser(User.deserializeUser()); 
/*
- Takes user ID from session
- Fetches full user data from database
- Makes it available as req.user
*/

app.use("/", usersRoute);
```
# 🧠 One-Line Understanding (Very Important)

- `initialize()` → start passport  

- `session()` → keep user logged in  

- `LocalStrategy` → login using username/password  

- `serializeUser` → save user ID in session  

- `deserializeUser` → get user from DB using ID  

# #3: `./models/user.js` code snippet explained

```js
// ---------------- USER MODEL (Authentication Schema) ----------------

const mongoose = require("mongoose"); 
// Import mongoose for MongoDB interaction

const Schema = mongoose.Schema; 
// Create Schema reference

const passportLocalMongoose = require("passport-local-mongoose").default; 
// Import plugin that simplifies authentication (adds username + password handling)


// Define User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});


// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose);
/*
- Automatically adds fields:
  - username
  - hash (hashed password)
  - salt

- Adds useful methods:
  - User.register() → create user + hash password
  - User.authenticate() → verify login credentials
  - serializeUser() / deserializeUser()

- Removes need to manually handle password hashing
*/


// Export User model
module.exports = mongoose.model("User", userSchema);
// Creates "User" collection in MongoDB
```

# #4: `/views/users/signup.ejs` code snippet explained
```js
<% layout("/layouts/boilerplate.ejs") %>
<!-- Use main layout (boilerplate.ejs) -->

<div class="row mt-3">
  <!-- Bootstrap row with top margin -->

  <h1 class="col-6 offset-3">SignUp for Wanderlust</h1>
  <!-- Centered heading (6 columns wide, offset by 3) -->

  <div class="col-6 offset-3">
    <!-- Centered form container -->

    <form action="/signup" method="POST" class="needs-validation" novalidate>
      <!-- 
        action="/signup" → sends data to POST /signup route
        method="POST" → used to send form data securely
        needs-validation → Bootstrap validation class
        novalidate → disables default browser validation
      -->

      <!-- Username Field -->
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <!-- label linked with input via id -->

        <input
          type="text"
          class="form-control"
          name="username"
          id="username"
          required
        />
        <!-- 
          name="username" → key used in req.body
          id="username" → used by label
          required → makes field mandatory
        -->

        <div class="valid-feedback">Looks Good!</div>
        <!-- Bootstrap success message -->
      </div>

      <!-- Email Field -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>

        <input
          type="email"
          id="email"
          class="form-control"
          name="email"
          required
        />
        <!-- 
          type="email" → ensures valid email format
          name="email" → accessible in backend via req.body.email
        -->
      </div>

      <!-- Password Field -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>

        <input
          type="password"
          id="password"
          class="form-control"
          name="password"
          required
        />
        <!-- 
          type="password" → hides typed characters
          name="password" → used in backend for registration
        -->
      </div>

      <!-- Submit Button -->
      <button class="btn btn-success mb-3">SignUp</button>
      <!-- Sends form data to server -->

    </form>
  </div>
</div>
```

# #5: `/views/users/login.ejs` code snippet explained
```js
<% layout("/layouts/boilerplate.ejs") %>
<!-- Use main layout (boilerplate.ejs) -->

<div class="row mt-3">
  <!-- Bootstrap row with top margin -->

  <h1 class="col-6 offset-3">SignUp for Wanderlust</h1>
  <!-- ⚠️ This should be "Login" instead of "SignUp" -->

  <div class="col-6 offset-3">
    <!-- Centered form container -->

    <form action="/login" method="POST" class="needs-validation" novalidate>
      <!-- 
        action="/login" → sends data to POST /login route
        method="POST" → used to send login credentials
        needs-validation → Bootstrap validation
        novalidate → disables default browser validation
      -->

      <!-- Username Field -->
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>

        <input
          type="text"
          class="form-control"
          name="username"
          id="username"
          required
        />
        <!-- 
          name="username" → used in req.body.username
          required → field is mandatory
        -->
      </div>

      <!-- Password Field -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>

        <input
          type="password"
          id="password"
          class="form-control"
          name="password"
          required
        />
        <!-- 
          type="password" → hides input
          name="password" → used for authentication
        -->
      </div>

      <!-- Submit Button -->
      <button class="btn btn-success mb-3">Login</button>
      <!-- Submits form to server -->

    </form>
  </div>
</div>
```

# 🔐 Authentication Setup (Passport.js)

## 1. Install Dependencies

~~~bash
npm install passport passport-local passport-local-mongoose express-session
~~~

---

## 2. Setup Express Session

~~~js
const session = require("express-session");

app.use(session({
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
}));
~~~

---

## 3. Initialize Passport

~~~js
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());
~~~

---

## 4. Configure Local Strategy

~~~js
const LocalStrategy = require("passport-local");
const User = require("./models/user");

passport.use(new LocalStrategy(User.authenticate()));
~~~

---

## 5. Serialize & Deserialize User

~~~js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
~~~

---

## 6. User Schema Setup (IMPORTANT)

~~~js
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
~~~

---

## 7. Signup Route

### GET (Show Form)

~~~js
router.get("/signup", (req, res) => {
  res.render("users/signup");
});
~~~

### POST (Register User)

~~~js
router.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome!");
      res.redirect("/listings");
    });

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});
~~~

---

## 8. Login Route

### GET

~~~js
router.get("/login", (req, res) => {
  res.render("users/login");
});
~~~

### POST

~~~js
router.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);
~~~

---

## 9. Logout Route

~~~js
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out!");
    res.redirect("/listings");
  });
});
~~~

---

## 10. Middleware (Protect Routes)

~~~js
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};
~~~

---

## 11. Flash Messages Setup

~~~js
const flash = require("connect-flash");

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
~~~

---

# 🧠 Key Concepts

- `User.register()` → hashes password + saves user
- `passport.authenticate()` → checks login credentials
- `req.login()` → logs user in after signup
- `req.isAuthenticated()` → check login status
- `req.logout()` → destroy session

---

# 🔥 Flow Summary

1. User signs up → data saved + password hashed  
2. User logged in → session created  
3. On each request → session checked  
4. Protected routes → allow only logged-in users  