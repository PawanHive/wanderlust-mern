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
