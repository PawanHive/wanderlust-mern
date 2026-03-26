#Important Link:
**Monogoose Middleware:**[https://mongoosejs.com/docs/middleware.html](https://mongoosejs.com/docs/middleware.html)

# #1: Create Review (Clear + Short Explanation)

## Step 1: req.body (Form Data)
When user submits form, data comes in `req.body`:
~~~js
req.body = {
  comment: "Awesome place",
  rating: "4"
}
~~~
👉 Raw data (always string by default)

---

## Step 2: new Review(req.body)
Create a **Mongoose document** using schema:
~~~js
const newReview = new Review(req.body);
~~~
👉 Converts plain form data → structured document  
👉 Applies schema (fields, types, validation)
like this:
~~~js
newReview = {
  comment: "Awesome place",
  rating: "4"
}
~~~
but here data converted into stuctured document: where schema rules and validation applied properly according to "`Review`" Model 
---

## Step 3: save()
Store document in MongoDB:
~~~js
await newReview.save();
~~~
👉 Now data is permanently saved in database

---

## Flow Summary
~~~js
req.body → new Review() → .save() → MongoDB
~~~

---

## Key Understanding
- `req.body` = user input  
- `new Review()` = create document (not saved yet)  
- `.save()` = actually store in DB  

---

## One Line
👉 Take form data → make review document → save to database



# #2: Deleting Review ( Sigma Note )
## Mongo $pull operator

### `$pull`
**Note:**  
The `$pull` operator removes from an existing array all instances of a value or values that match a specified condition.
