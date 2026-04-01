

# #1: `express-session` code-parts snippet explained

```js
const session = require("express-session"); // Import session middleware

// Configuration for session
const sessionOptions = {
  secret: "MySuperSecretKey", // Secret key used to sign the session ID (keeps it secure)

  resave: false, 
  // Don't save session again if nothing is modified
  // Improves performance

  saveUninitialized: true, 
  // Save a new session even if it has no data yet
  // (can be set to false in production for better practice)

  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, 
    // Absolute expiry time (7 days from now)

    maxAge: 7 * 24 * 60 * 60 * 1000, 
    // How long the cookie should live in browser (7 days)

    httpOnly: true, 
    // Security feature: cookie cannot be accessed via JavaScript (protects from XSS attacks)
  }
};

// Use express-session middleware
// 👉 This will:
// - Create a unique session ID for each user
// - Store session data on server
// - Send session ID as a cookie to the browser
app.use(session(sessionOptions));
```
# ----------------------------------------------------------------------------------------------------

# #2: `connect-flash` code-parts snippet explained

```js
// app.js

const flash = require("connect-flash");

// connect-flash middleware
app.use(flash());

// connect-flash custom-middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});
```
