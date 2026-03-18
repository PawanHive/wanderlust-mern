# #Important Links:
**Validation Bootstrap**: [https://getbootstrap.com/docs/5.3/forms/validation/](https://getbootstrap.com/docs/5.3/forms/validation/)

# #1: Client-Side Validation(Form) Error Handling

# #1 To handle our from validation we used Bootstrap validation class and JS Code associated with it

## Class what we used in project form validation:
### First Class:
```html
<form class="needs-validation" novalidate>
</form>
```
here `class="needs-validation"` add validation style to our forms input boxes  
and `novalidate` boolean attribute, this disable browser default feedback tooltips like when we forget to enter required field

### Second Class: 
```html
<div class="valid-feedback">
  Username looks good!
</div>
```

```html
<div class="invalid-feedback">
  Please enter a valid username.
</div>
```
here `class="valid-feedback"` appears when input data is valid   
and  `class="invalid-feedback"` appears when input data is invalid or empty

---

### These all info took from Bootstrap Validation Page
**Link**:[https://getbootstrap.com/docs/5.3/forms/validation/](https://getbootstrap.com/docs/5.3/forms/validation/)

#### This is Syntactical Bootstrap Validation Code 
```html
<form class="row g-3 needs-validation" novalidate>
  <div class="col-md-4">
    <label for="validationCustom01" class="form-label">First name</label>
    <input type="text" class="form-control" id="validationCustom01" value="Mark" required>
    <div class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustom02" class="form-label">Last name</label>
    <input type="text" class="form-control" id="validationCustom02" value="Otto" required>
    <div class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustomUsername" class="form-label">Username</label>
    <div class="input-group has-validation">
      <span class="input-group-text" id="inputGroupPrepend">@</span>
      <input type="text" class="form-control" id="validationCustomUsername" aria-describedby="inputGroupPrepend" required>
      <div class="invalid-feedback">
        Please choose a username.
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <label for="validationCustom03" class="form-label">City</label>
    <input type="text" class="form-control" id="validationCustom03" required>
    <div class="invalid-feedback">
      Please provide a valid city.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom04" class="form-label">State</label>
    <select class="form-select" id="validationCustom04" required>
      <option selected disabled value="">Choose...</option>
      <option>...</option>
    </select>
    <div class="invalid-feedback">
      Please select a valid state.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom05" class="form-label">Zip</label>
    <input type="text" class="form-control" id="validationCustom05" required>
    <div class="invalid-feedback">
      Please provide a valid zip.
    </div>
  </div>
  <div class="col-12">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
      <label class="form-check-label" for="invalidCheck">
        Agree to terms and conditions
      </label>
      <div class="invalid-feedback">
        You must agree before submitting.
      </div>
    </div>
  </div>
  <div class="col-12">
    <button class="btn btn-primary" type="submit">Submit form</button>
  </div>
</form>
```
---

# #2: Server-Side Validation Error Handling

## 1. Custom Error Handling:

```js
//app.js

// Error Handler Middleware
app.use((err, req, res, next) => {
  res.send("someting went wrong!");
});
```

## 2. Added wrapAsync

```js
// wrapAsync.js

module.exports = function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);             // = fn(req, res, next).catch((err) => next(err));
  }
}
```

```js
// app.js

const wrapAsync = require("./utils/wrapAsync.js");      // required wrapAsync.js file

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
```
---

# #3: Very Important Concept about (err) Object

# 🧠 Where does `err` come from in Express?

---

## 📌 Core Idea

let { statusCode, message } = err;

👉 The `err` object is **automatically passed by Express** when an error occurs.

But Express only gets it in **two ways**:

---

## 🔴 1. When you `throw` an error

app.get("/user", (req, res) => {
  throw new ExpressError(404, "User not found");
});

### 🧠 What happens internally:

1. You `throw` error  
2. Express catches it  
3. Express **passes it as `err`** to your error middleware  

👉 So inside middleware:

err = new ExpressError(404, "User not found");

---

## 🔵 2. When you call `next(err)`

app.get("/user", (req, res, next) => {
  const err = new ExpressError(500, "Server issue");
  next(err);
});

👉 Here YOU manually send the error to Express

---

## 🔗 Now connect everything

### 📌 Your class:

class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

---

### 📌 When you create error:

throw new ExpressError(404, "User not found");

👉 That object looks like:

err = {
  statusCode: 404,
  message: "User not found"
}

---

### 📌 Then in middleware:

app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  res.status(statusCode).send(message);
});

👉 Now it works because:
- err.statusCode → 404  
- err.message → "User not found"  

---

## 🔥 Full Flow (Super Important)

You throw error  
     ↓  
Express catches it  
     ↓  
Express sends it as `err`  
     ↓  
Error middleware receives it  
     ↓  
You extract values from `err`  
     ↓  
Send response  

---

## ⚠️ Important thing beginners miss

If you do this:

throw new Error("Something broke");

👉 Then:

err = {
  message: "Something broke"
}

❌ No `statusCode`

---

### ✅ So you use default:

let { statusCode = 500 } = err;

---

## 🧩 Simple Analogy

