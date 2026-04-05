const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, //(cloud_name:) - this name should alway same
  api_key: process.env.CLOUD_API_KEY, // (api-key:) - this name should alway same
  api_secret: process.env.CLOUD_API_SECRET, // (api-secret:) - this name should alway same  
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowed_formats: ["png", "jpg", "jpeg"],
  },
});

module.exports = { cloudinary, storage };
