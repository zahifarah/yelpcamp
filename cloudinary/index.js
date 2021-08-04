const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// instance of cloudinary storage in this file
const storage = new CloudinaryStorage({
    cloudinary, // just configured above
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg",]
});

module.exports = {
    cloudinary,
    storage,
};