- You = person reporting problem  
- ExpressError = structured complaint form  
- Express = delivery system  
- err = complaint reaching manager (middleware)  

---

## ✅ Final Answer (Simple)

👉 Value enters `err` because:

- You create an error using `throw` or `next(err)`  
- Express automatically forwards that error to middleware  
- That error object becomes `err`  

---

# #4: Used Custom ExpressError class and styled it in error.ejs view page:

## 1. custom ExpressError Class:

ExpressError.js
```js
// custom Express Error

// The job of this ExpressError class is:
//To create structured, custom errors that carry both a message AND an HTTP status code.

class ExpressError extends Error {
  constructor (statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
```
---

app.ejs
```js
//app.js
const ExpressError = require("./utils/ExpressError.js");

// handle unknown routes (runs when user requests a route that does not exist)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));                                               // next(err) MANUALLY passes a custom error to Express. Express skips all normal routes/middleware and forwards this error to the error-handling middleware, where it is received as 'err'.
});

// Error Handler Middleware
// (Its Job: Catch any error in our app and send a proper response to the client. and server may never crash)
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;                               // (deconstruct)extract info from Express 'err' object
  res.status(statusCode).render("error.ejs", { message })
  // res.status(statusCode).send(message);
});
```
---

error.ejs
```html
<% layout("/layouts/boilerplate.ejs") %> 
<%# Using Bootstrap alert for show
error in styled manner %>

<div class="row mt-3">
  <div class="alert alert-danger col-6 offset-3" role="alert">
    <p><%= message %></p>
  </div>
</div>
```
Error basically styled here in good manner which feel appealing for client

# #5: Server-side Validation for Schema with Joi Package:

## 1. Joi Package:

### 1️⃣ What is Joi?

- Joi is a JavaScript object schema validation library.
- Used primarily in Node.js/Express for server-side validation.
- Helps ensure incoming data (req.body, query, params) matches expected format before processing.
- Avoids writing manual if-statements for every field.

**Install**:
> npm i joi

**Them Import in schema.js**
```js
 const Joi = require("joi");  // standard convention
```

**schema.js**:
```js
// Validation with Joi

// This is Schema is not for Mongoose
// This Schema is for Server-side Validation
// so here we a using joi package(tools) to do this validation (npm i joi)

const Joi = require('joi');                               // import Joi for validation (copied from jio.dev website introduction page)

module.exports.listingSchema = Joi.object({                // Main schema for validating incoming request data (req.body)
  listing: Joi.object({                                     // Expecting an object named "listing" inside req.body  ...   (req.body.listing)
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
  }).required(),
});
```

**app.js**:
```js
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {                                           // agar result ke andar error aaya to error throw karo (joi ke wajah se throw hoga which we can see in hoppscotch.io)
      throw new ExpressError(400, result.error);
    }
```
This code validates the incoming request body using `listingSchema` and blocks the request with a `400` error if the data is invalid.

---

## 2. CORS package:

In short, CORS (Cross-Origin Resource Sharing) is a security feature that acts as a "permission slip" for web browsers.
  
By default, browsers block a website (like hoppscotch.io) from making requests to a different domain (like your localhost:8080) to prevent malicious sites from stealing your data. CORS is the mechanism that tells the browser, "It’s okay, I trust this specific website to talk to my server.

**Install**:
> npm install cors

**Add this line to server file (app.js)**:
```js
// installed cors package so that i can use (http://localhost:8080/listings) local sever to hoppscotch.io 
const cors = require('cors');                                                       // 1. Import it
app.use(cors());                                                                    // 2. Enable it for all routes
```

now we can use our local server(`http://localhost:8080/listings`) to hoppscotch.io 

---


```ternimal
{
  value: { listing: { title: 'small tittle' } },
  error: [Error [ValidationError]: "listing.description" is required] {
    _original: { listing: [Object] },
    details: [ [Object] ]
  }
}
```


# #6: Define New Middleware for Schema validation:

## Explanation of below code (how they works):

- `validateListing` is an Express middleware that checks incoming `req.body` against your Joi `listingSchema`.
- `let { error } = listingSchema.validate(req.body);` → gets validation errors (if any).
- If `error` exists:
- Creates a readable message (`errMsg`)
- Throws a custom `ExpressError` with status `400` → caught later by Express error handler → client sees the error.
- If no error: calls `next()` → request continues to the next middleware or route handler.
- In short: it blocks invalid requests and lets valid requests pass through.

```js 
// Defining new Middleware for Schema Validation (server-side)
// Middleware to validate request data against the listingSchema using Joi.
// If validation fails, it throws an ExpressError with status 400 and details of the error.
// Otherwise, it calls next() to continue to the next middleware or route handler.
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  // console.log(error);
  if (error) {                                           // agar result ke andar error aaya to error throw karo (joi ke wajah se throw hoga which we can see in hoppscotch.io)
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}
```
now we just use `validateListing` as middleware in different route where we want to validate data of that route like example below:

```js
// Create Route
app.post(
  "/listings",
  validateListing,                                        // middleware to check validation for schema
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);
```
