

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
# #2: Configure `passport` strategies

# #3: Signup User

**GET /signup**  
**POST /signup**