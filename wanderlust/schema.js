// Validation with Joi

// This is Schema is not for Mongoose
// This Schema is for Server-side Validation
// so here we a using joi package(tools) to do this validation (npm i joi)

const Joi = require("joi"); // import Joi for validation (copied from jio.dev website introduction page)

module.exports.listingSchema = Joi.object({         // Main schema for validating incoming request data (req.body)
  listing: Joi.object({                             // Expecting an object named "listing" inside req.body  ...   (req.body.listing)
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
  }).required(),
});

/*
Note on Import/Export:

1. We exported the schema like this:
   module.exports.listingSchema = Joi.object(...);
   → This means we are exporting an object with a property named "listingSchema".

2. To import it correctly in app.js, we use **destructuring**:
   const { listingSchema } = require("./schema.js");
   → This extracts the "listingSchema" property from the exported object.

3. ❌ Incorrect import:
   const listingSchema = require("./schema.js");
   → This would import the entire object: { listingSchema: ... }
   → Using it directly will NOT work with listingSchema.validate(...).

Summary:
- Exported as a property → import with destructuring { propertyName }  
- Exported directly → import normally without destructuring
*/
